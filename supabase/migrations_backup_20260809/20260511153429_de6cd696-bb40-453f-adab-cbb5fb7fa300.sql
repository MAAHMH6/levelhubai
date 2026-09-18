
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
security invoker
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

revoke execute on function public.match_curriculum_chunks(vector, int, uuid, uuid, uuid, uuid, text, int, int) from public, anon;
grant execute on function public.match_curriculum_chunks(vector, int, uuid, uuid, uuid, uuid, text, int, int) to authenticated;
