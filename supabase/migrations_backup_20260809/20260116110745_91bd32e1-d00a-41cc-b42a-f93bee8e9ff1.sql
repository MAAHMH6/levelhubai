-- Seed ICT Past Papers (2020-2024) and Topic Questions

-- Past Papers (15 papers)
INSERT INTO public.past_papers (subject_id, year, session, exam_board, paper_number, variant, total_marks, duration_minutes, xp_reward)
VALUES 
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2020, 'May/June', 'Cambridge IGCSE', 1, 1, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2020, 'May/June', 'Cambridge IGCSE', 2, 1, 50, 105, 320),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2021, 'May/June', 'Cambridge IGCSE', 1, 1, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2021, 'May/June', 'Cambridge IGCSE', 2, 1, 50, 105, 320),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2021, 'Oct/Nov', 'Cambridge IGCSE', 1, 1, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2022, 'May/June', 'Cambridge IGCSE', 1, 1, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2022, 'May/June', 'Cambridge IGCSE', 2, 1, 50, 105, 320),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2022, 'Oct/Nov', 'Cambridge IGCSE', 1, 1, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2023, 'May/June', 'Cambridge IGCSE', 1, 1, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2023, 'May/June', 'Cambridge IGCSE', 2, 1, 50, 105, 320),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2023, 'Oct/Nov', 'Cambridge IGCSE', 1, 1, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2024, 'May/June', 'Cambridge IGCSE', 1, 1, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2024, 'May/June', 'Cambridge IGCSE', 1, 2, 75, 105, 280),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2024, 'May/June', 'Cambridge IGCSE', 2, 1, 50, 105, 320),
('f249052a-6c35-4d36-b9f7-0e1f5bf213a7', 2024, 'May/June', 'Cambridge IGCSE', 2, 2, 50, 105, 320);

-- Topic Questions (40 questions across 4 ICT topics)
INSERT INTO public.quiz_questions (topic_id, question_type, question_text, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds)
VALUES 
-- Data Representation (b1000000-0000-0000-0000-000000000001)
('b1000000-0000-0000-0000-000000000001', 'mcq', 'What is the binary equivalent of denary 13?', '["1011", "1101", "1110", "1100"]', '1101', '13 in binary: 8+4+1 = 1101', 1, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'What is the hexadecimal equivalent of binary 11110000?', '["F0", "0F", "FF", "00"]', 'F0', '1111=F, 0000=0, so 11110000 = F0', 2, 15, 45),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'How many bits are in a nibble?', '["2", "4", "8", "16"]', '4', 'A nibble is 4 bits, half of a byte.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'ASCII uses how many bits per character?', '["4", "7", "8", "16"]', '7', 'Standard ASCII uses 7 bits (128 characters), extended uses 8.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'What is lossy compression?', '["Compression where no data is lost", "Compression where some data is permanently removed", "Compression using RLE", "No compression at all"]', 'Compression where some data is permanently removed', 'Lossy compression permanently removes data to achieve smaller file sizes.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'What does increasing sample rate do to sound quality?', '["Decreases quality", "Increases quality", "No effect", "Reduces file size"]', 'Increases quality', 'Higher sample rate captures more audio detail, improving quality.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'Color depth refers to:', '["Number of pixels", "Number of bits per pixel", "Image resolution", "File format"]', 'Number of bits per pixel', 'Color depth is the number of bits used to represent each pixel''s color.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'Two''s complement is used to represent:', '["Positive numbers only", "Negative numbers in binary", "Hexadecimal", "Floating point"]', 'Negative numbers in binary', 'Two''s complement allows representation of both positive and negative integers.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'What is 1010 + 0111 in binary?', '["10001", "10101", "01111", "00001"]', '10001', '1010 + 0111 = 10001 (10 + 7 = 17)', 2, 15, 45),
('b1000000-0000-0000-0000-000000000001', 'mcq', 'Unicode supports more characters than ASCII because:', '["It uses fewer bits", "It uses more bits per character", "It compresses data", "It only uses numbers"]', 'It uses more bits per character', 'Unicode uses 16+ bits allowing representation of many more characters.', 1, 10, 30),

