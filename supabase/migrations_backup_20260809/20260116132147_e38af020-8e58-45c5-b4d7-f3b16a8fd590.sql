-- Islamiyat Lessons (key lessons across 10 units)
INSERT INTO public.lessons (unit_id, lesson_number, title, topic_name, description, xp_reward, quiz_question_count, practice_question_count) VALUES
('b2c3d401-0001-0001-0001-000000000001', 1, 'Tawheed - Oneness of Allah', 'Core Belief', 'Concept of Tawheed, evidence from Quran, Shirk', 135, 15, 25),
('b2c3d401-0001-0001-0001-000000000001', 2, 'Asma-ul-Husna', 'Names of Allah', '99 Names, meanings, application', 142, 15, 25),
('b2c3d401-0001-0001-0001-000000000001', 3, 'Risalat - Prophethood', 'Divine Messengers', 'Need for prophets, chain of prophethood', 138, 15, 25),
('b2c3d401-0001-0001-0001-000000000001', 4, 'Akhirah - Day of Judgment', 'Afterlife', 'Resurrection, Jannah, Jahannam', 140, 15, 25),
('b2c3d401-0001-0001-0001-000000000002', 1, 'Introduction to Hadith', 'Hadith Science', 'Classification, authenticity, importance', 135, 15, 25),
('b2c3d401-0001-0001-0001-000000000002', 2, 'Selected Ahadith - Part 1', 'Teachings', 'Key Ahadith with explanations', 138, 15, 25),
('b2c3d401-0001-0001-0001-000000000003', 1, 'Early Life of Prophet (PBUH)', 'Seerah', 'Birth to prophethood', 140, 15, 25),
('b2c3d401-0001-0001-0001-000000000003', 2, 'Character of Prophet (PBUH)', 'Akhlaq', 'Moral qualities and teachings', 145, 15, 25),
('b2c3d401-0001-0001-0001-000000000006', 1, 'Hazrat Abu Bakr (RA)', 'First Caliph', 'Life, caliphate, achievements', 142, 15, 25),
('b2c3d401-0001-0001-0001-000000000006', 2, 'Hazrat Umar (RA)', 'Second Caliph', 'Conquests, administration, justice', 145, 15, 25),
('b2c3d401-0001-0001-0001-000000000007', 1, 'Salah - Prayer', 'Pillar of Islam', 'Importance, method, types', 138, 15, 25),
('b2c3d401-0001-0001-0001-000000000007', 2, 'Zakat & Sawm', 'Pillars of Islam', 'Charity and fasting', 135, 15, 25);

-- Urdu Lessons (key lessons across 8 units)
INSERT INTO public.lessons (unit_id, lesson_number, title, topic_name, description, xp_reward, quiz_question_count, practice_question_count) VALUES
('c3d4e501-0001-0001-0001-000000000001', 1, 'Nasri Tukray - Introduction', 'Prose Basics', 'Types of prose writing', 110, 15, 25),
('c3d4e501-0001-0001-0001-000000000001', 2, 'Classical Prose - Premchand', 'Literature', 'Social themes and analysis', 125, 15, 25),
('c3d4e501-0001-0001-0001-000000000002', 1, 'Nazm - Introduction', 'Poetry Forms', 'Poetry forms and meters', 125, 15, 25),
('c3d4e501-0001-0001-0001-000000000002', 2, 'Allama Iqbal Poetry', 'Classical Nazm', 'Shikwa, Jawab-e-Shikwa', 145, 15, 25),
('c3d4e501-0001-0001-0001-000000000003', 1, 'Ghazal - Introduction', 'Poetry Form', 'Structure and conventions', 130, 15, 25),
('c3d4e501-0001-0001-0001-000000000003', 2, 'Mirza Ghalib', 'Ghazal Master', 'Selected ghazals and analysis', 140, 15, 25),
('c3d4e501-0001-0001-0001-000000000004', 1, 'Essay Writing Basics', 'Mazmoon Nigari', 'Structure and techniques', 125, 15, 25),
('c3d4e501-0001-0001-0001-000000000005', 1, 'Letter Writing', 'Khat Nigari', 'Personal and official letters', 120, 15, 25),
('c3d4e501-0001-0001-0001-000000000006', 1, 'Urdu Grammar Basics', 'Qawaid', 'Parts of speech, sentence structure', 130, 15, 25);

-- Past Papers for all 3 subjects
INSERT INTO public.past_papers (subject_id, year, session, paper_number, variant, exam_board, total_marks, duration_minutes, xp_reward) VALUES
-- Pakistan Studies Papers
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2024, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2024, 'Oct/Nov', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2023, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2023, 'Oct/Nov', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2022, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
-- Islamiyat Papers
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 'Oct/Nov', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2023, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2023, 'Oct/Nov', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2022, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 90, 250),
-- Urdu Papers
('c3d4e5f6-a7b8-9012-cdef-123456789012', 2024, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 120, 250),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 2024, 'Oct/Nov', 1, 1, 'Cambridge IGCSE', 80, 120, 250),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 2023, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 120, 250),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 2023, 'Oct/Nov', 1, 1, 'Cambridge IGCSE', 80, 120, 250),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 2022, 'May/June', 1, 1, 'Cambridge IGCSE', 80, 120, 250);

