-- Seed quiz questions for Mathematics topics
-- Topic: Number Systems (aa9712a5-6c59-4c3f-ad73-09c732e90f9f)
INSERT INTO quiz_questions (topic_id, question_text, question_type, options, correct_answer, explanation, difficulty, xp_reward, time_limit_seconds) VALUES
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'What is the place value of 7 in the number 3,725?', 'mcq', '["Ones", "Tens", "Hundreds", "Thousands"]', 'Hundreds', 'In 3,725, the digit 7 is in the hundreds place, representing 700.', 1, 10, 30),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'Which of the following is a prime number?', 'mcq', '["15", "21", "29", "33"]', '29', '29 is only divisible by 1 and itself, making it a prime number.', 1, 10, 30),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'What is the LCM of 12 and 18?', 'mcq', '["6", "36", "72", "216"]', '36', 'The LCM of 12 and 18 is 36. 12 = 2²×3 and 18 = 2×3², so LCM = 2²×3² = 36.', 2, 15, 45),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'What is the HCF of 48 and 72?', 'mcq', '["12", "24", "36", "48"]', '24', '48 = 2⁴×3 and 72 = 2³×3², so HCF = 2³×3 = 24.', 2, 15, 45),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'Express 0.375 as a fraction in its simplest form.', 'mcq', '["3/8", "3/4", "375/100", "15/40"]', '3/8', '0.375 = 375/1000 = 3/8 when simplified.', 2, 15, 45),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'What is √144 + √81?', 'mcq', '["15", "21", "23", "25"]', '21', '√144 = 12 and √81 = 9, so 12 + 9 = 21.', 1, 10, 30),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'Round 4,567.89 to the nearest hundred.', 'mcq', '["4,500", "4,600", "4,570", "4,560"]', '4,600', 'The tens digit is 6 (≥5), so we round up to 4,600.', 1, 10, 30),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'What is (-8) × (-5)?', 'mcq', '["40", "-40", "13", "-13"]', '40', 'When multiplying two negative numbers, the result is positive: (-8) × (-5) = 40.', 1, 10, 30),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'Express 2/5 as a percentage.', 'mcq', '["20%", "25%", "40%", "50%"]', '40%', '2/5 = 0.4 = 40%.', 1, 10, 30),
('aa9712a5-6c59-4c3f-ad73-09c732e90f9f', 'What is 3⁴?', 'mcq', '["12", "27", "64", "81"]', '81', '3⁴ = 3 × 3 × 3 × 3 = 81.', 1, 10, 30),

-- Topic: Algebra (69a93f29-4513-4d48-ab80-06020638b274)
('69a93f29-4513-4d48-ab80-06020638b274', 'Simplify: 3x + 5x - 2x', 'mcq', '["6x", "8x", "10x", "0"]', '6x', 'Combining like terms: 3x + 5x - 2x = 6x.', 1, 10, 30),
('69a93f29-4513-4d48-ab80-06020638b274', 'Solve for x: 2x + 5 = 17', 'mcq', '["4", "6", "7", "11"]', '6', '2x + 5 = 17 → 2x = 12 → x = 6.', 1, 10, 30),
('69a93f29-4513-4d48-ab80-06020638b274', 'Expand: (x + 3)(x + 4)', 'mcq', '["x² + 7x + 12", "x² + 12x + 7", "x² + 7x + 7", "x² + 12"]', 'x² + 7x + 12', '(x + 3)(x + 4) = x² + 4x + 3x + 12 = x² + 7x + 12.', 2, 15, 45),
('69a93f29-4513-4d48-ab80-06020638b274', 'Factorize: x² - 9', 'mcq', '["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)(x-3)", "(x+3)(x+3)"]', '(x-3)(x+3)', 'x² - 9 is a difference of squares: (x-3)(x+3).', 2, 15, 45),
('69a93f29-4513-4d48-ab80-06020638b274', 'If y = 3x - 7, what is y when x = 5?', 'mcq', '["8", "15", "22", "-2"]', '8', 'y = 3(5) - 7 = 15 - 7 = 8.', 1, 10, 30),
('69a93f29-4513-4d48-ab80-06020638b274', 'Solve: 3(x - 2) = 15', 'mcq', '["3", "5", "7", "9"]', '7', '3(x - 2) = 15 → x - 2 = 5 → x = 7.', 1, 10, 30),
('69a93f29-4513-4d48-ab80-06020638b274', 'What is the gradient of y = 2x + 5?', 'mcq', '["2", "5", "7", "10"]', '2', 'In y = mx + c form, m (gradient) = 2.', 1, 10, 30),
('69a93f29-4513-4d48-ab80-06020638b274', 'Solve the inequality: 2x - 3 > 7', 'mcq', '["x > 2", "x > 5", "x < 5", "x < 2"]', 'x > 5', '2x - 3 > 7 → 2x > 10 → x > 5.', 2, 15, 45),
('69a93f29-4513-4d48-ab80-06020638b274', 'Simplify: (2x³)(3x²)', 'mcq', '["5x⁵", "6x⁵", "6x⁶", "5x⁶"]', '6x⁵', '(2x³)(3x²) = 6x^(3+2) = 6x⁵.', 2, 15, 45),
('69a93f29-4513-4d48-ab80-06020638b274', 'Find the value of x: x/4 + 3 = 7', 'mcq', '["1", "4", "10", "16"]', '16', 'x/4 + 3 = 7 → x/4 = 4 → x = 16.', 1, 10, 30),

