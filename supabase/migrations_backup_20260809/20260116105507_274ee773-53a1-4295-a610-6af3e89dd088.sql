-- Seed Physics Lessons - Units 2-5
INSERT INTO public.lessons (unit_id, lesson_number, title, topic_name, description, xp_reward, quiz_question_count, practice_question_count, video_duration_display, video_duration_seconds)
VALUES 
-- Unit 2: States of Matter & Temperature (9 lessons)
('a1000000-0000-0000-0000-000000000002', 1, 'Physical State of Matter', 'States of Matter', 'Solids, liquids, gases and particle model', 95, 15, 30, '32:00', 1920),
('a1000000-0000-0000-0000-000000000002', 2, 'Temperature & Heat', 'States of Matter', 'Temperature vs heat and thermal equilibrium', 95, 15, 30, '32:00', 1920),
('a1000000-0000-0000-0000-000000000002', 3, 'Solids/Liquids/Gases', 'States of Matter', 'Properties of states and state changes', 100, 15, 35, '35:00', 2100),
('a1000000-0000-0000-0000-000000000002', 4, 'Mass/Weight | Density', 'States of Matter', 'Density and states of matter', 105, 18, 35, '38:00', 2280),
('a1000000-0000-0000-0000-000000000002', 5, 'Temperature & Heat | Part 2', 'Temperature & Heat', 'Heat transfer and thermal energy', 100, 15, 35, '35:00', 2100),
('a1000000-0000-0000-0000-000000000002', 6, 'Heat Capacity | Latent Heat', 'Temperature & Heat', 'Specific heat capacity and latent heat', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000002', 7, 'Heat Curve', 'Temperature & Heat', 'Heating/cooling curves and phase changes', 95, 15, 30, '32:00', 1920),
('a1000000-0000-0000-0000-000000000002', 8, 'Heat Capacity Calculations', 'Temperature & Heat', 'Calculations with heat capacity', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000002', 9, 'Electrical Charge Intro', 'Temperature & Heat', 'Introduction to charge and static electricity', 90, 15, 25, '30:00', 1800),

-- Unit 3: Kinematics - Motion (14 lessons)
('a1000000-0000-0000-0000-000000000003', 1, 'State of Motion | Distance | Displacement', 'Distance & Displacement', 'Scalar vs vector quantities', 110, 18, 35, '40:00', 2400),
('a1000000-0000-0000-0000-000000000003', 2, 'Distance | Displacement | Part 2', 'Distance & Displacement', 'Advanced displacement problems', 110, 18, 35, '40:00', 2400),
('a1000000-0000-0000-0000-000000000003', 3, 'Average Speed | Average Velocity', 'Distance & Displacement', 'Speed vs velocity and average calculations', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000003', 4, 'Types of Speed', 'Distance & Displacement', 'Uniform and non-uniform speed', 105, 18, 35, '38:00', 2280),
('a1000000-0000-0000-0000-000000000003', 5, 'Kinematics | Acceleration', 'Acceleration', 'Definition and calculation of acceleration', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000003', 6, 'Acceleration | Deceleration', 'Acceleration', 'Negative acceleration and retardation', 110, 18, 35, '40:00', 2400),
('a1000000-0000-0000-0000-000000000003', 7, 'Free Fall Motion', 'Acceleration', 'Acceleration due to gravity and free fall equations', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000003', 8, 'Free Fall | Upward Motion', 'Acceleration', 'Projectile motion and maximum height', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000003', 9, 'Free Fall | Worksheet', 'Motion Analysis', 'Practice problems on free fall', 110, 18, 40, '40:00', 2400),
('a1000000-0000-0000-0000-000000000003', 10, 'Motion with Reference to Force', 'Motion Analysis', 'Force and motion relationship', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000003', 11, 'Motion and Forces', 'Motion Analysis', 'Newton''s laws introduction', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000003', 12, 'Graphical Approach', 'Motion Analysis', 'Distance-time and speed-time graphs', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000003', 13, 'Speed-Time Distance-Time Graphs', 'Motion Analysis', 'Gradient and area under graphs', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000003', 14, 'Dynamics | Forces', 'Motion Analysis', 'Types of forces and force diagrams', 115, 20, 40, '42:00', 2520),

-- Unit 4: Dynamics - Forces & Motion (17 lessons)
('a1000000-0000-0000-0000-000000000004', 1, 'Newton''s Laws of Motion', 'Newton''s Laws', 'First, second, third laws and applications', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000004', 2, 'Dynamics | Force as Vector', 'Newton''s Laws', 'Force as a vector and resultant force', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000004', 3, 'Force and Acceleration', 'Newton''s Laws', 'F=ma relationship', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000004', 4, 'Motion & Forces', 'Newton''s Laws', 'Problem solving with Newton''s laws', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000004', 5, 'Motion + Forces | Advanced', 'Newton''s Laws', 'Advanced applications', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000004', 6, 'Types of Forces', 'Newton''s Laws', 'Contact and non-contact forces', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000004', 7, 'Motion with Forces', 'Types of Forces', 'Force analysis in motion', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000004', 8, 'Effects of Forces', 'Types of Forces', 'Deformation, acceleration, direction change', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000004', 9, 'Hooke''s Law', 'Types of Forces', 'Extension and springs, elastic limit', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000004', 10, 'Hooke''s Law | Part 2', 'Types of Forces', 'Calculations and applications', 120, 20, 45, '45:00', 2700),
('a1000000-0000-0000-0000-000000000004', 11, 'Special Forces', 'Moments & Equilibrium', 'Friction, tension, normal force', 115, 20, 40, '42:00', 2520),
('a1000000-0000-0000-0000-000000000004', 12, 'Centripetal Force', 'Moments & Equilibrium', 'Circular motion and centripetal acceleration', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000004', 13, 'Moment of a Force', 'Moments & Equilibrium', 'Turning effect and moment calculations', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000004', 14, 'Moment of a Force | Part 2', 'Moments & Equilibrium', 'Advanced moment problems', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000004', 15, 'Equilibrium', 'Moments & Equilibrium', 'Balanced forces and principle of moments', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000004', 16, 'Equilibrium | Part 2', 'Moments & Equilibrium', 'Complex equilibrium problems', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000004', 17, 'Center of Gravity', 'Moments & Equilibrium', 'Center of mass and stability', 125, 22, 45, '48:00', 2880),

-- Unit 5: Energetics (4 lessons)
('a1000000-0000-0000-0000-000000000005', 1, 'Work & Energy', 'Work, Energy & Power', 'Work done by a force and energy transfers', 130, 25, 50, '50:00', 3000),
('a1000000-0000-0000-0000-000000000005', 2, 'Work - Energy - Power', 'Work, Energy & Power', 'Power calculations and efficiency', 135, 25, 55, '52:00', 3120),
('a1000000-0000-0000-0000-000000000005', 3, 'Types of Energy', 'Work, Energy & Power', 'Kinetic, potential energy and conservation', 125, 22, 50, '48:00', 2880),
('a1000000-0000-0000-0000-000000000005', 4, 'Hydraulics & Energy', 'Work, Energy & Power', 'Energy in hydraulic systems', 120, 20, 45, '45:00', 2700);