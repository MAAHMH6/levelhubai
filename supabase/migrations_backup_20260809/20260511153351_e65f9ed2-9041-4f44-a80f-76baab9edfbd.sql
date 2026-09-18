
-- Enable pgvector
create extension if not exists vector;

-- 1. Curriculum documents (PDFs uploaded by admin)
create table public.curriculum_documents (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete cascade,
  doc_type text not null check (doc_type in ('syllabus','past_paper','curriculum','notes')),
  source_name text not null,
  year integer,
  paper_number integer,
  variant integer,
  topic_tags text[] default '{}',
  pdf_url text,
  storage_path text,
  total_pages integer,
  total_chunks integer default 0,
  index_status text not null default 'pending' check (index_status in ('pending','processing','indexed','failed')),
  index_error text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.curriculum_documents enable row level security;

create policy "Anyone authenticated can view curriculum docs"
  on public.curriculum_documents for select
  to authenticated using (true);

create policy "Admins can insert curriculum docs"
  on public.curriculum_documents for insert
  to authenticated with check (has_role(auth.uid(),'admin'));

create policy "Admins can update curriculum docs"
  on public.curriculum_documents for update
  to authenticated using (has_role(auth.uid(),'admin'));

create policy "Admins can delete curriculum docs"
  on public.curriculum_documents for delete
  to authenticated using (has_role(auth.uid(),'admin'));

create trigger trg_curriculum_documents_updated
  before update on public.curriculum_documents
  for each row execute function public.update_updated_at_column();

-- 2. Curriculum chunks with embeddings
create table public.curriculum_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.curriculum_documents(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  chunk_index integer not null,
  page_number integer,
  chunk_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index curriculum_chunks_document_idx on public.curriculum_chunks(document_id);
create index curriculum_chunks_subject_idx on public.curriculum_chunks(subject_id);
create index curriculum_chunks_embedding_idx on public.curriculum_chunks
  using hnsw (embedding vector_cosine_ops);

alter table public.curriculum_chunks enable row level security;

create policy "Anyone authenticated can view chunks"
  on public.curriculum_chunks for select
  to authenticated using (true);

create policy "Admins can insert chunks"
  on public.curriculum_chunks for insert
  to authenticated with check (has_role(auth.uid(),'admin'));

create policy "Admins can update chunks"
  on public.curriculum_chunks for update
  to authenticated using (has_role(auth.uid(),'admin'));

create policy "Admins can delete chunks"
  on public.curriculum_chunks for delete
  to authenticated using (has_role(auth.uid(),'admin'));

-- 3. Quiz sessions (unified table)
create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  scope text not null check (scope in ('subject','unit','lesson','past_paper')),
  subject_id uuid references public.subjects(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  topic_ids uuid[] default '{}',
  year integer,
  paper_number integer,
  question_count integer not null default 10,
  questions jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  retrieved_chunk_ids uuid[] default '{}',
  score integer,
  total integer,
  percentage integer,
  xp_earned integer not null default 0,
  status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index quiz_sessions_user_idx on public.quiz_sessions(user_id);

alter table public.quiz_sessions enable row level security;

create policy "Users view own sessions"
  on public.quiz_sessions for select
  using (auth.uid() = user_id);

create policy "Users insert own sessions"
  on public.quiz_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users update own sessions"
  on public.quiz_sessions for update
  using (auth.uid() = user_id);

-- 4. Weak topics tracker
create table public.weak_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  topic_id uuid not null references public.topics(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  priority_score integer not null default 0,
  last_attempted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

create index weak_topics_user_idx on public.weak_topics(user_id);

alter table public.weak_topics enable row level security;

create policy "Users view own weak topics"
  on public.weak_topics for select using (auth.uid() = user_id);

create policy "Users insert own weak topics"
  on public.weak_topics for insert with check (auth.uid() = user_id);

create policy "Users update own weak topics"
  on public.weak_topics for update using (auth.uid() = user_id);

create trigger trg_weak_topics_updated
  before update on public.weak_topics
  for each row execute function public.update_updated_at_column();

-- 5. Similarity search function
create or replace function public.match_curriculum_chunks(
  query_embedding vector(1536),
  match_count int default 12,
  filter_subject_id uuid default null,
  filter_unit_id uuid default null,
  filter_topic_id uuid default null,
  filter_lesson_id uuid default null,
  filter_doc_type text default null,
  filter_year int default null,
  filter_paper_number int default null
)
returns table (
  id uuid,
  document_id uuid,
  chunk_text text,
  page_number int,
  metadata jsonb,
  similarity float
)
language sql stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.document_id,
    c.chunk_text,
    c.page_number,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.curriculum_chunks c
  join public.curriculum_documents d on d.id = c.document_id
  where c.embedding is not null
    and (filter_subject_id is null or c.subject_id = filter_subject_id)
    and (filter_unit_id is null or c.unit_id = filter_unit_id)
    and (filter_topic_id is null or c.topic_id = filter_topic_id)
    and (filter_lesson_id is null or c.lesson_id = filter_lesson_id)
    and (filter_doc_type is null or d.doc_type = filter_doc_type)
    and (filter_year is null or d.year = filter_year)
    and (filter_paper_number is null or d.paper_number = filter_paper_number)
  order by c.embedding <=> query_embedding
  limit match_count
$$;

-- 6. Storage bucket for curriculum PDFs
insert into storage.buckets (id, name, public)
values ('curriculum-docs','curriculum-docs', false)
on conflict (id) do nothing;

create policy "Authenticated can read curriculum docs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'curriculum-docs');

create policy "Admins can upload curriculum docs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'curriculum-docs' and has_role(auth.uid(),'admin'));

create policy "Admins can update curriculum docs"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'curriculum-docs' and has_role(auth.uid(),'admin'));

create policy "Admins can delete curriculum docs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'curriculum-docs' and has_role(auth.uid(),'admin'));
