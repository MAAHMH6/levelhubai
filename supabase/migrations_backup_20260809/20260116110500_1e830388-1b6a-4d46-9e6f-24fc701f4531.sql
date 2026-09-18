-- Seed ICT Lessons - Units 2-6
INSERT INTO public.lessons (unit_id, lesson_number, title, topic_name, description, xp_reward, quiz_question_count, practice_question_count, video_duration_display, video_duration_seconds)
VALUES 
-- Unit 2: Data Transmission & Networking (16 lessons)
('b2000000-0000-0000-0000-000000000002', 1, 'Structure of Data Packet', 'Data Transmission', 'Packet components: headers, payload, trailer', 95, 15, 35, '46:00', 2760),
('b2000000-0000-0000-0000-000000000002', 2, 'Data Transmission Worksheet', 'Data Transmission', 'Data transmission practice problems', 120, 20, 45, '58:17', 3497),
('b2000000-0000-0000-0000-000000000002', 3, 'Simplex Data Transmission', 'Data Transmission', 'Simplex, half-duplex, full-duplex modes', 90, 15, 30, '43:10', 2590),
('b2000000-0000-0000-0000-000000000002', 4, 'Serial | Parallel Transmission', 'Data Transmission', 'Serial vs parallel transmission', 90, 15, 35, '44:43', 2683),
('b2000000-0000-0000-0000-000000000002', 5, 'Universal Serial Bus (USB)', 'Data Transmission', 'USB standards and data transfer', 90, 15, 30, '44:48', 2688),
('b2000000-0000-0000-0000-000000000002', 6, 'Data Transmission Questions', 'Data Transmission', 'Data transmission problems', 120, 20, 45, '58:17', 3497),
('b2000000-0000-0000-0000-000000000002', 7, 'Parity Check | Even | Odd', 'Error Detection', 'Error detection methods, even and odd parity', 75, 12, 25, '28:05', 1685),
('b2000000-0000-0000-0000-000000000002', 8, 'Checksum', 'Error Detection', 'Checksum calculation and error detection', 85, 15, 35, '41:12', 2472),
('b2000000-0000-0000-0000-000000000002', 9, 'Check Digit', 'Error Detection', 'ISBN and barcode check digits, modulo operations', 85, 15, 35, '41:38', 2498),
('b2000000-0000-0000-0000-000000000002', 10, 'Error Detection Questions', 'Error Detection', 'Error detection practice', 80, 12, 30, '37:59', 2279),
('b2000000-0000-0000-0000-000000000002', 11, 'Additional Practice', 'Error Detection', 'Additional practice problems', 75, 12, 25, '32:07', 1927),
('b2000000-0000-0000-0000-000000000002', 12, 'Network Hardware | NIC | MAC | IP', 'Network Addressing', 'Network interface card, MAC/IP addresses, router', 70, 12, 25, '27:16', 1636),
('b2000000-0000-0000-0000-000000000002', 13, 'Internet Protocol Address', 'Network Addressing', 'IPv4 structure, IP address classes', 85, 15, 35, '39:44', 2384),
('b2000000-0000-0000-0000-000000000002', 14, 'IP Address & MAC Address', 'Network Addressing', 'Differences between IP and MAC, address resolution', 80, 12, 30, '35:08', 2108),
('b2000000-0000-0000-0000-000000000002', 15, 'Dynamic IP | Static IP', 'Network Addressing', 'Dynamic vs static IP addressing, DHCP', 100, 18, 40, '48:00', 2880),
('b2000000-0000-0000-0000-000000000002', 16, 'Networking Review', 'Network Addressing', 'Comprehensive networking review', 95, 15, 35, '45:00', 2700),

-- Unit 3: Computer Architecture (5 lessons)
('b2000000-0000-0000-0000-000000000003', 1, 'Components of CPU', 'CPU Components', 'CPU structure: Control Unit, ALU, Registers', 90, 15, 35, '43:29', 2609),
('b2000000-0000-0000-0000-000000000003', 2, 'Computer Architecture | ALU', 'CPU Components', 'Arithmetic Logic Unit functions and operations', 105, 18, 40, '50:23', 3023),
('b2000000-0000-0000-0000-000000000003', 3, 'CPU Components Detailed', 'CPU Components', 'Register types and functions', 95, 15, 35, '46:54', 2814),
('b2000000-0000-0000-0000-000000000003', 4, 'System Buses', 'CPU Components', 'Data, address, control bus; bus widths', 100, 18, 40, '48:46', 2926),
('b2000000-0000-0000-0000-000000000003', 5, 'CPU Operations | Fetch-Execute', 'Fetch-Execute Cycle', 'Fetch-Execute cycle, instruction processing', 110, 20, 45, '52:00', 3120),

