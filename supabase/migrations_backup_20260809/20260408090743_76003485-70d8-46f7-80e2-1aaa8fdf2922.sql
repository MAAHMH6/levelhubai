
-- Create topics for Chemistry
INSERT INTO public.topics (id, subject_id, name, order_index) VALUES
('d1000000-0000-0000-0000-000000000001', '5f1acad5-c73c-4156-b56e-b99997e52b35', 'Atomic Structure', 1),
('d1000000-0000-0000-0000-000000000002', '5f1acad5-c73c-4156-b56e-b99997e52b35', 'Chemical Bonding', 2),
('d1000000-0000-0000-0000-000000000003', '5f1acad5-c73c-4156-b56e-b99997e52b35', 'Acids, Bases & Salts', 3),
('d1000000-0000-0000-0000-000000000004', '5f1acad5-c73c-4156-b56e-b99997e52b35', 'Organic Chemistry', 4);

-- Create topics for Biology
INSERT INTO public.topics (id, subject_id, name, order_index) VALUES
('e1000000-0000-0000-0000-000000000001', 'f291da7d-59d4-470d-8437-f2117f026ee4', 'Cell Biology', 1),
('e1000000-0000-0000-0000-000000000002', 'f291da7d-59d4-470d-8437-f2117f026ee4', 'Human Biology', 2),
('e1000000-0000-0000-0000-000000000003', 'f291da7d-59d4-470d-8437-f2117f026ee4', 'Plant Biology', 3),
('e1000000-0000-0000-0000-000000000004', 'f291da7d-59d4-470d-8437-f2117f026ee4', 'Ecology', 4);

-- Create topics for English
INSERT INTO public.topics (id, subject_id, name, order_index) VALUES
('f1000000-0000-0000-0000-000000000001', '8082b9e0-36d3-440b-9ca2-6bab67473da6', 'Reading Comprehension', 1),
('f1000000-0000-0000-0000-000000000002', '8082b9e0-36d3-440b-9ca2-6bab67473da6', 'Grammar & Vocabulary', 2),
('f1000000-0000-0000-0000-000000000003', '8082b9e0-36d3-440b-9ca2-6bab67473da6', 'Writing Skills', 3),
('f1000000-0000-0000-0000-000000000004', '8082b9e0-36d3-440b-9ca2-6bab67473da6', 'Literature', 4);

-- Create topics for Accounting
INSERT INTO public.topics (id, subject_id, name, order_index) VALUES
('a2000000-0000-0000-0000-000000000001', 'ccbb2c24-2412-4261-8f55-016e33b0909f', 'Double Entry & Books of Account', 1),
('a2000000-0000-0000-0000-000000000002', 'ccbb2c24-2412-4261-8f55-016e33b0909f', 'Financial Statements', 2),
('a2000000-0000-0000-0000-000000000003', 'ccbb2c24-2412-4261-8f55-016e33b0909f', 'Depreciation & Provisions', 3),
('a2000000-0000-0000-0000-000000000004', 'ccbb2c24-2412-4261-8f55-016e33b0909f', 'Partnership Accounts', 4);

-- ===== PHYSICS QUESTIONS (add 10 more per topic) =====

-- Motion & Forces
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'What is the SI unit of acceleration?', 'mcq', '["m/s", "m/s²", "km/h", "N"]', 'm/s²', 'Acceleration is the rate of change of velocity, measured in metres per second squared.', 1, 10, 30),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'A car travels 100 m in 10 s at constant speed. What is its speed?', 'mcq', '["5 m/s", "10 m/s", "15 m/s", "20 m/s"]', '10 m/s', 'Speed = distance/time = 100/10 = 10 m/s.', 1, 10, 30),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'Newton''s third law states that every action has an equal and opposite...', 'mcq', '["Force", "Reaction", "Momentum", "Energy"]', 'Reaction', 'Newton''s third law: for every action there is an equal and opposite reaction.', 2, 10, 30),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'What is the formula for weight?', 'mcq', '["W = mg", "W = mv", "W = ma/2", "W = Fd"]', 'W = mg', 'Weight equals mass multiplied by gravitational field strength.', 1, 10, 30),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'Terminal velocity occurs when the resultant force on an object is...', 'mcq', '["Maximum", "Zero", "Increasing", "Decreasing"]', 'Zero', 'At terminal velocity, air resistance equals weight so resultant force is zero.', 2, 10, 30),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'Friction always acts in the direction...', 'mcq', '["Of motion", "Opposite to motion", "Perpendicular to motion", "Upwards"]', 'Opposite to motion', 'Friction opposes the relative motion between surfaces.', 1, 10, 30),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'The gradient of a distance-time graph gives...', 'mcq', '["Acceleration", "Speed", "Force", "Momentum"]', 'Speed', 'The slope of a distance-time graph represents speed.', 2, 10, 30),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'An object at rest has zero velocity.', 'true_false', '["True", "False"]', 'True', 'An object at rest is not moving so its velocity is zero.', 1, 10, 20),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'Mass and weight are the same thing.', 'true_false', '["True", "False"]', 'False', 'Mass is the amount of matter (kg); weight is the force of gravity on mass (N).', 1, 10, 20),
('02b0b331-c14c-4df2-be13-2d8b24897e28', 'What is the unit of momentum?', 'mcq', '["kg m/s", "N/m", "J", "W"]', 'kg m/s', 'Momentum = mass × velocity, so its unit is kg m/s.', 2, 10, 30);

-- Energy
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'What is the formula for kinetic energy?', 'mcq', '["KE = mv", "KE = ½mv²", "KE = mgh", "KE = Fd"]', 'KE = ½mv²', 'Kinetic energy equals half times mass times velocity squared.', 1, 10, 30),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'Which type of energy does a stretched spring have?', 'mcq', '["Kinetic", "Gravitational potential", "Elastic potential", "Thermal"]', 'Elastic potential', 'A stretched or compressed spring stores elastic potential energy.', 1, 10, 30),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'Energy cannot be created or destroyed.', 'true_false', '["True", "False"]', 'True', 'This is the law of conservation of energy.', 1, 10, 20),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'What is the unit of power?', 'mcq', '["Joule", "Watt", "Newton", "Pascal"]', 'Watt', 'Power is measured in watts (W), which equals joules per second.', 1, 10, 30),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'A 2 kg object is lifted 5 m. How much GPE does it gain? (g = 10 m/s²)', 'mcq', '["10 J", "50 J", "100 J", "25 J"]', '100 J', 'GPE = mgh = 2 × 10 × 5 = 100 J.', 2, 10, 30),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'Efficiency is always less than 100% in real machines.', 'true_false', '["True", "False"]', 'True', 'Some energy is always wasted as heat due to friction.', 1, 10, 20),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'What is the formula for power?', 'mcq', '["P = E/t", "P = Fv²", "P = mgh/v", "P = ½mv"]', 'P = E/t', 'Power equals energy transferred divided by time.', 2, 10, 30),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'Which energy store increases when an object speeds up?', 'mcq', '["Thermal", "Gravitational", "Kinetic", "Chemical"]', 'Kinetic', 'As speed increases, kinetic energy increases.', 1, 10, 30),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'Non-renewable energy sources will eventually run out.', 'true_false', '["True", "False"]', 'True', 'Fossil fuels are finite and will be depleted over time.', 1, 10, 20),
('afbc81c9-5f11-4254-a9a5-64ed0b82071e', 'What is the efficiency formula?', 'mcq', '["(useful output / total input) × 100", "(total input / useful output) × 100", "useful output - total input", "total input × useful output"]', '(useful output / total input) × 100', 'Efficiency = (useful energy output / total energy input) × 100%.', 2, 10, 30);

