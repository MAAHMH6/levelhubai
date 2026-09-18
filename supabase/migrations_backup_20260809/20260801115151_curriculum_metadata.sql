-- Add metadata fields to curriculum_documents if they do not exist
DO $$ BEGIN
    ALTER TABLE public.curriculum_documents
    ADD COLUMN subject_code TEXT,
    ADD COLUMN provider TEXT,
    ADD COLUMN exam_board TEXT,
    ADD COLUMN edition TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
