-- Seed ICT Lessons - Unit 1 (24 lessons): Data Representation & Number Systems
INSERT INTO public.lessons (unit_id, lesson_number, title, topic_name, description, xp_reward, quiz_question_count, practice_question_count, video_duration_display, video_duration_seconds)
VALUES 
-- Topic 1.1: Number Systems & Conversions (9 lessons)
('b2000000-0000-0000-0000-000000000001', 1, 'Binary To Denary', 'Number Systems', 'Understanding binary number system, converting binary to denary, place value', 90, 15, 30, '43:34', 2614),
('b2000000-0000-0000-0000-000000000001', 2, 'Hexadecimal to Binary', 'Number Systems', 'Hexadecimal basics, converting to binary, nibble concept', 85, 12, 25, '39:08', 2348),
('b2000000-0000-0000-0000-000000000001', 3, 'Denary to Binary', 'Number Systems', 'Converting denary to binary using division method', 95, 15, 30, '46:46', 2806),
('b2000000-0000-0000-0000-000000000001', 4, 'Hexadecimal to Number Systems', 'Number Systems', 'Hexadecimal to denary and binary conversions', 100, 18, 35, '48:56', 2936),
('b2000000-0000-0000-0000-000000000001', 5, 'Number Systems Homework', 'Number Systems', 'Mixed conversion practice problems', 100, 18, 40, '48:02', 2882),
('b2000000-0000-0000-0000-000000000001', 6, 'Hexadecimal Number System', 'Number Systems', 'Hexadecimal digits (0-9, A-F), Base 16 system', 90, 15, 30, '42:44', 2564),
('b2000000-0000-0000-0000-000000000001', 7, 'Uses of Hexadecimal', 'Number Systems', 'MAC addresses, memory addresses, color codes', 100, 18, 35, '49:41', 2981),
('b2000000-0000-0000-0000-000000000001', 8, 'Uses of Hexadecimal | HTML', 'Number Systems', 'Hypertext Markup Language, color representation', 100, 18, 35, '47:58', 2878),
('b2000000-0000-0000-0000-000000000001', 9, 'Uses of Hexadecimal | HTML Code', 'Number Systems', 'Practical HTML color coding, RGB in hexadecimal', 90, 15, 30, '41:48', 2508),

-- Topic 1.2: Binary Operations & Manipulation (5 lessons)
('b2000000-0000-0000-0000-000000000001', 10, 'Addition of Binary Numbers', 'Binary Operations', 'Binary addition rules, carry operations', 90, 15, 35, '41:32', 2492),
('b2000000-0000-0000-0000-000000000001', 11, 'Logical Binary Shift', 'Binary Operations', 'Left and right shift operations, effects on values', 100, 18, 40, '49:15', 2955),
('b2000000-0000-0000-0000-000000000001', 12, 'Two''s Complement Method', 'Binary Operations', 'Representing negative numbers, range of values', 125, 22, 50, '1:01:48', 3708),
('b2000000-0000-0000-0000-000000000001', 13, 'Two''s Complement | Signed Numbers', 'Binary Operations', 'Signed binary arithmetic, overflow detection', 95, 15, 35, '45:48', 2748),
('b2000000-0000-0000-0000-000000000001', 14, 'Binary Operations Homework', 'Binary Operations', 'Mixed binary operations practice', 105, 18, 45, '51:19', 3079),

-- Topic 1.3: Character Encoding (2 lessons)
('b2000000-0000-0000-0000-000000000001', 15, 'ASCII & UNICODE', 'Character Encoding', 'Character encoding standards, ASCII table, Unicode UTF-8', 130, 25, 55, '1:04:28', 3868),
('b2000000-0000-0000-0000-000000000001', 16, 'Binary Number Systems Review', 'Character Encoding', 'Comprehensive review, mixed problems', 105, 18, 40, '51:43', 3103),

-- Topic 1.4: Multimedia Data Representation (8 lessons)
('b2000000-0000-0000-0000-000000000001', 17, 'Sound Representation', 'Multimedia', 'Analog to digital conversion, sample rate, resolution', 125, 22, 50, '1:00:13', 3613),
('b2000000-0000-0000-0000-000000000001', 18, 'Images', 'Multimedia', 'Bitmap images, pixels, resolution, color depth', 105, 18, 40, '50:39', 3039),
('b2000000-0000-0000-0000-000000000001', 19, 'File Size Calculation', 'Multimedia', 'Calculating image and sound file sizes', 85, 15, 35, '40:35', 2435),
('b2000000-0000-0000-0000-000000000001', 20, 'File Size Calculation Part 2', 'Multimedia', 'Advanced file size problems, video calculations', 95, 15, 40, '45:23', 2723),
('b2000000-0000-0000-0000-000000000001', 21, 'Data Compression', 'Multimedia', 'Need for compression, compression techniques', 110, 20, 45, '53:06', 3186),
('b2000000-0000-0000-0000-000000000001', 22, 'Compression | Lossy | JPEG', 'Multimedia', 'Lossy compression explained, JPEG format', 95, 15, 35, '46:41', 2801),
('b2000000-0000-0000-0000-000000000001', 23, 'Lossy & Lossless Compression', 'Multimedia', 'Comparison, RLE, Huffman coding basics', 180, 30, 70, '1:28:24', 5304),
('b2000000-0000-0000-0000-000000000001', 24, 'Data Representation Worksheet', 'Multimedia', 'Mixed data representation problems', 120, 20, 50, '58:17', 3497);