-- Networking (b1000000-0000-0000-0000-000000000002)
('b1000000-0000-0000-0000-000000000002', 'mcq', 'What is a MAC address?', '["Software address", "Hardware address unique to device", "IP address", "Website address"]', 'Hardware address unique to device', 'MAC address is a unique hardware identifier assigned to network interfaces.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'Parity check is used for:', '["Data compression", "Error detection", "Data encryption", "Data transmission speed"]', 'Error detection', 'Parity bits help detect single-bit errors in transmitted data.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'Full-duplex transmission means:', '["One direction only", "Both directions but not simultaneously", "Both directions simultaneously", "No transmission"]', 'Both directions simultaneously', 'Full-duplex allows data to flow in both directions at the same time.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'IPv4 addresses are how many bits?', '["16", "32", "64", "128"]', '32', 'IPv4 uses 32 bits (4 octets of 8 bits each).', 1, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'A router is used to:', '["Store data", "Connect different networks", "Print documents", "Display images"]', 'Connect different networks', 'Routers forward data packets between different networks.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'Serial transmission sends data:', '["All bits at once", "One bit at a time", "In random order", "Compressed"]', 'One bit at a time', 'Serial transmission sends bits sequentially, one after another.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'A checksum is:', '["A type of password", "A calculated value for error detection", "A network protocol", "A file type"]', 'A calculated value for error detection', 'Checksum is calculated from data to verify integrity after transmission.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'DHCP is used to:', '["Assign IP addresses automatically", "Encrypt data", "Block malware", "Compress files"]', 'Assign IP addresses automatically', 'DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'USB stands for:', '["Universal Serial Bus", "Universal System Bus", "Unified Serial Bus", "United System Bus"]', 'Universal Serial Bus', 'USB = Universal Serial Bus, a standard for connecting devices.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000002', 'mcq', 'A packet contains:', '["Header, payload, and trailer", "Only data", "Only addresses", "Only checksum"]', 'Header, payload, and trailer', 'Packets have header (routing info), payload (data), and trailer (error checking).', 2, 15, 45),

-- Hardware (b1000000-0000-0000-0000-000000000003)
('b1000000-0000-0000-0000-000000000003', 'mcq', 'The ALU performs:', '["Storage operations", "Arithmetic and logic operations", "Display operations", "Network operations"]', 'Arithmetic and logic operations', 'ALU (Arithmetic Logic Unit) handles calculations and logical comparisons.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'RAM is:', '["Non-volatile memory", "Volatile memory", "Permanent storage", "Read-only"]', 'Volatile memory', 'RAM loses its contents when power is removed.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'SSD stands for:', '["Solid State Drive", "Standard Storage Device", "System Software Drive", "Serial Storage Disk"]', 'Solid State Drive', 'SSD uses flash memory with no moving parts.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'The control unit:', '["Performs calculations", "Coordinates CPU operations", "Stores data", "Displays output"]', 'Coordinates CPU operations', 'The Control Unit manages and coordinates all CPU operations.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'A sensor is an example of:', '["Output device", "Input device", "Storage device", "Processing device"]', 'Input device', 'Sensors input data about the environment into a computer system.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'Laser printers use:', '["Ink cartridges", "Toner and heat", "Impact printing", "Thermal paper"]', 'Toner and heat', 'Laser printers use toner powder fused by heat onto paper.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'The fetch-execute cycle:', '["Stores data permanently", "Processes instructions in the CPU", "Connects to the internet", "Compresses files"]', 'Processes instructions in the CPU', 'The fetch-execute cycle is how the CPU retrieves and executes instructions.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'An actuator is:', '["An input device", "An output device that causes movement", "A type of memory", "A network device"]', 'An output device that causes movement', 'Actuators convert electrical signals into physical movement.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'ROM is used to store:', '["Temporary data", "Permanent startup instructions", "User files", "Network settings"]', 'Permanent startup instructions', 'ROM stores permanent firmware like BIOS/boot instructions.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000003', 'mcq', 'The address bus carries:', '["Data", "Memory addresses", "Control signals", "Power"]', 'Memory addresses', 'The address bus specifies where data should be read/written in memory.', 2, 15, 45),

-- Programming (b1000000-0000-0000-0000-000000000004)
('b1000000-0000-0000-0000-000000000004', 'mcq', 'A flowchart diamond shape represents:', '["Process", "Decision", "Input/Output", "Start/End"]', 'Decision', 'Diamond shapes in flowcharts represent decision points (yes/no).', 1, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'An array is:', '["A single variable", "A collection of related data items", "A loop structure", "A function"]', 'A collection of related data items', 'Arrays store multiple values of the same type under one name.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'A FOR loop is best when:', '["Number of iterations is unknown", "Number of iterations is known", "No iteration is needed", "Only one execution needed"]', 'Number of iterations is known', 'FOR loops are ideal when you know exactly how many times to iterate.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'Bubble sort works by:', '["Dividing the list", "Comparing and swapping adjacent elements", "Using recursion only", "Selecting minimum values"]', 'Comparing and swapping adjacent elements', 'Bubble sort repeatedly compares adjacent pairs and swaps if needed.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'A function differs from a procedure because:', '["It cannot have parameters", "It returns a value", "It cannot be called", "It runs automatically"]', 'It returns a value', 'Functions return a value; procedures perform actions without returning.', 2, 15, 45),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'SQL SELECT is used to:', '["Delete records", "Insert records", "Retrieve records", "Update records"]', 'Retrieve records', 'SELECT queries retrieve data from database tables.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'Validation check that ensures data is in correct format:', '["Range check", "Length check", "Format check", "Presence check"]', 'Format check', 'Format check verifies data matches expected pattern (e.g., date format).', 2, 15, 45),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'In Boolean logic, AND gate outputs 1 when:', '["Any input is 1", "All inputs are 1", "All inputs are 0", "Inputs are different"]', 'All inputs are 1', 'AND gate outputs 1 only when ALL inputs are 1.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'A primary key is:', '["Any field", "A unique identifier for each record", "A foreign table reference", "A calculated field"]', 'A unique identifier for each record', 'Primary key uniquely identifies each record in a database table.', 1, 10, 30),
('b1000000-0000-0000-0000-000000000004', 'mcq', 'Pseudocode is:', '["A programming language", "A simplified way to describe algorithms", "Machine code", "Binary code"]', 'A simplified way to describe algorithms', 'Pseudocode uses plain language to describe algorithms without syntax rules.', 1, 10, 30);