-- Waves
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'Sound waves are longitudinal waves.', 'true_false', '["True", "False"]', 'True', 'Sound waves are longitudinal — particles vibrate parallel to wave direction.', 1, 10, 20),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'What is the speed of light in a vacuum?', 'mcq', '["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"]', '3 × 10⁸ m/s', 'Light travels at approximately 3 × 10⁸ m/s in a vacuum.', 1, 10, 30),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'What happens to light when it enters a denser medium?', 'mcq', '["Speeds up", "Slows down", "Stays the same", "Disappears"]', 'Slows down', 'Light slows down when moving into a denser medium, causing refraction.', 2, 10, 30),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'The angle of incidence equals the angle of reflection.', 'true_false', '["True", "False"]', 'True', 'This is the law of reflection.', 1, 10, 20),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'What is the relationship v = fλ?', 'mcq', '["Velocity = frequency × wavelength", "Volume = force × length", "Voltage = frequency × lambda", "None of the above"]', 'Velocity = frequency × wavelength', 'The wave equation: speed equals frequency times wavelength.', 2, 10, 30),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'Electromagnetic waves require a medium to travel.', 'true_false', '["True", "False"]', 'False', 'EM waves can travel through a vacuum — no medium needed.', 2, 10, 20),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'Which colour of visible light has the shortest wavelength?', 'mcq', '["Red", "Green", "Blue", "Violet"]', 'Violet', 'Violet light has the shortest wavelength in the visible spectrum.', 2, 10, 30),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'Amplitude determines the loudness of a sound wave.', 'true_false', '["True", "False"]', 'True', 'Greater amplitude means louder sound.', 1, 10, 20),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'Total internal reflection occurs when light goes from a denser to a less dense medium at an angle greater than the...', 'mcq', '["Normal angle", "Critical angle", "Right angle", "Reflection angle"]', 'Critical angle', 'Total internal reflection happens above the critical angle.', 3, 10, 30),
('42b67bf6-b73a-4602-bb2c-cb29a50e1a25', 'Ultrasound has a frequency above 20,000 Hz.', 'true_false', '["True", "False"]', 'True', 'Ultrasound is sound with frequency above the human hearing range (20 kHz).', 1, 10, 20);

-- Electricity
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('c341db5b-135a-43ef-8b66-54287ab816ca', 'What is the formula for Ohm''s law?', 'mcq', '["V = IR", "P = IV", "V = I/R", "R = VI"]', 'V = IR', 'Ohm''s law: voltage = current × resistance.', 1, 10, 30),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'In a series circuit, the current is the same at all points.', 'true_false', '["True", "False"]', 'True', 'In series, there is only one path so current is the same throughout.', 1, 10, 20),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'What is the unit of resistance?', 'mcq', '["Ampere", "Volt", "Ohm", "Watt"]', 'Ohm', 'Resistance is measured in ohms (Ω).', 1, 10, 30),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'In a parallel circuit, voltage across each branch is...', 'mcq', '["Different", "The same", "Zero", "Doubled"]', 'The same', 'In parallel circuits, voltage is the same across each branch.', 2, 10, 30),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'A fuse protects a circuit by melting when current is too high.', 'true_false', '["True", "False"]', 'True', 'Fuses melt and break the circuit when current exceeds a safe level.', 1, 10, 20),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'What is electrical power formula?', 'mcq', '["P = IV", "P = IR", "P = V/I", "P = I²/R"]', 'P = IV', 'Electrical power = current × voltage.', 2, 10, 30),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'A 12V battery pushes 2A through a resistor. What is the resistance?', 'mcq', '["4 Ω", "6 Ω", "10 Ω", "24 Ω"]', '6 Ω', 'R = V/I = 12/2 = 6 Ω.', 2, 10, 30),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'Direct current (DC) flows in one direction only.', 'true_false', '["True", "False"]', 'True', 'DC flows steadily in one direction, unlike AC which alternates.', 1, 10, 20),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'What happens to total resistance when resistors are added in series?', 'mcq', '["Decreases", "Stays the same", "Increases", "Becomes zero"]', 'Increases', 'In series, total resistance = R1 + R2 + R3... so it increases.', 2, 10, 30),
('c341db5b-135a-43ef-8b66-54287ab816ca', 'The earth wire in a plug is for safety.', 'true_false', '["True", "False"]', 'True', 'The earth wire provides a safe path for current if there is a fault.', 1, 10, 20);

-- ===== ICT QUESTIONS (10 more per topic) =====

-- Data Representation
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('b1000000-0000-0000-0000-000000000001', 'How many bits are in a byte?', 'mcq', '["4", "8", "16", "32"]', '8', 'One byte = 8 bits.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'What is the binary representation of decimal 10?', 'mcq', '["1010", "1100", "1001", "1110"]', '1010', '10 in binary: 8+2 = 1010.', 2, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'JPEG is a lossy image format.', 'true_false', '["True", "False"]', 'True', 'JPEG uses lossy compression, reducing file size but losing some quality.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000001', 'What does ASCII stand for?', 'mcq', '["American Standard Code for Information Interchange", "Automatic System Code for Internet Integration", "Advanced Standard Computing for Input Interface", "American System Code for Internet Infrastructure"]', 'American Standard Code for Information Interchange', 'ASCII is a character encoding standard.', 2, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'Hexadecimal uses base 16.', 'true_false', '["True", "False"]', 'True', 'Hexadecimal is a base-16 number system using digits 0-9 and letters A-F.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000001', 'What is 1 kilobyte approximately equal to?', 'mcq', '["100 bytes", "1000 bytes", "1024 bytes", "512 bytes"]', '1024 bytes', '1 KB = 2^10 = 1024 bytes.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'Lossless compression preserves all original data.', 'true_false', '["True", "False"]', 'True', 'Lossless compression allows exact original data to be reconstructed.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000001', 'What is the hexadecimal value of binary 11111111?', 'mcq', '["EE", "FF", "FE", "11"]', 'FF', '11111111 = 255 in decimal = FF in hexadecimal.', 3, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'Unicode supports more characters than ASCII.', 'true_false', '["True", "False"]', 'True', 'Unicode can represent over 100,000 characters vs ASCII''s 128.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000001', 'What is the result of binary addition: 1011 + 0110?', 'mcq', '["10001", "10101", "10010", "10001"]', '10001', '1011 (11) + 0110 (6) = 10001 (17).', 3, 10, 30);

