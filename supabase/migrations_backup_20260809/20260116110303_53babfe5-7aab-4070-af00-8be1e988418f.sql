-- Create ICT/Computer Science Topics for quiz questions
INSERT INTO public.topics (id, subject_id, name, order_index)
VALUES 
('b1000000-0000-0000-0000-000000000001', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 'Data Representation', 1),
('b1000000-0000-0000-0000-000000000002', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 'Networking', 2),
('b1000000-0000-0000-0000-000000000003', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 'Hardware', 3),
('b1000000-0000-0000-0000-000000000004', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 'Programming', 4);

-- Seed ICT/Computer Science Units (10 units)
-- ICT Subject ID: f249052a-6c35-4d36-b9f7-0e1f5bf213a7

-- Unit 1: Data Representation & Number Systems
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp)
VALUES 
('b2000000-0000-0000-0000-000000000001', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 1, 'Data Representation & Number Systems', 'Binary, hexadecimal, denary conversions, character encoding, sound and image representation, compression', '💾', '4-5 weeks', 4200);

-- Unit 2: Data Transmission & Networking
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000002', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2, 'Data Transmission & Networking', 'Data packets, transmission modes, error detection, network hardware, IP addressing', '🌐', '3-4 weeks', 3400, 'b2000000-0000-0000-0000-000000000001');

-- Unit 3: Computer Architecture
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000003', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 3, 'Computer Architecture', 'CPU components, ALU, registers, system buses, fetch-execute cycle', '🖥️', '3-4 weeks', 3000, 'b2000000-0000-0000-0000-000000000002');

-- Unit 4: Input & Output Devices
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000004', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 4, 'Input & Output Devices', 'Digital cameras, scanners, touchscreens, sensors, actuators, printers, projectors', '⌨️', '3 weeks', 2600, 'b2000000-0000-0000-0000-000000000003');

-- Unit 5: Sensors & Monitoring Systems
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000005', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 5, 'Sensors & Monitoring Systems', 'Sensor technology, control systems, monitoring applications', '📺', '2-3 weeks', 2400, 'b2000000-0000-0000-0000-000000000004');

-- Unit 6: Data Storage
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000006', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 6, 'Data Storage', 'RAM, ROM, secondary storage, SSDs, optical media, cloud storage', '💽', '2-3 weeks', 2200, 'b2000000-0000-0000-0000-000000000005');

-- Unit 7: Software & Security
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000007', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 7, 'Software & Security', 'System software, utilities, operating systems, programming languages, cybersecurity', '🔒', '4 weeks', 3600, 'b2000000-0000-0000-0000-000000000006');

-- Unit 8: Emerging Technologies
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000008', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 8, 'Emerging Technologies', 'Automation, robotics, artificial intelligence, machine learning', '🤖', '3 weeks', 2500, 'b2000000-0000-0000-0000-000000000007');

-- Unit 9: Programming & Algorithm Design
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000009', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 9, 'Programming & Algorithm Design', 'Algorithms, flowcharts, pseudocode, arrays, sorting, procedures, functions, file handling, Boolean logic', '💻', '6-8 weeks', 6500, 'b2000000-0000-0000-0000-000000000008');

-- Unit 10: Databases
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('b2000000-0000-0000-0000-000000000010', 'f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 10, 'Databases', 'Database structure, tables, records, fields, primary and foreign keys, SQL queries', '🗄️', '2 weeks', 1600, 'b2000000-0000-0000-0000-000000000009');