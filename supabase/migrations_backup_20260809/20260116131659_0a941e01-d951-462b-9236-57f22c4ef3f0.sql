-- Create Pakistan Studies subject
INSERT INTO public.subjects (id, name, description, icon, color) VALUES 
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pakistan Studies', 'Comprehensive O-Level Pakistan Studies covering Geography, History, and Civics (IGCSE 0448 / O Level 2059)', '🇵🇰', 'emerald');

-- Create Islamiyat subject
INSERT INTO public.subjects (id, name, description, icon, color) VALUES 
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Islamiyat', 'Complete O-Level Islamiyat curriculum covering Quran, Hadith, Islamic History and Practices (IGCSE 0493 / O Level 2058)', '☪️', 'teal');

-- Create Urdu subject
INSERT INTO public.subjects (id, name, description, icon, color) VALUES 
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Urdu', 'O-Level Urdu curriculum including Nasri Tukray, Nazm, Ghazal, Essay Writing and Comprehension (IGCSE 0539 / O Level 3248)', '📜', 'amber');

-- Create topics for all 3 subjects
INSERT INTO public.topics (id, name, subject_id, order_index) VALUES
-- Pakistan Studies topics
('a1b20001-0001-0001-0001-000000000001', 'Geography of Pakistan', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1),
('a1b20001-0001-0001-0001-000000000002', 'Economy & Development', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2),
('a1b20001-0001-0001-0001-000000000003', 'History of Pakistan', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3),
('a1b20001-0001-0001-0001-000000000004', 'Culture & Society', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4),
-- Islamiyat topics
('b2c30001-0001-0001-0001-000000000001', 'Quranic Themes', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 1),
('b2c30001-0001-0001-0001-000000000002', 'Hadith & Sunnah', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 2),
('b2c30001-0001-0001-0001-000000000003', 'Islamic History', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 3),
('b2c30001-0001-0001-0001-000000000004', 'Pillars of Islam', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 4),
-- Urdu topics
('c3d40001-0001-0001-0001-000000000001', 'Nasri Tukray (Prose)', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 1),
('c3d40001-0001-0001-0001-000000000002', 'Nazm (Poetry)', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 2),
('c3d40001-0001-0001-0001-000000000003', 'Ghazal', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 3),
('c3d40001-0001-0001-0001-000000000004', 'Essay & Letter Writing', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 4);