-- Networking
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('b1000000-0000-0000-0000-000000000002', 'What does LAN stand for?', 'mcq', '["Large Area Network", "Local Area Network", "Long Access Network", "Linked Area Network"]', 'Local Area Network', 'LAN = Local Area Network, covering a small geographic area.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'A router connects different networks.', 'true_false', '["True", "False"]', 'True', 'Routers direct data packets between different networks.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000002', 'Which protocol is used for sending emails?', 'mcq', '["HTTP", "FTP", "SMTP", "TCP"]', 'SMTP', 'SMTP (Simple Mail Transfer Protocol) is used for sending emails.', 2, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'What does IP stand for?', 'mcq', '["Internet Protocol", "Internal Program", "Input Process", "Internet Program"]', 'Internet Protocol', 'IP = Internet Protocol, used for addressing devices on a network.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'Wi-Fi is a type of wireless networking technology.', 'true_false', '["True", "False"]', 'True', 'Wi-Fi allows devices to connect to a network wirelessly.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000002', 'A firewall protects a network from unauthorised access.', 'true_false', '["True", "False"]', 'True', 'Firewalls filter incoming and outgoing network traffic for security.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000002', 'What topology has all devices connected to a central hub?', 'mcq', '["Ring", "Bus", "Star", "Mesh"]', 'Star', 'In star topology, all devices connect to a central switch or hub.', 2, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'HTTP is a secure protocol.', 'true_false', '["True", "False"]', 'False', 'HTTP is not encrypted. HTTPS is the secure version.', 2, 10, 20),
('b1000000-0000-0000-0000-000000000002', 'What is the purpose of a DNS server?', 'mcq', '["Store files", "Translate domain names to IP addresses", "Block viruses", "Send emails"]', 'Translate domain names to IP addresses', 'DNS converts human-readable domain names into IP addresses.', 2, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'MAC address is a unique hardware identifier.', 'true_false', '["True", "False"]', 'True', 'Every network interface has a unique MAC address assigned by the manufacturer.', 2, 10, 20);