-- Unit 4: Input & Output Devices (11 lessons)
('b2000000-0000-0000-0000-000000000004', 1, 'Input & Output Devices Overview', 'Input Devices', 'Overview and classification of I/O devices', 100, 18, 40, '48:14', 2894),
('b2000000-0000-0000-0000-000000000004', 2, 'Digital Cameras', 'Input Devices', 'How digital cameras work, CCD and CMOS sensors', 85, 15, 35, '41:07', 2467),
('b2000000-0000-0000-0000-000000000004', 3, '2D 3D Scanner', 'Input Devices', 'Scanning technology and applications', 60, 10, 20, '14:18', 858),
('b2000000-0000-0000-0000-000000000004', 4, '3D Scanners', 'Input Devices', '3D scanning process, manufacturing uses', 70, 12, 25, '22:23', 1343),
('b2000000-0000-0000-0000-000000000004', 5, 'Touch Screen', 'Input Devices', 'Capacitive and resistive touchscreens, multi-touch', 90, 15, 35, '43:18', 2598),
('b2000000-0000-0000-0000-000000000004', 6, 'Input Devices Questions', 'Input Devices', 'Input devices practice', 85, 15, 35, '41:12', 2472),
('b2000000-0000-0000-0000-000000000004', 7, 'Sensors', 'Input Devices', 'Types and applications of sensors', 80, 12, 30, '36:21', 2181),
('b2000000-0000-0000-0000-000000000004', 8, 'Actuators', 'Output Devices', 'Actuators in control systems, motor control', 95, 15, 35, '46:03', 2763),
('b2000000-0000-0000-0000-000000000004', 9, 'Light Projectors', 'Output Devices', 'DLP and LCD projector technology', 90, 15, 30, '43:52', 2632),
('b2000000-0000-0000-0000-000000000004', 10, 'Printers', 'Output Devices', 'Inkjet, laser, and 3D printers', 75, 12, 25, '31:50', 1910),
('b2000000-0000-0000-0000-000000000004', 11, 'Laser Printer', 'Output Devices', 'Laser printing process and components', 95, 15, 35, '46:00', 2760),

-- Unit 5: Sensors & Monitoring Systems (5 lessons)
('b2000000-0000-0000-0000-000000000005', 1, 'Screen/Monitors', 'Sensor Technology', 'LCD, LED, OLED technology, screen resolution', 80, 12, 30, '33:45', 2025),
('b2000000-0000-0000-0000-000000000005', 2, 'Sensors Part 2', 'Sensor Technology', 'Temperature, pressure, moisture, light sensors', 85, 15, 35, '40:29', 2429),
('b2000000-0000-0000-0000-000000000005', 3, 'Sensor Monitoring System', 'Control & Monitoring', 'Automated monitoring systems', 100, 18, 40, '45:00', 2700),
('b2000000-0000-0000-0000-000000000005', 4, 'Control Systems', 'Control & Monitoring', 'Feedback and control loops', 95, 15, 35, '42:00', 2520),
('b2000000-0000-0000-0000-000000000005', 5, 'Monitoring Applications', 'Control & Monitoring', 'Real-world monitoring applications', 90, 15, 35, '40:00', 2400),

-- Unit 6: Data Storage (6 lessons)
('b2000000-0000-0000-0000-000000000006', 1, 'Primary Memory | RAM', 'Memory Types', 'RAM types, volatile vs non-volatile, ROM types', 80, 12, 30, '33:35', 2015),
('b2000000-0000-0000-0000-000000000006', 2, 'Secondary Storage', 'Memory Types', 'Hard disk drives, magnetic storage', 70, 10, 25, '23:08', 1388),
('b2000000-0000-0000-0000-000000000006', 3, 'Secondary & Offline Storage | SSD', 'Memory Types', 'Solid State Drives, advantages over HDDs', 75, 12, 30, '32:06', 1926),
('b2000000-0000-0000-0000-000000000006', 4, 'Offline Storage | Optical Media', 'Storage Media', 'CD, DVD, Blu-ray technology', 95, 15, 35, '45:59', 2759),
('b2000000-0000-0000-0000-000000000006', 5, 'Cloud Storage', 'Storage Media', 'Cloud storage concepts, storage capacity units', 85, 15, 35, '42:18', 2538),
('b2000000-0000-0000-0000-000000000006', 6, 'SSD Technology', 'Storage Media', 'Flash memory, wear leveling', 75, 12, 30, '32:37', 1957);