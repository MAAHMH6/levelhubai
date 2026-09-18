-- Drop the existing constraint
ALTER TABLE "public"."curriculum_documents" DROP CONSTRAINT IF EXISTS "curriculum_documents_index_status_check";

-- Add the new constraint with 'requires_mapping'
ALTER TABLE "public"."curriculum_documents" ADD CONSTRAINT "curriculum_documents_index_status_check" 
CHECK (("index_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'indexed'::"text", 'failed'::"text", 'requires_mapping'::"text"])));
