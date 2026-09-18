# Requirements

## Epic: Curriculum Management & Structure

### Admin UI
- **Upload Form**: A form in the admin panel to upload a curriculum PDF.
  - Fields: Subject Name, Subject Code, Curriculum Provider / Book Name, Exam Board, Year / Edition.
- **Curriculum List**: A table to view all uploaded curriculums, their metadata, and their indexing status.
- **Curriculum Detail**: Ability to view a curriculum and its parsed structure (`Subject → Unit → Lesson`).
- **Actions**: Edit curriculum metadata, Delete curriculum, Retry/Re-index curriculum.

### Database Schema Updates
- Ensure `curriculum_documents` has tracking for the new metadata fields (`subject_code`, `provider`, `exam_board`, `edition`).
- Create/update tables for hierarchical taxonomy: `units`, `lessons`, `topics`.
- Update `curriculum_chunks` to reference `unit_id` and `lesson_id` for granular RAG.

## Epic: AI Pipeline & Extraction

### PDF Hierarchical Extraction
- Modify `index-curriculum-doc` to use Gemini to parse the PDF and extract a strict structured outline.
- The outline must be saved to the database (creating actual rows for Units and Lessons) so the chunks can reference them.

### Granular Vector Indexing (pgvector)
- As the PDF is chunked, map the text chunks to their specific Unit and Lesson based on the AI's extracted structure.
- Save embeddings using `pgvector` inside the `curriculum_chunks` table, linking each row to a `lesson_id`.
- Update the indexing status reliably: `processing`, `indexed`, `failed`. Provide clear error messages on failure.

## Epic: User-Facing Integrations

### AI Quiz Centre
- Update the Quiz Generation UI to strictly scope by `Subject → Unit → Lesson`.
- Update the `rag-quiz` Edge Function to query `curriculum_chunks` filtering strictly by `lesson_id = X` instead of doing a broad document-wide similarity search.
- Show "This lesson has not been indexed yet" if the selected lesson has zero chunks.

### AI Tutor
- Update the `ai-tutor` Edge Function to receive the selected `lesson_id`.
- Perform similarity search specifically within that `lesson_id`.
- Adjust the system prompt to restrict answers to the provided context, and notify the user if the question falls outside the selected curriculum section.
