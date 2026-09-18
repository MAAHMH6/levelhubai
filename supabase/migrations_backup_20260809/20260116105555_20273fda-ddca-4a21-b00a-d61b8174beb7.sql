-- Seed Physics Lessons - Units 6-10
INSERT INTO public.lessons (unit_id, lesson_number, title, topic_name, description, xp_reward, quiz_question_count, practice_question_count, video_duration_display, video_duration_seconds)
VALUES 
-- Unit 6: Hydraulics & Pressure (8 lessons)
('a1000000-0000-0000-0000-000000000006', 1, 'Hydraulics | Pressure | Force/Area', 'Pressure Basics', 'Pressure definition and calculations', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000006', 2, 'Hydraulics | Pressure', 'Pressure Basics', 'Pressure in different contexts', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000006', 3, 'Pressure of Solids - Liquids', 'Pressure Basics', 'Pressure in solids, liquid and hydraulic pressure', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000006', 4, 'Force & Pressure/Heat & Temp', 'Pressure Basics', 'Relationships between quantities', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000006', 5, 'Pressure of/in Gases', 'Gas Pressure', 'Atmospheric pressure and gas pressure', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000006', 6, 'Pressure of Gases | Gas Laws', 'Gas Pressure', 'Boyle''s law, Charles''s law, Pressure law', 135, 25, 55, '52:00', 3120),
('a1000000-0000-0000-0000-000000000006', 7, 'Hydraulic Brake Systems', 'Gas Pressure', 'Pascal''s principle and applications', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000006', 8, 'Diffusion & Brownian Motion', 'Gas Pressure', 'Particle movement and evidence for particles', 115, 20, 40, '42:00', 2520),

-- Unit 7: Thermal Physics (5 lessons)
('a1000000-0000-0000-0000-000000000007', 1, 'Thermal Expansion of Solids & Liquids', 'Thermal Expansion', 'Linear and volume expansion, applications', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000007', 2, 'Thermal Expansion of Matter', 'Thermal Expansion', 'Advanced thermal expansion concepts', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000007', 3, 'Heat Transfer | Conduction', 'Heat Transfer', 'Conduction in solids, conductors and insulators', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000007', 4, 'Heat Transfer | Convection', 'Heat Transfer', 'Convection in fluids, natural and forced', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000007', 5, 'Heat Transfer | Radiation', 'Heat Transfer', 'Infrared radiation, absorption and emission', 115, 20, 40, '42:00', 2520),

-- Unit 8: Waves (11 lessons)
('a1000000-0000-0000-0000-000000000008', 1, 'Introduction to Waves', 'Wave Basics', 'Wave properties: wavelength, frequency, amplitude', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000008', 2, 'Waves Intro | Part 2', 'Wave Basics', 'Wave equation and speed of waves', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000008', 3, 'Wave Motion | Types of Waves', 'Wave Basics', 'Transverse and longitudinal waves', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000008', 4, 'Sound & Light', 'Wave Basics', 'Sound waves, light waves and properties comparison', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000008', 5, 'Wave Phenomenon | Diffraction', 'Wave Phenomena', 'Diffraction effects and patterns', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000008', 6, 'Wave Phenomenon | Reflection', 'Wave Phenomena', 'Reflection of waves and laws of reflection', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000008', 7, 'Wave Phenomenon | Refraction', 'Wave Phenomena', 'Refraction and Snell''s law', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000008', 8, 'Light | Mirrors', 'Wave Phenomena', 'Plane and curved mirrors, image formation', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000008', 9, 'Light | Lenses', 'Wave Phenomena', 'Convex and concave lenses, focal length', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000008', 10, 'Electromagnetic Spectrum', 'Wave Phenomena', 'Types of EM waves and their uses', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000008', 11, 'Wave Applications', 'Wave Phenomena', 'Real-world applications of waves', 120, 20, 45, '45:00', 2700),

-- Unit 9: Electrical Physics (3 lessons)
('a1000000-0000-0000-0000-000000000009', 1, 'Electrical Physics Introduction', 'Electricity', 'Current, voltage, resistance basics', 110, 18, 40, '40:00', 2400),
('a1000000-0000-0000-0000-000000000009', 2, 'Charge - Current - pd - Resistance', 'Electricity', 'Charge flow, potential difference, Ohm''s law', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000009', 3, 'Circuit Combination', 'Electricity', 'Series and parallel circuits, calculations', 125, 22, 50, '48:00', 2880),

-- Unit 10: Electromagnetism & Nuclear Physics (2 lessons)
('a1000000-0000-0000-0000-000000000010', 1, 'Electromagnetism - Nuclear Physics', 'Nuclear Physics', 'Magnetic fields, electromagnetic induction, radioactivity', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000010', 2, 'Nuclear Physics - Astrophysics', 'Nuclear Physics', 'Nuclear structure, radioactive decay, half-life, stars', 140, 28, 60, '55:00', 3300);