-- Quiz Questions for all 3 subjects
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
-- Pakistan Studies Questions
('a1b20001-0001-0001-0001-000000000001', 'What is the second highest peak in the world located in Pakistan?', 'mcq', '["Mount Everest", "K2", "Nanga Parbat", "Broad Peak"]', 'K2', 'K2 (8,611m) is located in the Karakoram range in Pakistan and is the second highest peak in the world.', 1, 10, 30),
('a1b20001-0001-0001-0001-000000000001', 'Which river system is the lifeline of Pakistan?', 'mcq', '["Ganges", "Brahmaputra", "Indus", "Yamuna"]', 'Indus', 'The Indus River system, with its tributaries, provides water for irrigation to most of Pakistan.', 1, 10, 30),
('a1b20001-0001-0001-0001-000000000003', 'In which year was the Muslim League founded?', 'mcq', '["1885", "1906", "1940", "1947"]', '1906', 'The All India Muslim League was founded on December 30, 1906 at Dhaka.', 2, 15, 30),
('a1b20001-0001-0001-0001-000000000003', 'Who delivered the famous Allahabad Address in 1930?', 'mcq', '["Quaid-e-Azam", "Allama Iqbal", "Sir Syed Ahmed Khan", "Liaquat Ali Khan"]', 'Allama Iqbal', 'Allama Iqbal presented the idea of a separate Muslim state in his presidential address at Allahabad in 1930.', 2, 15, 30),
-- Islamiyat Questions
('b2c30001-0001-0001-0001-000000000001', 'What is the meaning of Tawheed?', 'mcq', '["Prayer", "Fasting", "Oneness of Allah", "Charity"]', 'Oneness of Allah', 'Tawheed is the fundamental Islamic belief in the absolute oneness and uniqueness of Allah.', 1, 10, 30),
('b2c30001-0001-0001-0001-000000000001', 'How many names of Allah are mentioned in Asma-ul-Husna?', 'mcq', '["66", "77", "88", "99"]', '99', 'Asma-ul-Husna refers to the 99 beautiful names of Allah mentioned in Islamic tradition.', 1, 10, 30),
('b2c30001-0001-0001-0001-000000000004', 'Who was the first caliph of Islam?', 'mcq', '["Hazrat Umar (RA)", "Hazrat Abu Bakr (RA)", "Hazrat Uthman (RA)", "Hazrat Ali (RA)"]', 'Hazrat Abu Bakr (RA)', 'Hazrat Abu Bakr Siddiq (RA) was elected as the first caliph after the death of Prophet Muhammad (PBUH).', 1, 10, 30),
('b2c30001-0001-0001-0001-000000000004', 'How many pillars of Islam are there?', 'mcq', '["3", "4", "5", "6"]', '5', 'The five pillars are: Shahadah, Salah, Zakat, Sawm, and Hajj.', 1, 10, 30),
-- Urdu Questions  
('c3d40001-0001-0001-0001-000000000001', 'Deputy Nazir Ahmad is famous for which novel?', 'mcq', '["Umrao Jan Ada", "Mirat-ul-Uroos", "Aag ka Darya", "Udas Naslein"]', 'Mirat-ul-Uroos', 'Deputy Nazir Ahmad wrote Mirat-ul-Uroos, one of the earliest Urdu novels.', 2, 15, 30),
('c3d40001-0001-0001-0001-000000000002', 'Shikwa and Jawab-e-Shikwa were written by?', 'mcq', '["Faiz Ahmed Faiz", "Allama Iqbal", "Mirza Ghalib", "Ahmed Faraz"]', 'Allama Iqbal', 'Allama Iqbal wrote these famous philosophical poems addressing the Muslim community and divine response.', 1, 10, 30),
('c3d40001-0001-0001-0001-000000000003', 'Who is known as the greatest Ghazal poet in Urdu literature?', 'mcq', '["Mir Taqi Mir", "Mirza Ghalib", "Faiz Ahmed Faiz", "Ahmed Faraz"]', 'Mirza Ghalib', 'Mirza Ghalib is widely regarded as the greatest Urdu poet, especially known for his ghazals.', 1, 10, 30),
('c3d40001-0001-0001-0001-000000000003', 'A Ghazal must have at least how many couplets (ashaar)?', 'mcq', '["3", "5", "7", "10"]', '5', 'A proper Ghazal traditionally consists of at least 5 couplets with a common rhyme scheme.', 2, 15, 30);