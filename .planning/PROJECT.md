# Project: Curriculum Intelligence & AI Integration

## What This Is
We are building a comprehensive Curriculum Management and RAG-based AI system for the LevelHub admin panel and student dashboard. 

The goal is to automatically extract, structure, and index syllabus documents (PDFs) into a rigid hierarchy (`Subject → Unit → Lesson → Topic → Subtopic`). We will then connect this structured index to the AI Quiz Centre and AI Tutor so that students can generate quizzes and ask questions explicitly scoped to a selected Unit or Lesson, preventing hallucination and ensuring targeted studying.

## Requirements

### Validated
- ✓ Supabase is used as the primary database, including storage of documents.
- ✓ An existing Edge Function (`index-curriculum-doc`) exists which attempts to chunk and index PDFs, utilizing Gemini for structured extraction and Lovable Gateway for embeddings. 
- ✓ Auth and premium access logic is established.

### Active
- [ ] **Curriculum Upload**: Admin UI to upload curriculum PDF and assign metadata (Name, Code, Provider, Board, Year/Edition).
- [ ] **Curriculum Management**: Admin dashboard to view, edit, and delete curriculums and their hierarchal items.
- [ ] **Hierarchical Extraction**: Extract PDF content into `Subject → Unit → Lesson → Topic → Subtopic` structure (using Gemini/LLM).
- [ ] **Granular Vector Indexing (pgvector)**: Store individual sections and embeddings mapped to their explicit structural nodes (Unit/Lesson/Topic) in Supabase.
- [ ] **Indexing Status Tracking**: Show granular status (Not Indexed, Processing, Indexed, Failed) with counts and retry options in Admin UI.
- [ ] **AI Quiz Centre Integration**: Students can select a Subject → Unit → Lesson and generate quiz questions sourced *only* from that lesson's vector scope.
- [ ] **AI Tutor Integration**: AI Tutor contexts its knowledge base to the selected Lesson/Unit.

### Out of Scope
- [ ] Using Pinecone (Decided to use Supabase `pgvector` instead to maintain consistency).
- [ ] Completely rewriting the entire indexer from scratch (Will extend the existing `index-curriculum-doc` edge function).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Supabase `pgvector` | The user explicitly requested switching to pgvector instead of Pinecone to keep data and embeddings in the same DB. | — Pending |
| Extend existing Edge Function | `index-curriculum-doc` already calls Gemini and handles basic embeddings. We will modify it to handle hierarchical parsing and fine-grained chunking. | — Pending |
| Hierarchical RAG Scoping | We need to store exact `unit_id` and `lesson_id` on chunks to allow strict WHERE filtering when generating AI Quizzes. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
---
*Last updated: 2026-08-01 after initialization*
