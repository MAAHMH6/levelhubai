-- Migration: Add Content Rights & Provenance Layer
-- Non-destructive additive migration

-- 1. Add fields to curriculum_documents
ALTER TABLE public.curriculum_documents
ADD COLUMN content_type text,
ADD COLUMN copyright_owner text,
ADD COLUMN permission_status text DEFAULT 'UNKNOWN',
ADD COLUMN allowed_student_view boolean DEFAULT false,
ADD COLUMN allowed_download boolean DEFAULT false,
ADD COLUMN allowed_ai_processing boolean DEFAULT false,
ADD COLUMN allowed_embedding boolean DEFAULT false,
ADD COLUMN allowed_quiz_generation boolean DEFAULT false,
ADD COLUMN allowed_external_ai boolean DEFAULT false,
ADD COLUMN review_status text;

-- 2. Add fields to curriculum_chunks
ALTER TABLE public.curriculum_chunks
ADD COLUMN content_type text,
ADD COLUMN allowed_external_ai boolean DEFAULT false,
ADD COLUMN allowed_quiz_generation boolean DEFAULT false;

-- 3. Add fields to past_papers (for UI toggles)
ALTER TABLE public.past_papers
ADD COLUMN is_proprietary boolean DEFAULT true,
ADD COLUMN external_url text;

-- 4. Question provenance for AI generated quizzes
ALTER TABLE public.ai_lesson_quiz
ADD COLUMN generation_source_type text,
ADD COLUMN generation_source_rights_status text,
ADD COLUMN review_status text DEFAULT 'REVIEW_REQUIRED';

ALTER TABLE public.quiz_sessions
ADD COLUMN generation_source_type text,
ADD COLUMN generation_source_rights_status text,
ADD COLUMN review_status text DEFAULT 'REVIEW_REQUIRED';

-- 5. Update RLS on curriculum-docs bucket to enforce allowed_student_view
-- First drop existing policy for reading
DROP POLICY IF EXISTS "Authenticated can read curriculum docs" ON storage.objects;

-- Create new policy that joins with curriculum_documents
CREATE POLICY "Authenticated can read authorized curriculum docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'curriculum-docs' 
    AND (
      EXISTS (
        SELECT 1 FROM public.curriculum_documents d
        WHERE d.storage_path = storage.objects.name
        AND d.allowed_student_view = true
      )
      OR 
      has_role(auth.uid(), 'admin')
    )
  );

-- Admins retain existing upload/update/delete policies.

-- 6. Update match_curriculum_chunks to strictly enforce AI limits
CREATE OR REPLACE FUNCTION "public"."match_curriculum_chunks"("query_embedding" "public"."vector", "match_count" integer DEFAULT 12, "filter_subject_id" "uuid" DEFAULT NULL::"uuid", "filter_unit_id" "uuid" DEFAULT NULL::"uuid", "filter_topic_id" "uuid" DEFAULT NULL::"uuid", "filter_lesson_id" "uuid" DEFAULT NULL::"uuid", "filter_doc_type" "text" DEFAULT NULL::"text", "filter_year" integer DEFAULT NULL::integer, "filter_paper_number" integer DEFAULT NULL::integer) RETURNS TABLE("id" "uuid", "document_id" "uuid", "chunk_text" "text", "page_number" integer, "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
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
    -- Strict AI provenence enforcement
    and d.allowed_quiz_generation = true
    and d.allowed_external_ai = true
    -- Other filters
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