-- Hardware
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('b1000000-0000-0000-0000-000000000003', 'RAM is volatile memory.', 'true_false', '["True", "False"]', 'True', 'RAM loses its contents when power is switched off.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000003', 'What does CPU stand for?', 'mcq', '["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"]', 'Central Processing Unit', 'CPU = Central Processing Unit, the main processor of a computer.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'An SSD is faster than an HDD.', 'true_false', '["True", "False"]', 'True', 'SSDs use flash memory with no moving parts, making them faster than HDDs.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000003', 'Which component temporarily stores data being processed?', 'mcq', '["ROM", "RAM", "Hard Drive", "GPU"]', 'RAM', 'RAM temporarily holds data and instructions currently being used.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'A printer is an input device.', 'true_false', '["True", "False"]', 'False', 'A printer is an output device — it produces physical copies of digital documents.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000003', 'What is the function of the ALU?', 'mcq', '["Store data", "Perform arithmetic and logic operations", "Control peripherals", "Manage memory"]', 'Perform arithmetic and logic operations', 'The ALU (Arithmetic Logic Unit) handles calculations and comparisons.', 2, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'ROM stores the boot-up instructions.', 'true_false', '["True", "False"]', 'True', 'ROM contains the BIOS/firmware needed to start up the computer.', 2, 10, 20),
('b1000000-0000-0000-0000-000000000003', 'Which storage device uses laser to read data?', 'mcq', '["USB flash drive", "SSD", "CD/DVD", "Hard disk"]', 'CD/DVD', 'Optical discs like CDs and DVDs use lasers to read and write data.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'Cache memory is slower than RAM.', 'true_false', '["True", "False"]', 'False', 'Cache is faster than RAM and sits closer to the CPU.', 2, 10, 20),
('b1000000-0000-0000-0000-000000000003', 'What does GPU stand for?', 'mcq', '["General Processing Unit", "Graphics Processing Unit", "Global Program Unit", "Grid Processing Unit"]', 'Graphics Processing Unit', 'GPU = Graphics Processing Unit, handles rendering images and video.', 1, 10, 30);

-- Programming
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('b1000000-0000-0000-0000-000000000004', 'A variable stores a single value that can change.', 'true_false', '["True", "False"]', 'True', 'Variables hold data that can be updated during program execution.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000004', 'What is a loop used for?', 'mcq', '["Making decisions", "Repeating instructions", "Storing data", "Connecting to internet"]', 'Repeating instructions', 'Loops repeat a block of code until a condition is met.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'An IF statement is used for selection.', 'true_false', '["True", "False"]', 'True', 'IF statements allow programs to make decisions based on conditions.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000004', 'What data type stores whole numbers?', 'mcq', '["String", "Boolean", "Integer", "Float"]', 'Integer', 'Integers store whole numbers without decimal points.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'An array can store multiple values.', 'true_false', '["True", "False"]', 'True', 'Arrays are data structures that hold multiple values of the same type.', 1, 10, 20),
('b1000000-0000-0000-0000-000000000004', 'What is pseudocode?', 'mcq', '["A programming language", "A simplified way to describe algorithms", "A type of database", "A hardware component"]', 'A simplified way to describe algorithms', 'Pseudocode describes algorithms in plain language without strict syntax.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'What does the MOD operator return?', 'mcq', '["Quotient", "Remainder", "Product", "Sum"]', 'Remainder', 'MOD returns the remainder after division (e.g., 7 MOD 3 = 1).', 2, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'A function always returns a value.', 'true_false', '["True", "False"]', 'True', 'Functions return a value; procedures do not.', 2, 10, 20),
('b1000000-0000-0000-0000-000000000004', 'What is validation?', 'mcq', '["Checking data is reasonable", "Checking data is accurate", "Deleting incorrect data", "Sorting data"]', 'Checking data is reasonable', 'Validation checks if data is sensible and within acceptable boundaries.', 2, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'A WHILE loop checks its condition before executing.', 'true_false', '["True", "False"]', 'True', 'A WHILE loop is a pre-condition loop — it checks before each iteration.', 2, 10, 20);

-- ===== CHEMISTRY QUESTIONS =====

-- Atomic Structure
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('d1000000-0000-0000-0000-000000000001', 'What are the three subatomic particles?', 'mcq', '["Protons, neutrons, electrons", "Protons, photons, electrons", "Neutrons, photons, quarks", "Atoms, molecules, ions"]', 'Protons, neutrons, electrons', 'Atoms contain protons and neutrons in the nucleus, with electrons orbiting.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000001', 'Protons have a positive charge.', 'true_false', '["True", "False"]', 'True', 'Protons carry a positive charge of +1.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000001', 'What is the atomic number?', 'mcq', '["Number of neutrons", "Number of protons", "Number of electrons and neutrons", "Total mass"]', 'Number of protons', 'Atomic number = number of protons in the nucleus.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000001', 'Isotopes have the same number of protons but different numbers of neutrons.', 'true_false', '["True", "False"]', 'True', 'Isotopes are atoms of the same element with different mass numbers.', 2, 10, 20),
('d1000000-0000-0000-0000-000000000001', 'How many electrons can the first shell hold?', 'mcq', '["1", "2", "8", "18"]', '2', 'The first electron shell can hold a maximum of 2 electrons.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000001', 'What is the mass number?', 'mcq', '["Protons only", "Protons + electrons", "Protons + neutrons", "Neutrons only"]', 'Protons + neutrons', 'Mass number = number of protons + number of neutrons.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000001', 'Electrons have a negligible mass.', 'true_false', '["True", "False"]', 'True', 'Electrons have a mass approximately 1/1836 of a proton.', 2, 10, 20),
('d1000000-0000-0000-0000-000000000001', 'What is the electron configuration of sodium (Na, atomic number 11)?', 'mcq', '["2,8,1", "2,8,2", "2,1,8", "2,9"]', '2,8,1', 'Sodium: 2 electrons in first shell, 8 in second, 1 in third.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000001', 'The nucleus contains most of the atom''s mass.', 'true_false', '["True", "False"]', 'True', 'Protons and neutrons in the nucleus account for nearly all the mass.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000001', 'An ion is formed when an atom gains or loses...', 'mcq', '["Protons", "Neutrons", "Electrons", "Nucleons"]', 'Electrons', 'Ions form when atoms gain or lose electrons.', 1, 10, 30);

-- Chemical Bonding
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('d1000000-0000-0000-0000-000000000002', 'Ionic bonds form between metals and non-metals.', 'true_false', '["True", "False"]', 'True', 'Metals transfer electrons to non-metals forming ionic bonds.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000002', 'What type of bond involves sharing electrons?', 'mcq', '["Ionic", "Covalent", "Metallic", "Hydrogen"]', 'Covalent', 'Covalent bonds form when atoms share pairs of electrons.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000002', 'Ionic compounds have high melting points.', 'true_false', '["True", "False"]', 'True', 'Strong electrostatic forces between ions require lots of energy to overcome.', 2, 10, 20),
('d1000000-0000-0000-0000-000000000002', 'What is a metallic bond?', 'mcq', '["Sharing of electrons between non-metals", "Transfer of electrons", "A sea of delocalised electrons around positive ions", "Weak intermolecular forces"]', 'A sea of delocalised electrons around positive ions', 'In metallic bonding, electrons are free to move, creating a ''sea'' of electrons.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000002', 'Covalent compounds usually have low melting points.', 'true_false', '["True", "False"]', 'True', 'Simple covalent molecules have weak intermolecular forces.', 2, 10, 20),
('d1000000-0000-0000-0000-000000000002', 'NaCl is an example of an ionic compound.', 'true_false', '["True", "False"]', 'True', 'Sodium chloride forms through ionic bonding between Na+ and Cl-.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000002', 'How many covalent bonds does carbon typically form?', 'mcq', '["1", "2", "3", "4"]', '4', 'Carbon has 4 outer electrons and forms 4 covalent bonds.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000002', 'Ionic compounds conduct electricity when dissolved in water.', 'true_false', '["True", "False"]', 'True', 'When dissolved, ions are free to move and carry charge.', 2, 10, 20),
('d1000000-0000-0000-0000-000000000002', 'What structure does diamond have?', 'mcq', '["Simple molecular", "Giant covalent", "Ionic lattice", "Metallic"]', 'Giant covalent', 'Diamond is a giant covalent structure with each carbon bonded to four others.', 3, 10, 30),
('d1000000-0000-0000-0000-000000000002', 'Metals are good conductors because of delocalised electrons.', 'true_false', '["True", "False"]', 'True', 'Free-moving delocalised electrons carry electrical charge through metals.', 1, 10, 20);

-- Acids, Bases & Salts
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('d1000000-0000-0000-0000-000000000003', 'What is the pH of a neutral solution?', 'mcq', '["0", "7", "14", "1"]', '7', 'Pure water is neutral with a pH of 7.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000003', 'Acids have a pH below 7.', 'true_false', '["True", "False"]', 'True', 'Acidic solutions have pH values less than 7.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000003', 'What gas is produced when an acid reacts with a metal?', 'mcq', '["Oxygen", "Carbon dioxide", "Hydrogen", "Nitrogen"]', 'Hydrogen', 'Acid + metal → salt + hydrogen gas.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000003', 'What indicator turns red in acid and blue in alkali?', 'mcq', '["Methyl orange", "Litmus", "Phenolphthalein", "Universal indicator"]', 'Litmus', 'Litmus paper turns red in acid and blue in alkali.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000003', 'Neutralisation produces salt and water.', 'true_false', '["True", "False"]', 'True', 'Acid + base → salt + water.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000003', 'What is the product of HCl + NaOH?', 'mcq', '["NaCl + H₂O", "NaH + ClO", "Na₂O + HCl", "NaClO + H₂"]', 'NaCl + H₂O', 'Hydrochloric acid + sodium hydroxide → sodium chloride + water.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000003', 'Bases that dissolve in water are called alkalis.', 'true_false', '["True", "False"]', 'True', 'Soluble bases are called alkalis and produce OH⁻ ions in solution.', 2, 10, 20),
('d1000000-0000-0000-0000-000000000003', 'What gas is produced when acid reacts with a carbonate?', 'mcq', '["Hydrogen", "Oxygen", "Carbon dioxide", "Nitrogen"]', 'Carbon dioxide', 'Acid + carbonate → salt + water + carbon dioxide.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000003', 'Strong acids fully dissociate in water.', 'true_false', '["True", "False"]', 'True', 'Strong acids like HCl completely ionise in water.', 2, 10, 20),
('d1000000-0000-0000-0000-000000000003', 'Universal indicator shows a range of colours depending on pH.', 'true_false', '["True", "False"]', 'True', 'Universal indicator changes colour across the pH scale from red (acid) to purple (alkali).', 1, 10, 20);

-- Organic Chemistry
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('d1000000-0000-0000-0000-000000000004', 'What is the first alkane?', 'mcq', '["Ethane", "Methane", "Propane", "Butane"]', 'Methane', 'Methane (CH₄) is the simplest alkane with one carbon atom.', 1, 10, 30),
('d1000000-0000-0000-0000-000000000004', 'Alkenes contain a carbon-carbon double bond.', 'true_false', '["True", "False"]', 'True', 'Alkenes are unsaturated hydrocarbons with C=C double bonds.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000004', 'What is the general formula for alkanes?', 'mcq', '["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"]', 'CₙH₂ₙ₊₂', 'Alkanes follow the general formula CₙH₂ₙ₊₂.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000004', 'Crude oil is a mixture of hydrocarbons.', 'true_false', '["True", "False"]', 'True', 'Crude oil contains many different hydrocarbon molecules.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000004', 'What process separates crude oil into fractions?', 'mcq', '["Filtration", "Fractional distillation", "Evaporation", "Chromatography"]', 'Fractional distillation', 'Fractional distillation separates crude oil based on boiling points.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000004', 'Ethanol is an alcohol.', 'true_false', '["True", "False"]', 'True', 'Ethanol (C₂H₅OH) belongs to the alcohol homologous series.', 1, 10, 20),
('d1000000-0000-0000-0000-000000000004', 'What test is used to distinguish alkenes from alkanes?', 'mcq', '["Flame test", "Bromine water test", "Litmus test", "Iodine test"]', 'Bromine water test', 'Bromine water decolourises with alkenes but not alkanes.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000004', 'Polymers are made from many small molecules called monomers.', 'true_false', '["True", "False"]', 'True', 'Polymerisation joins many monomer molecules into long chains.', 2, 10, 20),
('d1000000-0000-0000-0000-000000000004', 'What is the product of complete combustion of a hydrocarbon?', 'mcq', '["Carbon monoxide + water", "Carbon dioxide + water", "Carbon + hydrogen", "Carbon dioxide + hydrogen"]', 'Carbon dioxide + water', 'Complete combustion: hydrocarbon + O₂ → CO₂ + H₂O.', 2, 10, 30),
('d1000000-0000-0000-0000-000000000004', 'Cracking converts large hydrocarbons into smaller, more useful ones.', 'true_false', '["True", "False"]', 'True', 'Cracking breaks long-chain hydrocarbons into shorter, more useful molecules.', 2, 10, 20);

-- ===== BIOLOGY QUESTIONS =====

-- Cell Biology
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('e1000000-0000-0000-0000-000000000001', 'What is the powerhouse of the cell?', 'mcq', '["Nucleus", "Mitochondria", "Ribosome", "Cell membrane"]', 'Mitochondria', 'Mitochondria carry out aerobic respiration to release energy (ATP).', 1, 10, 30),
('e1000000-0000-0000-0000-000000000001', 'Plant cells have a cell wall.', 'true_false', '["True", "False"]', 'True', 'Plant cells have a rigid cellulose cell wall outside the cell membrane.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000001', 'What is the function of the nucleus?', 'mcq', '["Energy production", "Protein synthesis", "Controls cell activities and contains DNA", "Photosynthesis"]', 'Controls cell activities and contains DNA', 'The nucleus contains genetic material and controls cell functions.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000001', 'Osmosis is the movement of water from high to low water concentration through a semi-permeable membrane.', 'true_false', '["True", "False"]', 'True', 'Osmosis is the net movement of water molecules across a semi-permeable membrane.', 2, 10, 20),
('e1000000-0000-0000-0000-000000000001', 'Which organelle is responsible for photosynthesis?', 'mcq', '["Mitochondria", "Chloroplast", "Vacuole", "Ribosome"]', 'Chloroplast', 'Chloroplasts contain chlorophyll and carry out photosynthesis.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000001', 'Animal cells have a large permanent vacuole.', 'true_false', '["True", "False"]', 'False', 'Plant cells have a large permanent vacuole; animal cells may have small temporary ones.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000001', 'What is diffusion?', 'mcq', '["Movement of water only", "Net movement of particles from high to low concentration", "Movement requiring energy", "Movement of solids only"]', 'Net movement of particles from high to low concentration', 'Diffusion is passive movement of particles down a concentration gradient.', 2, 10, 30),
('e1000000-0000-0000-0000-000000000001', 'Ribosomes are the site of protein synthesis.', 'true_false', '["True", "False"]', 'True', 'Ribosomes translate mRNA into proteins.', 2, 10, 20),
('e1000000-0000-0000-0000-000000000001', 'What is active transport?', 'mcq', '["Movement down a concentration gradient", "Movement against a concentration gradient using energy", "Movement of water molecules", "Random particle movement"]', 'Movement against a concentration gradient using energy', 'Active transport requires energy (ATP) to move substances against the gradient.', 3, 10, 30),
('e1000000-0000-0000-0000-000000000001', 'Mitosis produces two identical daughter cells.', 'true_false', '["True", "False"]', 'True', 'Mitosis produces two genetically identical diploid cells.', 2, 10, 20);

-- Human Biology
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('e1000000-0000-0000-0000-000000000002', 'What organ pumps blood around the body?', 'mcq', '["Lungs", "Heart", "Liver", "Brain"]', 'Heart', 'The heart is a muscular organ that pumps blood through the circulatory system.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000002', 'Red blood cells carry oxygen.', 'true_false', '["True", "False"]', 'True', 'Red blood cells contain haemoglobin which binds to oxygen.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000002', 'Where does gas exchange occur in the lungs?', 'mcq', '["Bronchi", "Trachea", "Alveoli", "Bronchioles"]', 'Alveoli', 'Alveoli are tiny air sacs where oxygen and CO₂ are exchanged.', 2, 10, 30),
('e1000000-0000-0000-0000-000000000002', 'Enzymes are biological catalysts.', 'true_false', '["True", "False"]', 'True', 'Enzymes speed up biological reactions without being used up.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000002', 'What enzyme breaks down starch?', 'mcq', '["Protease", "Lipase", "Amylase", "Catalase"]', 'Amylase', 'Amylase breaks down starch into maltose.', 2, 10, 30),
('e1000000-0000-0000-0000-000000000002', 'Arteries carry blood away from the heart.', 'true_false', '["True", "False"]', 'True', 'Arteries carry oxygenated blood (mostly) away from the heart under high pressure.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000002', 'Which part of the digestive system absorbs most nutrients?', 'mcq', '["Stomach", "Large intestine", "Small intestine", "Mouth"]', 'Small intestine', 'The small intestine has villi that provide a large surface area for absorption.', 2, 10, 30),
('e1000000-0000-0000-0000-000000000002', 'White blood cells fight infections.', 'true_false', '["True", "False"]', 'True', 'White blood cells are part of the immune system and defend against pathogens.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000002', 'What is the function of the kidneys?', 'mcq', '["Produce insulin", "Filter blood and produce urine", "Digest food", "Pump blood"]', 'Filter blood and produce urine', 'Kidneys filter waste from blood and regulate water balance.', 2, 10, 30),
('e1000000-0000-0000-0000-000000000002', 'Veins have valves to prevent backflow of blood.', 'true_false', '["True", "False"]', 'True', 'Veins have valves because blood flows at low pressure back to the heart.', 2, 10, 20);

-- Plant Biology
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('e1000000-0000-0000-0000-000000000003', 'What is the equation for photosynthesis?', 'mcq', '["CO₂ + H₂O → C₆H₁₂O₆ + O₂", "C₆H₁₂O₆ + O₂ → CO₂ + H₂O", "N₂ + H₂ → NH₃", "CO₂ + O₂ → C₆H₁₂O₆"]', 'CO₂ + H₂O → C₆H₁₂O₆ + O₂', 'Photosynthesis: carbon dioxide + water → glucose + oxygen (with light energy).', 2, 10, 30),
('e1000000-0000-0000-0000-000000000003', 'Photosynthesis takes place in the chloroplasts.', 'true_false', '["True", "False"]', 'True', 'Chloroplasts contain chlorophyll which absorbs light for photosynthesis.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000003', 'What does the xylem transport?', 'mcq', '["Sugars", "Water and minerals", "Proteins", "Gases"]', 'Water and minerals', 'Xylem vessels transport water and dissolved minerals from roots to leaves.', 2, 10, 30),
('e1000000-0000-0000-0000-000000000003', 'Transpiration is the loss of water from leaves.', 'true_false', '["True", "False"]', 'True', 'Transpiration is evaporation of water from leaf surfaces through stomata.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000003', 'What is the function of root hair cells?', 'mcq', '["Photosynthesis", "Absorb water and minerals", "Support the plant", "Produce flowers"]', 'Absorb water and minerals', 'Root hair cells have a large surface area for absorbing water and minerals.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000003', 'Phloem transports sugars in the plant.', 'true_false', '["True", "False"]', 'True', 'Phloem carries dissolved sugars from leaves to other parts of the plant.', 2, 10, 20),
('e1000000-0000-0000-0000-000000000003', 'What controls the opening and closing of stomata?', 'mcq', '["Xylem cells", "Guard cells", "Palisade cells", "Root cells"]', 'Guard cells', 'Guard cells change shape to open and close stomata, controlling gas exchange.', 2, 10, 30),
('e1000000-0000-0000-0000-000000000003', 'Plants need carbon dioxide for photosynthesis.', 'true_false', '["True", "False"]', 'True', 'CO₂ is a raw material for photosynthesis along with water and light.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000003', 'Which gas do plants release during photosynthesis?', 'mcq', '["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"]', 'Oxygen', 'Oxygen is a by-product of photosynthesis.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000003', 'Limiting factors of photosynthesis include light intensity, CO₂ concentration, and temperature.', 'true_false', '["True", "False"]', 'True', 'These three factors can limit the rate of photosynthesis.', 2, 10, 20);

-- Ecology
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('e1000000-0000-0000-0000-000000000004', 'What is a habitat?', 'mcq', '["A type of animal", "The place where an organism lives", "A food chain", "A type of cell"]', 'The place where an organism lives', 'A habitat is the natural environment where an organism lives.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000004', 'Producers are always at the start of a food chain.', 'true_false', '["True", "False"]', 'True', 'Producers (plants) make their own food through photosynthesis.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000004', 'What is a food web?', 'mcq', '["A single food chain", "Many interconnected food chains", "A type of ecosystem", "A predator-prey relationship"]', 'Many interconnected food chains', 'A food web shows multiple interconnected food chains in an ecosystem.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000004', 'Decomposers break down dead organisms.', 'true_false', '["True", "False"]', 'True', 'Decomposers like bacteria and fungi break down dead matter, recycling nutrients.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000004', 'What is biodiversity?', 'mcq', '["Number of plants only", "Variety of living organisms in an area", "Number of ecosystems", "Size of a population"]', 'Variety of living organisms in an area', 'Biodiversity refers to the variety of species in a given area.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000004', 'Deforestation reduces biodiversity.', 'true_false', '["True", "False"]', 'True', 'Destroying forests removes habitats and reduces species diversity.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000004', 'What is the carbon cycle?', 'mcq', '["Movement of water", "Recycling of carbon through ecosystems", "Food chain process", "Plant reproduction"]', 'Recycling of carbon through ecosystems', 'The carbon cycle describes how carbon moves between atmosphere, organisms, and earth.', 2, 10, 30),
('e1000000-0000-0000-0000-000000000004', 'Apex predators are at the top of the food chain.', 'true_false', '["True", "False"]', 'True', 'Apex predators have no natural predators above them in the food chain.', 1, 10, 20),
('e1000000-0000-0000-0000-000000000004', 'What is pollution?', 'mcq', '["Natural weather", "Contamination of the environment by harmful substances", "Deforestation", "Extinction"]', 'Contamination of the environment by harmful substances', 'Pollution is the introduction of harmful substances into the environment.', 1, 10, 30),
('e1000000-0000-0000-0000-000000000004', 'The greenhouse effect helps regulate Earth''s temperature.', 'true_false', '["True", "False"]', 'True', 'The natural greenhouse effect keeps Earth warm enough to support life.', 2, 10, 20);

-- ===== ENGLISH QUESTIONS =====

-- Reading Comprehension
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('f1000000-0000-0000-0000-000000000001', 'What is the main purpose of a topic sentence?', 'mcq', '["To conclude a paragraph", "To introduce the main idea of a paragraph", "To provide evidence", "To create suspense"]', 'To introduce the main idea of a paragraph', 'A topic sentence states the main idea that the paragraph will develop.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000001', 'Skimming means reading every word carefully.', 'true_false', '["True", "False"]', 'False', 'Skimming is reading quickly to get the general idea, not every word.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000001', 'What does "inference" mean in reading?', 'mcq', '["Copying text directly", "Drawing conclusions from clues in the text", "Summarising the entire text", "Reading aloud"]', 'Drawing conclusions from clues in the text', 'Inference means understanding implied meaning using evidence and reasoning.', 2, 10, 30),
('f1000000-0000-0000-0000-000000000001', 'Context clues help determine the meaning of unknown words.', 'true_false', '["True", "False"]', 'True', 'Surrounding words and sentences provide clues to unfamiliar vocabulary.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000001', 'What is the difference between fact and opinion?', 'mcq', '["Facts are longer", "Facts can be verified; opinions are personal views", "Opinions are always wrong", "There is no difference"]', 'Facts can be verified; opinions are personal views', 'Facts are provable statements; opinions express personal beliefs.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000001', 'A summary should include every detail from the text.', 'true_false', '["True", "False"]', 'False', 'A summary includes only the main points, not every detail.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000001', 'What is the purpose of scanning a text?', 'mcq', '["To enjoy the writing style", "To find specific information quickly", "To memorise the text", "To rewrite the text"]', 'To find specific information quickly', 'Scanning involves looking for particular keywords or data.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000001', 'The tone of a text refers to the author''s attitude.', 'true_false', '["True", "False"]', 'True', 'Tone reflects the author''s feelings or attitude toward the subject.', 2, 10, 20),
('f1000000-0000-0000-0000-000000000001', 'What does "explicit" information mean?', 'mcq', '["Hidden meaning", "Clearly stated information", "Author''s opinion", "Background knowledge"]', 'Clearly stated information', 'Explicit information is directly stated in the text.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000001', 'Headings and subheadings help organise text structure.', 'true_false', '["True", "False"]', 'True', 'Headings break text into sections and help readers navigate content.', 1, 10, 20);

-- Grammar & Vocabulary
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('f1000000-0000-0000-0000-000000000002', 'A noun is a naming word.', 'true_false', '["True", "False"]', 'True', 'Nouns name people, places, things, or ideas.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000002', 'What is a synonym?', 'mcq', '["A word with opposite meaning", "A word with similar meaning", "A type of verb", "A punctuation mark"]', 'A word with similar meaning', 'Synonyms are words with similar meanings (e.g., happy/joyful).', 1, 10, 30),
('f1000000-0000-0000-0000-000000000002', 'Which sentence is in the passive voice?', 'mcq', '["The cat chased the mouse.", "The mouse was chased by the cat.", "The cat is fast.", "The mouse ran away."]', 'The mouse was chased by the cat.', 'Passive voice: the subject receives the action (was chased).', 2, 10, 30),
('f1000000-0000-0000-0000-000000000002', 'An adjective describes a noun.', 'true_false', '["True", "False"]', 'True', 'Adjectives modify nouns by describing their qualities.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000002', 'What is an antonym?', 'mcq', '["Same meaning", "Opposite meaning", "Similar spelling", "Related word"]', 'Opposite meaning', 'Antonyms are words with opposite meanings (e.g., hot/cold).', 1, 10, 30),
('f1000000-0000-0000-0000-000000000002', 'A pronoun replaces a noun.', 'true_false', '["True", "False"]', 'True', 'Pronouns (he, she, it, they) replace nouns to avoid repetition.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000002', 'What is the correct form: "She ___ to school every day"?', 'mcq', '["go", "goes", "going", "gone"]', 'goes', 'Third person singular present tense requires "goes".', 1, 10, 30),
('f1000000-0000-0000-0000-000000000002', 'A semicolon can join two related independent clauses.', 'true_false', '["True", "False"]', 'True', 'Semicolons connect closely related independent clauses without a conjunction.', 2, 10, 20),
('f1000000-0000-0000-0000-000000000002', 'What is a simile?', 'mcq', '["Exaggeration", "Comparison using like or as", "Giving human qualities to objects", "Repeating sounds"]', 'Comparison using like or as', 'A simile compares two things using "like" or "as" (e.g., brave as a lion).', 2, 10, 30),
('f1000000-0000-0000-0000-000000000002', 'Adverbs modify verbs, adjectives, or other adverbs.', 'true_false', '["True", "False"]', 'True', 'Adverbs describe how, when, where, or to what extent something happens.', 1, 10, 20);

-- Writing Skills
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('f1000000-0000-0000-0000-000000000003', 'What should an essay introduction contain?', 'mcq', '["Conclusion only", "A thesis statement and context", "Only examples", "References"]', 'A thesis statement and context', 'An introduction sets context and states the main argument (thesis).', 1, 10, 30),
('f1000000-0000-0000-0000-000000000003', 'Every paragraph should have a clear topic.', 'true_false', '["True", "False"]', 'True', 'Each paragraph should focus on one main idea with supporting details.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000003', 'What is the purpose of a conclusion?', 'mcq', '["Introduce new ideas", "Summarise key points and restate thesis", "Add more evidence", "Ask questions"]', 'Summarise key points and restate thesis', 'A conclusion wraps up the essay by reinforcing the main argument.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000003', 'Formal writing should avoid contractions.', 'true_false', '["True", "False"]', 'True', 'Formal writing uses full forms (do not, cannot) instead of contractions.', 2, 10, 20),
('f1000000-0000-0000-0000-000000000003', 'What is a persuasive writing technique?', 'mcq', '["Using only facts", "Emotional appeal and rhetorical questions", "Listing random points", "Writing in third person only"]', 'Emotional appeal and rhetorical questions', 'Persuasive writing uses emotive language, rhetorical questions, and evidence.', 2, 10, 30),
('f1000000-0000-0000-0000-000000000003', 'Proofreading is checking for errors before submission.', 'true_false', '["True", "False"]', 'True', 'Proofreading involves reviewing text for spelling, grammar, and punctuation errors.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000003', 'What is a narrative essay?', 'mcq', '["An essay that argues a point", "An essay that tells a story", "An essay that describes data", "An essay that compares two things"]', 'An essay that tells a story', 'Narrative essays tell a story with characters, setting, and plot.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000003', 'Using varied sentence structures improves writing quality.', 'true_false', '["True", "False"]', 'True', 'Mixing short and long sentences makes writing more engaging.', 2, 10, 20),
('f1000000-0000-0000-0000-000000000003', 'What is the correct order for an essay?', 'mcq', '["Body, Introduction, Conclusion", "Conclusion, Body, Introduction", "Introduction, Body, Conclusion", "Body, Conclusion, Introduction"]', 'Introduction, Body, Conclusion', 'Essays follow: Introduction → Body paragraphs → Conclusion.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000003', 'Transition words help connect ideas between sentences.', 'true_false', '["True", "False"]', 'True', 'Words like "however", "furthermore", "therefore" link ideas smoothly.', 1, 10, 20);

-- Literature
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('f1000000-0000-0000-0000-000000000004', 'What is a metaphor?', 'mcq', '["A comparison using like", "A direct comparison without like or as", "An exaggeration", "A repeated sound"]', 'A direct comparison without like or as', 'A metaphor says something IS something else (e.g., time is money).', 2, 10, 30),
('f1000000-0000-0000-0000-000000000004', 'The protagonist is the main character.', 'true_false', '["True", "False"]', 'True', 'The protagonist is the central character around whom the story revolves.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000004', 'What is alliteration?', 'mcq', '["Repeating vowel sounds", "Repeating consonant sounds at the start of words", "Exaggeration for effect", "A type of rhyme"]', 'Repeating consonant sounds at the start of words', 'Alliteration: Peter Piper picked a peck of pickled peppers.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000004', 'Irony is when the opposite of what is expected happens.', 'true_false', '["True", "False"]', 'True', 'Irony involves a contrast between expectations and reality.', 2, 10, 20),
('f1000000-0000-0000-0000-000000000004', 'What is personification?', 'mcq', '["Comparing two things", "Giving human qualities to non-human things", "Using exaggeration", "A type of poem"]', 'Giving human qualities to non-human things', 'Personification: "The wind whispered through the trees."', 1, 10, 30),
('f1000000-0000-0000-0000-000000000004', 'A sonnet has 14 lines.', 'true_false', '["True", "False"]', 'True', 'Traditional sonnets (Shakespearean and Petrarchan) contain 14 lines.', 2, 10, 20),
('f1000000-0000-0000-0000-000000000004', 'What is the climax of a story?', 'mcq', '["The beginning", "The turning point or most intense moment", "The ending", "The setting description"]', 'The turning point or most intense moment', 'The climax is the peak of tension in a story.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000004', 'Onomatopoeia is a word that imitates a sound.', 'true_false', '["True", "False"]', 'True', 'Examples: buzz, hiss, bang, splash.', 1, 10, 20),
('f1000000-0000-0000-0000-000000000004', 'What is the setting of a story?', 'mcq', '["The moral lesson", "The time and place where the story occurs", "The main character", "The problem in the story"]', 'The time and place where the story occurs', 'Setting describes when and where the story takes place.', 1, 10, 30),
('f1000000-0000-0000-0000-000000000004', 'Foreshadowing gives hints about future events in a story.', 'true_false', '["True", "False"]', 'True', 'Authors use foreshadowing to build suspense and prepare readers.', 2, 10, 20);

-- ===== ACCOUNTING QUESTIONS =====

-- Double Entry & Books of Account
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('a2000000-0000-0000-0000-000000000001', 'Every transaction affects at least two accounts.', 'true_false', '["True", "False"]', 'True', 'Double entry bookkeeping records every transaction as a debit and credit.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000001', 'What does "debit" mean in accounting?', 'mcq', '["Money going out", "An entry on the left side of an account", "A loss", "Interest payment"]', 'An entry on the left side of an account', 'In double entry, debit entries are recorded on the left side.', 1, 10, 30),
('a2000000-0000-0000-0000-000000000001', 'Which book records all credit purchases?', 'mcq', '["Cash book", "Sales journal", "Purchases journal", "General journal"]', 'Purchases journal', 'The purchases journal (day book) records goods bought on credit.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000001', 'Assets are debited when they increase.', 'true_false', '["True", "False"]', 'True', 'Increases in assets are recorded as debits.', 2, 10, 20),
('a2000000-0000-0000-0000-000000000001', 'What is a trial balance?', 'mcq', '["A financial statement", "A list of all account balances to check debits equal credits", "A bank statement", "A tax return"]', 'A list of all account balances to check debits equal credits', 'A trial balance verifies that total debits equal total credits.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000001', 'The cash book records all cash and bank transactions.', 'true_false', '["True", "False"]', 'True', 'The cash book is both a book of prime entry and a ledger account.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000001', 'If you buy furniture for the business, which account is debited?', 'mcq', '["Cash", "Furniture (asset)", "Purchases", "Sales"]', 'Furniture (asset)', 'Buying furniture increases an asset, so the asset account is debited.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000001', 'Liabilities are credited when they increase.', 'true_false', '["True", "False"]', 'True', 'Increases in liabilities are recorded as credits.', 2, 10, 20),
('a2000000-0000-0000-0000-000000000001', 'What is the accounting equation?', 'mcq', '["Assets = Liabilities + Capital", "Assets = Revenue - Expenses", "Capital = Assets + Liabilities", "Profit = Revenue × Capital"]', 'Assets = Liabilities + Capital', 'The fundamental equation: Assets = Liabilities + Owner''s Equity (Capital).', 1, 10, 30),
('a2000000-0000-0000-0000-000000000001', 'A ledger contains individual accounts for each item.', 'true_false', '["True", "False"]', 'True', 'The ledger is the principal book of accounts where transactions are classified.', 1, 10, 20);

-- Financial Statements
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('a2000000-0000-0000-0000-000000000002', 'What does the income statement show?', 'mcq', '["Assets and liabilities", "Revenue and expenses for a period", "Cash flows", "Owner''s investments"]', 'Revenue and expenses for a period', 'The income statement shows profit or loss over a specific period.', 1, 10, 30),
('a2000000-0000-0000-0000-000000000002', 'Gross profit = Revenue - Cost of Goods Sold.', 'true_false', '["True", "False"]', 'True', 'Gross profit is calculated by subtracting COGS from revenue.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000002', 'What is shown on a balance sheet?', 'mcq', '["Only profits", "Assets, liabilities, and capital at a specific date", "Only cash transactions", "Monthly expenses"]', 'Assets, liabilities, and capital at a specific date', 'A balance sheet shows the financial position at a point in time.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000002', 'Net profit is calculated after deducting all expenses.', 'true_false', '["True", "False"]', 'True', 'Net profit = Gross profit - expenses (rent, wages, utilities, etc.).', 1, 10, 20),
('a2000000-0000-0000-0000-000000000002', 'Current assets can be converted to cash within one year.', 'true_false', '["True", "False"]', 'True', 'Current assets include cash, debtors, and stock — realisable within a year.', 2, 10, 20),
('a2000000-0000-0000-0000-000000000002', 'What is closing stock?', 'mcq', '["Stock bought during the year", "Stock remaining unsold at the end of the period", "Damaged stock", "Stock returned to suppliers"]', 'Stock remaining unsold at the end of the period', 'Closing stock is inventory still on hand at the end of the accounting period.', 1, 10, 30),
('a2000000-0000-0000-0000-000000000002', 'A balance sheet must always balance.', 'true_false', '["True", "False"]', 'True', 'Total assets must equal total liabilities plus capital.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000002', 'What are non-current assets?', 'mcq', '["Cash and bank", "Long-term assets used in the business", "Daily expenses", "Short-term debts"]', 'Long-term assets used in the business', 'Non-current (fixed) assets like machinery and buildings are held long-term.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000002', 'Revenue is the income earned from selling goods or services.', 'true_false', '["True", "False"]', 'True', 'Revenue is the total income from the business''s main trading activity.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000002', 'Working capital = Current assets - Current liabilities.', 'true_false', '["True", "False"]', 'True', 'Working capital measures a business''s short-term financial health.', 2, 10, 20);

-- Depreciation & Provisions
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('a2000000-0000-0000-0000-000000000003', 'What is depreciation?', 'mcq', '["Increase in asset value", "Decrease in asset value over time", "Profit from selling assets", "Interest on loans"]', 'Decrease in asset value over time', 'Depreciation allocates the cost of an asset over its useful life.', 1, 10, 30),
('a2000000-0000-0000-0000-000000000003', 'Straight-line depreciation charges equal amounts each year.', 'true_false', '["True", "False"]', 'True', 'Straight-line method: (Cost - Residual Value) / Useful Life = annual depreciation.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000003', 'What is the reducing balance method?', 'mcq', '["Fixed amount each year", "Percentage of the remaining book value each year", "No depreciation", "Depreciation based on usage"]', 'Percentage of the remaining book value each year', 'Reducing balance applies a fixed percentage to the declining book value.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000003', 'A provision for doubtful debts anticipates bad debts.', 'true_false', '["True", "False"]', 'True', 'Provisions estimate the amount of receivables that may not be collected.', 2, 10, 20),
('a2000000-0000-0000-0000-000000000003', 'Book value = Cost - Accumulated depreciation.', 'true_false', '["True", "False"]', 'True', 'Net book value shows the remaining value of an asset on the balance sheet.', 2, 10, 20),
('a2000000-0000-0000-0000-000000000003', 'What is residual value?', 'mcq', '["Original cost", "Estimated value at end of useful life", "Annual depreciation", "Market price"]', 'Estimated value at end of useful life', 'Residual (scrap) value is what the asset is expected to be worth when disposed of.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000003', 'Depreciation is an expense in the income statement.', 'true_false', '["True", "False"]', 'True', 'Annual depreciation is charged as an expense reducing profit.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000003', 'What happens when an asset is sold for more than its book value?', 'mcq', '["Loss on disposal", "Profit on disposal", "No effect", "Depreciation increases"]', 'Profit on disposal', 'If sale price exceeds book value, there is a profit on disposal.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000003', 'Bad debts are debts that will never be paid.', 'true_false', '["True", "False"]', 'True', 'Bad debts are written off as an expense when deemed irrecoverable.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000003', 'Accumulated depreciation is shown on the balance sheet.', 'true_false', '["True", "False"]', 'True', 'Accumulated depreciation is deducted from the asset''s cost on the balance sheet.', 2, 10, 20);

-- Partnership Accounts
INSERT INTO public.quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('a2000000-0000-0000-0000-000000000004', 'A partnership has at least two owners.', 'true_false', '["True", "False"]', 'True', 'A partnership is a business owned by two or more people.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000004', 'What is a partnership agreement?', 'mcq', '["A tax document", "A document outlining terms between partners", "A bank loan", "An insurance policy"]', 'A document outlining terms between partners', 'The partnership agreement defines profit sharing, capital, and responsibilities.', 1, 10, 30),
('a2000000-0000-0000-0000-000000000004', 'Partners share profits equally if there is no agreement.', 'true_false', '["True", "False"]', 'True', 'Without an agreement, the Partnership Act states profits are shared equally.', 2, 10, 20),
('a2000000-0000-0000-0000-000000000004', 'What is a partner''s current account?', 'mcq', '["Bank account", "Records share of profits, drawings, and adjustments", "A savings account", "Capital invested"]', 'Records share of profits, drawings, and adjustments', 'The current account tracks each partner''s share of profits, drawings, salary, and interest.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000004', 'Drawings reduce a partner''s share of the business.', 'true_false', '["True", "False"]', 'True', 'Drawings are money taken out by partners for personal use, reducing their equity.', 1, 10, 20),
('a2000000-0000-0000-0000-000000000004', 'What is interest on capital?', 'mcq', '["Interest paid to the bank", "A reward to partners for investing capital", "Interest on drawings", "A business expense only"]', 'A reward to partners for investing capital', 'Interest on capital compensates partners for the money they have invested.', 2, 10, 30),
('a2000000-0000-0000-0000-000000000004', 'A partnership appropriation account shows how profit is shared.', 'true_false', '["True", "False"]', 'True', 'The appropriation account distributes net profit among partners.', 2, 10, 20),
('a2000000-0000-0000-0000-000000000004', 'What are partner''s drawings?', 'mcq', '["Money invested", "Money withdrawn for personal use", "Profits earned", "Business expenses"]', 'Money withdrawn for personal use', 'Drawings are amounts taken from the business by partners for personal use.', 1, 10, 30),
('a2000000-0000-0000-0000-000000000004', 'Interest on drawings is charged to discourage excessive withdrawals.', 'true_false', '["True", "False"]', 'True', 'Interest on drawings penalises partners for taking out money.', 2, 10, 20),
('a2000000-0000-0000-0000-000000000004', 'Each partner has a separate capital account.', 'true_false', '["True", "False"]', 'True', 'Capital accounts record each partner''s original investment in the business.', 1, 10, 20);
