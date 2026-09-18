-- Seed Physics Units (10 units)
-- Physics Subject ID: 04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3

-- Unit 1: Physical Quantities & Measurements
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp)
VALUES 
('a1000000-0000-0000-0000-000000000001', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 1, 'Physical Quantities & Measurements', 'Understanding base and derived quantities, length, area, volume, mass and weight measurements', '📐', '4-5 weeks', 3800);

-- Unit 2: States of Matter & Temperature
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000002', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 2, 'States of Matter & Temperature', 'Solids, liquids, gases, temperature, heat energy, heat capacity and latent heat', '🌡️', '2-3 weeks', 1600, 'a1000000-0000-0000-0000-000000000001');

-- Unit 3: Kinematics - Motion
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000003', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 3, 'Kinematics - Motion', 'Distance, displacement, speed, velocity, acceleration and motion analysis', '🏃', '4-5 weeks', 3500, 'a1000000-0000-0000-0000-000000000002');

-- Unit 4: Dynamics - Forces & Motion
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000004', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 4, 'Dynamics - Forces & Motion', 'Newton''s laws, types of forces, moments and equilibrium', '⚡', '4-5 weeks', 4200, 'a1000000-0000-0000-0000-000000000003');

-- Unit 5: Energetics - Work, Energy & Power
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000005', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 5, 'Energetics - Work, Energy & Power', 'Work done, kinetic and potential energy, power and efficiency', '⚡', '2-3 weeks', 1800, 'a1000000-0000-0000-0000-000000000004');

-- Unit 6: Hydraulics & Pressure
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000006', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 6, 'Hydraulics & Pressure', 'Pressure in solids, liquids and gases, gas laws and hydraulic systems', '💧', '3-4 weeks', 2400, 'a1000000-0000-0000-0000-000000000005');

-- Unit 7: Thermal Physics
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000007', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 7, 'Thermal Physics', 'Thermal expansion, heat transfer methods: conduction, convection and radiation', '🔥', '2-3 weeks', 1400, 'a1000000-0000-0000-0000-000000000006');

-- Unit 8: Waves
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000008', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 8, 'Waves', 'Wave properties, types of waves, sound and light, wave phenomena', '🌊', '4-5 weeks', 3200, 'a1000000-0000-0000-0000-000000000007');

-- Unit 9: Electrical Physics
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000009', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 9, 'Electrical Physics', 'Current, voltage, resistance, Ohm''s law and circuit combinations', '⚡', '2-3 weeks', 900, 'a1000000-0000-0000-0000-000000000008');

-- Unit 10: Electromagnetism & Nuclear Physics
INSERT INTO public.units (id, subject_id, unit_number, title, description, icon_emoji, duration_weeks, total_xp, prerequisite_unit_id)
VALUES 
('a1000000-0000-0000-0000-000000000010', '04b0e4e8-5cb2-4692-93e8-9250a3f9f4b3', 10, 'Electromagnetism & Nuclear Physics', 'Magnetic fields, electromagnetic induction, radioactivity, nuclear physics and astrophysics', '☢️', '2-3 weeks', 700, 'a1000000-0000-0000-0000-000000000009');