-- Topic: Geometry (e2666e72-4dce-4470-96cd-41c21c949483)
('e2666e72-4dce-4470-96cd-41c21c949483', 'What is the sum of angles in a triangle?', 'mcq', '["90°", "180°", "270°", "360°"]', '180°', 'The sum of interior angles in any triangle is always 180°.', 1, 10, 30),
('e2666e72-4dce-4470-96cd-41c21c949483', 'What is the area of a rectangle with length 8cm and width 5cm?', 'mcq', '["13 cm²", "26 cm²", "40 cm²", "80 cm²"]', '40 cm²', 'Area = length × width = 8 × 5 = 40 cm².', 1, 10, 30),
('e2666e72-4dce-4470-96cd-41c21c949483', 'Calculate the circumference of a circle with radius 7cm (use π = 22/7)', 'mcq', '["22 cm", "44 cm", "154 cm", "308 cm"]', '44 cm', 'Circumference = 2πr = 2 × 22/7 × 7 = 44 cm.', 2, 15, 45),
('e2666e72-4dce-4470-96cd-41c21c949483', 'What is the volume of a cube with side 4cm?', 'mcq', '["12 cm³", "16 cm³", "48 cm³", "64 cm³"]', '64 cm³', 'Volume of cube = side³ = 4³ = 64 cm³.', 1, 10, 30),
('e2666e72-4dce-4470-96cd-41c21c949483', 'An angle measuring 135° is classified as:', 'mcq', '["Acute", "Right", "Obtuse", "Reflex"]', 'Obtuse', 'An obtuse angle measures between 90° and 180°.', 1, 10, 30),
('e2666e72-4dce-4470-96cd-41c21c949483', 'What is the Pythagorean theorem?', 'mcq', '["a + b = c", "a² + b² = c²", "ab = c", "a² - b² = c²"]', 'a² + b² = c²', 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.', 1, 10, 30),
('e2666e72-4dce-4470-96cd-41c21c949483', 'Find the missing side: Right triangle with legs 3cm and 4cm. Hypotenuse = ?', 'mcq', '["5 cm", "6 cm", "7 cm", "12 cm"]', '5 cm', 'c² = 3² + 4² = 9 + 16 = 25, so c = 5 cm.', 2, 15, 45),
('e2666e72-4dce-4470-96cd-41c21c949483', 'How many sides does a hexagon have?', 'mcq', '["5", "6", "7", "8"]', '6', 'A hexagon has 6 sides.', 1, 10, 30),
('e2666e72-4dce-4470-96cd-41c21c949483', 'What is the area of a triangle with base 10cm and height 6cm?', 'mcq', '["16 cm²", "30 cm²", "60 cm²", "120 cm²"]', '30 cm²', 'Area = ½ × base × height = ½ × 10 × 6 = 30 cm².', 1, 10, 30),
('e2666e72-4dce-4470-96cd-41c21c949483', 'What are co-interior angles also known as?', 'mcq', '["Alternate angles", "Corresponding angles", "Allied angles", "Vertically opposite"]', 'Allied angles', 'Co-interior angles are also called allied angles or same-side interior angles.', 2, 15, 45),

-- Topic: Statistics (fdb6a229-35e4-4461-88a4-259f3ca14a85)
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'Find the mean of: 4, 7, 9, 12, 8', 'mcq', '["7", "8", "9", "10"]', '8', 'Mean = (4+7+9+12+8)/5 = 40/5 = 8.', 1, 10, 30),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'What is the median of: 3, 7, 2, 9, 5?', 'mcq', '["2", "5", "7", "9"]', '5', 'Arranged: 2, 3, 5, 7, 9. Middle value = 5.', 1, 10, 30),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'Find the mode of: 2, 3, 3, 5, 7, 3, 8', 'mcq', '["2", "3", "5", "7"]', '3', '3 appears most frequently (3 times).', 1, 10, 30),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'What is the range of: 12, 5, 18, 9, 15?', 'mcq', '["6", "9", "12", "13"]', '13', 'Range = highest - lowest = 18 - 5 = 13.', 1, 10, 30),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'A dice is rolled. What is the probability of getting an even number?', 'mcq', '["1/6", "1/3", "1/2", "2/3"]', '1/2', 'Even numbers: 2, 4, 6 (3 outcomes). P = 3/6 = 1/2.', 1, 10, 30),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'In a pie chart, what angle represents 25% of data?', 'mcq', '["25°", "45°", "90°", "180°"]', '90°', '25% of 360° = 0.25 × 360 = 90°.', 2, 15, 45),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'What is the probability of getting heads when flipping a fair coin?', 'mcq', '["0", "1/4", "1/2", "1"]', '1/2', 'A fair coin has 2 equally likely outcomes, so P(heads) = 1/2.', 1, 10, 30),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'The sum of all probabilities in a sample space equals:', 'mcq', '["0", "0.5", "1", "It varies"]', '1', 'The sum of all probabilities in a sample space always equals 1.', 1, 10, 30),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'Which average is most affected by outliers?', 'mcq', '["Mean", "Median", "Mode", "Range"]', 'Mean', 'The mean is most sensitive to extreme values (outliers).', 2, 15, 45),
('fdb6a229-35e4-4461-88a4-259f3ca14a85', 'A bag has 3 red and 5 blue balls. P(red) = ?', 'mcq', '["3/5", "5/8", "3/8", "5/3"]', '3/8', 'Total balls = 8. P(red) = 3/8.', 1, 10, 30);