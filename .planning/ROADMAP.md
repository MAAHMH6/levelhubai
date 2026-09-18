# Roadmap

## Phase 1: Database Schema & Backend Setup
- **Goal**: Update Supabase database schema to support the new metadata and hierarchical structure (Units, Lessons).
- **Scope**: Migration of `curriculum_documents` and `curriculum_chunks`, creation of new tables if needed.

## Phase 2: Admin UI - Curriculum Management
- **Goal**: Build the UI for admins to upload, view, edit, and retry indexing for curriculums.
- **Scope**: Frontend React components for the Admin Panel.

## Phase 3: AI Pipeline - Extraction & Indexing
- **Goal**: Update the `index-curriculum-doc` edge function to perform hierarchical extraction via Gemini and vector chunking mapped to Lessons.
- **Scope**: Edge function logic, embedding calls, database insertions.

## Phase 4: AI Quiz Centre & Tutor Integrations
- **Goal**: Connect the student-facing AI tools to the newly indexed hierarchical data.
- **Scope**: Frontend Quiz and Tutor UI updates. `rag-quiz` and `ai-tutor` Edge Function updates for strict `lesson_id` filtering.

## Phase 5: General SEO & Multi-domain Best Practices
- **Goal**: Optimize SEO, enable cross-domain handling, and generate accurate Hreflang and Sitemaps.
- **Scope**: Geo-location redirects, BaseSeo metadata, and sitemap.xml updates.
