/**
 * Resources Data Store & Unified Service Layer
 * Powers all 16 Free Cambridge Study & Exam Tools and the Admin Resources Management Tab.
 * Integrates with Supabase, synchronizes across browser tabs, and maintains persistence.
 */

import { supabase } from '@/integrations/supabase/client';

export interface GradeBoundaryRecord {
  id: string;
  qualification: 'o_level' | 'igcse' | 'a_level';
  subject: string;
  subject_code: string;
  year: number;
  session: 'May/June' | 'Oct/Nov' | 'Feb/March';
  component: string;
  max_mark: number;
  a_star: number;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  status: 'published' | 'draft' | 'archived';
  updated_at: string;
}

export interface FormulaSheetSection {
  title: string;
  items: { name: string; formula: string; explanation?: string }[];
}

export interface FormulaSheetRecord {
  id: string;
  qualification: 'o_level' | 'igcse' | 'a_level';
  subject: string;
  topic: string;
  title: string;
  description: string;
  sections: FormulaSheetSection[];
  download_url?: string;
  status: 'published' | 'draft' | 'archived';
  updated_at: string;
}

export interface KeywordDefinitionRecord {
  id: string;
  qualification: 'o_level' | 'igcse' | 'a_level';
  subject: string;
  unit_or_topic: string;
  keyword: string;
  definition: string;
  examiner_notes?: string;
  status: 'published' | 'draft' | 'archived';
  updated_at: string;
}

export interface CambridgeExamScheduleRecord {
  id: string;
  qualification: 'o_level' | 'igcse' | 'a_level';
  year: number;
  session: 'May/June' | 'Oct/Nov';
  subject: string;
  subject_code: string;
  paper: string;
  component: string;
  exam_date: string; // YYYY-MM-DD
  start_time: string; // e.g. "09:00 AM" or "02:00 PM"
  duration_minutes: number;
  status: 'published' | 'draft' | 'archived';
  updated_at: string;
}

export interface StudentTimetableItem {
  id: string;
  user_id: string;
  subject: string;
  subject_code?: string;
  paper: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  session?: string;
  room?: string;
  target_grade?: string;
  created_at: string;
}

export interface StudentFlashcardRecord {
  id: string;
  user_id: string;
  subject_id?: string;
  subject_name: string;
  topic?: string;
  question: string;
  answer: string;
  hint?: string;
  box_level: number; // 1 to 5 (Leitner system)
  next_review_date: string;
  times_reviewed: number;
  times_correct: number;
  created_at: string;
  updated_at?: string;
}

export interface PaperScoreAttemptRecord {
  id: string;
  user_id: string;
  subject: string;
  qualification: string;
  paper_name: string;
  year: number;
  session: string;
  variant?: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  attempt_number: number;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

export interface TopicQuestionRecord {
  id: string;
  qualification: 'o_level' | 'igcse' | 'a_level';
  subject: string;
  unit: string;
  topic: string;
  paper: string;
  year: number;
  session: string;
  question_number: string;
  question_text: string;
  marks: number;
  mark_scheme: string;
  options?: string[];
  correct_option_index?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface ResourceToolMeta {
  id: string;
  name: string;
  category: 'Past Papers' | 'Planning' | 'Exam Simulation' | 'Revision & Memory';
  description: string;
  route: string;
  badge?: string;
  color: string;
  status: 'published' | 'draft' | 'coming_soon' | 'archived';
  is_free: boolean;
  sort_order: number;
  updated_at: string;
}

// ==========================================
// SEED DATASETS FOR REAL CAMBRIDGE CURRICULUM
// ==========================================

export const REMOVED_TOOL_IDS = [
  'mark-exams',
  'easy-timer',
  'past-paper-score-tracker',
  'past-paper-exam-timer',
  'past-paper-error-log',
  'grade-boundary-tracker',
  'topic-past-paper-planner',
];

export const INITIAL_RESOURCE_TOOLS: ResourceToolMeta[] = [
  {
    id: 'exam-timetable-builder',
    name: 'Exam Timetable Builder',
    category: 'Planning',
    description: 'Input your Cambridge exam dates and automatically generate a conflict-free study and revision calendar.',
    route: '/quick-access/exam-timetable-builder',
    badge: 'Organize',
    color: '#8B5CF6',
    status: 'published',
    is_free: true,
    sort_order: 1,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exam-countdown',
    name: 'Exam Countdown',
    category: 'Planning',
    description: 'Live countdown widgets for May/June and Oct/Nov Cambridge exam sessions with daily preparation milestones.',
    route: '/quick-access/exam-countdown',
    color: '#EA580C',
    status: 'published',
    is_free: true,
    sort_order: 2,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'flashcard-maker',
    name: 'Flashcard Maker',
    category: 'Revision & Memory',
    description: 'Create and review smart spaced-repetition flashcards for definitions, chemical formulas, and equations.',
    route: '/quick-access/flashcard-maker',
    color: '#C026D3',
    status: 'published',
    is_free: true,
    sort_order: 3,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'formula-sheet-hub',
    name: 'Formula Sheet Hub',
    category: 'Revision & Memory',
    description: 'Downloadable formula sheets for Mathematics, Physics, and Chemistry formatted strictly to Cambridge syllabi.',
    route: '/quick-access/formula-sheet-hub',
    color: '#2563EB',
    status: 'published',
    is_free: true,
    sort_order: 4,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'keyword-definition-lists',
    name: 'Keyword & Definition Lists',
    category: 'Revision & Memory',
    description: 'Master list of mandatory Cambridge definitions that examiners require word-for-word in Paper 2 and 4.',
    route: '/quick-access/keyword-definition-lists',
    color: '#0D9488',
    status: 'published',
    is_free: true,
    sort_order: 5,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'past-paper-finder',
    name: 'Past Paper Finder',
    category: 'Past Papers',
    description: 'Instant search across 10 years of Cambridge O Level, IGCSE & A Level papers by year, season, and component.',
    route: '/quick-access/past-paper-finder',
    badge: 'Popular',
    color: '#0D9488',
    status: 'published',
    is_free: true,
    sort_order: 6,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lesson-planner',
    name: 'Lesson Planner',
    category: 'Planning',
    description: 'Curate daily Cambridge chapter goals, study targets, and video lesson schedules.',
    route: '/planner',
    color: '#6366F1',
    status: 'published',
    is_free: true,
    sort_order: 7,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exam-study-planner',
    name: 'Exam Study Planner',
    category: 'Planning',
    description: 'Comprehensive 8-week exam study roadmap calibrated against Cambridge exam dates.',
    route: '/planner',
    color: '#F59E0B',
    status: 'published',
    is_free: true,
    sort_order: 8,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-exams',
    name: 'Mock Exams',
    category: 'Exam Simulation',
    description: 'Full-length timed Cambridge exam papers with auto-marking for Paper 1 and rubric breakdowns for Paper 2.',
    route: '/mock-exams',
    badge: 'Core Tool',
    color: '#BE123C',
    status: 'published',
    is_free: true,
    sort_order: 9,
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_GRADE_BOUNDARIES: GradeBoundaryRecord[] = [
  // Mathematics 4024 / 0580
  {
    id: 'gb-math-2024-mj',
    qualification: 'o_level',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    year: 2024,
    session: 'May/June',
    component: 'Overall (Option AX)',
    max_mark: 200,
    a_star: 164,
    a: 138,
    b: 106,
    c: 75,
    d: 54,
    e: 34,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gb-math-2024-mj-p1',
    qualification: 'o_level',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    year: 2024,
    session: 'May/June',
    component: 'Paper 12 (Non-Calculator)',
    max_mark: 80,
    a_star: 66,
    a: 55,
    b: 42,
    c: 30,
    d: 21,
    e: 13,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gb-math-2024-mj-p2',
    qualification: 'o_level',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    year: 2024,
    session: 'May/June',
    component: 'Paper 22 (Calculator)',
    max_mark: 100,
    a_star: 83,
    a: 70,
    b: 54,
    c: 38,
    d: 27,
    e: 17,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gb-math-2023-on',
    qualification: 'o_level',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    year: 2023,
    session: 'Oct/Nov',
    component: 'Overall (Option AX)',
    max_mark: 200,
    a_star: 161,
    a: 134,
    b: 102,
    c: 71,
    d: 50,
    e: 30,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  // Physics 5054 / 0625
  {
    id: 'gb-phys-2024-mj',
    qualification: 'o_level',
    subject: 'Physics',
    subject_code: '5054',
    year: 2024,
    session: 'May/June',
    component: 'Overall (Option AX)',
    max_mark: 160,
    a_star: 128,
    a: 108,
    b: 87,
    c: 67,
    d: 52,
    e: 38,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gb-phys-2024-mj-p1',
    qualification: 'o_level',
    subject: 'Physics',
    subject_code: '5054',
    year: 2024,
    session: 'May/June',
    component: 'Paper 12 (MCQ)',
    max_mark: 40,
    a_star: 32,
    a: 27,
    b: 22,
    c: 17,
    d: 13,
    e: 10,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gb-phys-2024-mj-p2',
    qualification: 'o_level',
    subject: 'Physics',
    subject_code: '5054',
    year: 2024,
    session: 'May/June',
    component: 'Paper 22 (Theory)',
    max_mark: 80,
    a_star: 64,
    a: 53,
    b: 42,
    c: 32,
    d: 25,
    e: 18,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  // Chemistry 5070
  {
    id: 'gb-chem-2024-mj',
    qualification: 'o_level',
    subject: 'Chemistry',
    subject_code: '5070',
    year: 2024,
    session: 'May/June',
    component: 'Overall (Option AX)',
    max_mark: 160,
    a_star: 130,
    a: 110,
    b: 88,
    c: 67,
    d: 53,
    e: 39,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  // Biology 5090
  {
    id: 'gb-bio-2024-mj',
    qualification: 'o_level',
    subject: 'Biology',
    subject_code: '5090',
    year: 2024,
    session: 'May/June',
    component: 'Overall (Option AX)',
    max_mark: 160,
    a_star: 126,
    a: 106,
    b: 85,
    c: 65,
    d: 51,
    e: 37,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  // Computer Science 2210
  {
    id: 'gb-cs-2024-mj',
    qualification: 'o_level',
    subject: 'Computer Science',
    subject_code: '2210',
    year: 2024,
    session: 'May/June',
    component: 'Overall',
    max_mark: 150,
    a_star: 120,
    a: 102,
    b: 82,
    c: 62,
    d: 48,
    e: 35,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  // Economics 2281
  {
    id: 'gb-econ-2024-mj',
    qualification: 'o_level',
    subject: 'Economics',
    subject_code: '2281',
    year: 2024,
    session: 'May/June',
    component: 'Overall',
    max_mark: 120,
    a_star: 96,
    a: 82,
    b: 66,
    c: 50,
    d: 39,
    e: 28,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_FORMULA_SHEETS: FormulaSheetRecord[] = [
  {
    id: 'fs-math-algebra',
    qualification: 'o_level',
    subject: 'Mathematics',
    topic: 'Algebra & Functions',
    title: 'Algebra, Quadratics & Coordinate Geometry',
    description: 'Standard algebraic identities, quadratic formula, gradient, and midpoint relations.',
    status: 'published',
    updated_at: new Date().toISOString(),
    sections: [
      {
        title: 'Quadratic Equations',
        items: [
          { name: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / (2a)', explanation: 'For solving ax² + bx + c = 0' },
          { name: 'Discriminant', formula: 'Δ = b² - 4ac', explanation: 'Δ > 0 (2 roots), Δ = 0 (1 root), Δ < 0 (no real roots)' },
          { name: 'Vertex / Turning Point', formula: 'x = -b / (2a)', explanation: 'Axis of symmetry of a parabola' },
        ],
      },
      {
        title: 'Coordinate Geometry',
        items: [
          { name: 'Gradient (Slope)', formula: 'm = (y₂ - y₁) / (x₂ - x₁)', explanation: 'Rate of change of line' },
          { name: 'Distance Between Points', formula: 'd = √((x₂ - x₁)² + (y₂ - y₁)²)', explanation: 'Pythagorean distance' },
          { name: 'Midpoint', formula: 'M = ((x₁ + x₂) / 2, (y₁ + y₂) / 2)', explanation: 'Center of line segment' },
          { name: 'Perpendicular Lines Condition', formula: 'm₁ × m₂ = -1', explanation: 'Product of gradients is -1' },
        ],
      },
      {
        title: 'Indices & Surds',
        items: [
          { name: 'Fractional Index', formula: 'a^(m/n) = ⁿ√(aᵐ)', explanation: 'Root and power relation' },
          { name: 'Negative Index', formula: 'a^(-n) = 1 / aⁿ', explanation: 'Reciprocal rule' },
        ],
      },
    ],
  },
  {
    id: 'fs-math-mensuration',
    qualification: 'o_level',
    subject: 'Mathematics',
    topic: 'Mensuration & Trigonometry',
    title: 'Geometry, Mensuration & Trigonometry',
    description: 'Curved surface areas, volumes of 3D solids, sine and cosine rules.',
    status: 'published',
    updated_at: new Date().toISOString(),
    sections: [
      {
        title: 'Area & Volume of 3D Solids',
        items: [
          { name: 'Curved Surface of Cylinder', formula: 'A = 2πrh', explanation: 'Does not include top and bottom circular faces' },
          { name: 'Total Surface of Cylinder', formula: 'A = 2πrh + 2πr²', explanation: 'Complete closed solid' },
          { name: 'Volume of Cylinder', formula: 'V = πr²h', explanation: 'Cross-section area × height' },
          { name: 'Curved Surface of Cone', formula: 'A = πrl', explanation: 'l is the slant height: l = √(r² + h²)' },
          { name: 'Volume of Cone', formula: 'V = ⅓πr²h', explanation: 'One third of enclosing cylinder' },
          { name: 'Surface Area of Sphere', formula: 'A = 4πr²', explanation: 'Total surface of sphere' },
          { name: 'Volume of Sphere', formula: 'V = ⁴⁄₃πr³', explanation: 'Four thirds pi r cubed' },
        ],
      },
      {
        title: 'Trigonometry & Non-Right Triangles',
        items: [
          { name: 'Sine Rule', formula: 'a / sin(A) = b / sin(B) = c / sin(C)', explanation: 'Used with angle-side pairs' },
          { name: 'Cosine Rule (Sides)', formula: 'a² = b² + c² - 2bc cos(A)', explanation: 'Used when two sides and included angle are given' },
          { name: 'Area of Triangle', formula: 'Area = ½ab sin(C)', explanation: 'Area using two sides and enclosed angle' },
        ],
      },
    ],
  },
  {
    id: 'fs-physics-mechanics',
    qualification: 'o_level',
    subject: 'Physics',
    topic: 'General Physics & Mechanics',
    title: 'Kinematics, Dynamics & Energy Formulations',
    description: 'Equations of uniform motion, Newton laws, pressure, moments, work and power.',
    status: 'published',
    updated_at: new Date().toISOString(),
    sections: [
      {
        title: 'Motion & Kinematics',
        items: [
          { name: 'Average Speed', formula: 'v = d / t', explanation: 'Total distance divided by total time' },
          { name: 'Acceleration', formula: 'a = (v - u) / t', explanation: 'Rate of change of velocity' },
          { name: 'Weight', formula: 'W = m × g', explanation: 'g = 9.8 m/s² (or 10 m/s² on Earth)' },
          { name: 'Density', formula: 'ρ = m / V', explanation: 'Mass per unit volume (kg/m³ or g/cm³)' },
        ],
      },
      {
        title: 'Forces & Energy',
        items: [
          { name: 'Newton Second Law', formula: 'F = m × a', explanation: 'Resultant force equals mass times acceleration' },
          { name: 'Hooke Law', formula: 'F = k × x', explanation: 'Force proportional to extension up to limit' },
          { name: 'Moment of a Force', formula: 'Moment = F × d', explanation: 'Force × perpendicular distance to pivot' },
          { name: 'Pressure', formula: 'P = F / A', explanation: 'Force acting normally per unit area' },
          { name: 'Liquid Pressure', formula: 'P = ρ × g × h', explanation: 'Hydrostatic pressure at depth h' },
          { name: 'Kinetic Energy', formula: 'E_k = ½m v²', explanation: 'Energy due to motion' },
          { name: 'Gravitational Potential Energy', formula: 'E_p = m × g × h', explanation: 'Energy due to position in gravity' },
          { name: 'Power', formula: 'P = W / t = E / t', explanation: 'Rate of doing work or transferring energy' },
        ],
      },
    ],
  },
  {
    id: 'fs-chem-moles',
    qualification: 'o_level',
    subject: 'Chemistry',
    topic: 'Stoichiometry & The Mole',
    title: 'The Mole Concept, Solutions & Gas Volumes',
    description: 'Avogadro constant, reacting masses, gas molar volume, and molar concentrations.',
    status: 'published',
    updated_at: new Date().toISOString(),
    sections: [
      {
        title: 'Mole Calculations',
        items: [
          { name: 'Moles (Solids)', formula: 'n = mass (g) / M_r', explanation: 'Mass divided by relative molecular mass' },
          { name: 'Moles (Gas at r.t.p.)', formula: 'n = Volume (dm³) / 24', explanation: '1 mole of any gas occupies 24 dm³ at r.t.p.' },
          { name: 'Moles (Solutions)', formula: 'n = Concentration (mol/dm³) × Volume (dm³)', explanation: 'Remember to convert cm³ to dm³ (/ 1000)' },
          { name: 'Percentage Yield', formula: 'Yield % = (Actual Mass / Theoretical Mass) × 100', explanation: 'Efficiency of chemical reaction' },
          { name: 'Percentage Purity', formula: 'Purity % = (Pure Mass / Total Impure Mass) × 100', explanation: 'Percentage of target substance in sample' },
        ],
      },
    ],
  },
];

export const INITIAL_KEYWORDS: KeywordDefinitionRecord[] = [
  // Mathematics
  {
    id: 'kw-math-1',
    qualification: 'o_level',
    subject: 'Mathematics',
    unit_or_topic: 'Number & Sets',
    keyword: 'Prime Number',
    definition: 'An integer greater than 1 that has exactly two distinct positive divisors: 1 and itself (2, 3, 5, 7, 11...). Note: 1 is NOT a prime number.',
    examiner_notes: 'Examiners frequently test whether students remember 2 is the only even prime, and 1 is neither prime nor composite.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kw-math-2',
    qualification: 'o_level',
    subject: 'Mathematics',
    unit_or_topic: 'Statistics',
    keyword: 'Median',
    definition: 'The middle value when data is ordered in ascending or descending sequence. For n values, position = (n + 1) / 2.',
    examiner_notes: 'Always sort the raw data first before picking the middle value.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  // Physics
  {
    id: 'kw-phys-1',
    qualification: 'o_level',
    subject: 'Physics',
    unit_or_topic: 'General Physics',
    keyword: 'Acceleration',
    definition: 'The rate of change of velocity with respect to time (Unit: m/s²). Vector quantity having both magnitude and direction.',
    examiner_notes: 'Must mention "velocity" rather than "speed", as acceleration is a vector.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kw-phys-2',
    qualification: 'o_level',
    subject: 'Physics',
    unit_or_topic: 'Forces & Motion',
    keyword: 'Terminal Velocity',
    definition: 'The constant maximum velocity reached by an object falling through a fluid when upward drag force equals the downward weight.',
    examiner_notes: 'State clearly that resultant force is zero and acceleration is zero at terminal velocity.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kw-phys-3',
    qualification: 'o_level',
    subject: 'Physics',
    unit_or_topic: 'Waves',
    keyword: 'Diffraction',
    definition: 'The spreading out of waves as they pass through a narrow gap or around an obstacle, most pronounced when gap width ≈ wavelength.',
    examiner_notes: 'Wavelength and wave speed do not change during diffraction.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  // Chemistry
  {
    id: 'kw-chem-1',
    qualification: 'o_level',
    subject: 'Chemistry',
    unit_or_topic: 'Atomic Structure',
    keyword: 'Isotopes',
    definition: 'Atoms of the same element having the same number of protons (same atomic number) but different numbers of neutrons (different mass numbers).',
    examiner_notes: 'Must specify "atoms of the same element" for full mark scheme credit.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kw-chem-2',
    qualification: 'o_level',
    subject: 'Chemistry',
    unit_or_topic: 'Chemical Energetics',
    keyword: 'Exothermic Reaction',
    definition: 'A chemical reaction that releases thermal energy to the surroundings, resulting in a temperature increase and negative enthalpy change (ΔH < 0).',
    examiner_notes: 'Cambridge requires stating that energy is transferred to the surroundings.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  // Computer Science / ICT
  {
    id: 'kw-cs-1',
    qualification: 'o_level',
    subject: 'Computer Science',
    unit_or_topic: 'Data Representation',
    keyword: 'Pixel',
    definition: 'The smallest individual identifiable dot or picture element of a digital bitmap image that can be assigned a specific color value.',
    examiner_notes: 'Short for Picture Element.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kw-cs-2',
    qualification: 'o_level',
    subject: 'Computer Science',
    unit_or_topic: 'Computer Networks',
    keyword: 'MAC Address',
    definition: 'A Media Access Control address is a unique 48-bit (6 byte) hardware identifier assigned to a Network Interface Card (NIC) at the factory.',
    examiner_notes: 'Contrasted with IP addresses which are logical and can change based on location.',
    status: 'published',
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_CAMBRIDGE_SCHEDULE: CambridgeExamScheduleRecord[] = [
  {
    id: 'ex-2026-mj-math-p1',
    qualification: 'o_level',
    year: 2026,
    session: 'May/June',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    paper: 'Paper 12 (Non-Calculator)',
    component: '12',
    exam_date: '2026-05-06',
    start_time: '09:00 AM',
    duration_minutes: 120,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ex-2026-mj-math-p2',
    qualification: 'o_level',
    year: 2026,
    session: 'May/June',
    subject: 'Mathematics (Syllabus D)',
    subject_code: '4024',
    paper: 'Paper 22 (Calculator)',
    component: '22',
    exam_date: '2026-05-13',
    start_time: '09:00 AM',
    duration_minutes: 150,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ex-2026-mj-phys-p1',
    qualification: 'o_level',
    year: 2026,
    session: 'May/June',
    subject: 'Physics',
    subject_code: '5054',
    paper: 'Paper 12 (MCQ)',
    component: '12',
    exam_date: '2026-06-09',
    start_time: '02:00 PM',
    duration_minutes: 60,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ex-2026-mj-phys-p2',
    qualification: 'o_level',
    year: 2026,
    session: 'May/June',
    subject: 'Physics',
    subject_code: '5054',
    paper: 'Paper 22 (Theory)',
    component: '22',
    exam_date: '2026-05-18',
    start_time: '09:00 AM',
    duration_minutes: 105,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ex-2026-mj-chem-p2',
    qualification: 'o_level',
    year: 2026,
    session: 'May/June',
    subject: 'Chemistry',
    subject_code: '5070',
    paper: 'Paper 22 (Theory)',
    component: '22',
    exam_date: '2026-05-20',
    start_time: '09:00 AM',
    duration_minutes: 105,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ex-2026-mj-cs-p1',
    qualification: 'o_level',
    year: 2026,
    session: 'May/June',
    subject: 'Computer Science',
    subject_code: '2210',
    paper: 'Paper 12 (Computer Systems)',
    component: '12',
    exam_date: '2026-05-15',
    start_time: '02:00 PM',
    duration_minutes: 105,
    status: 'published',
    updated_at: new Date().toISOString(),
  },
];

// ==========================================
// UNIFIED STORAGE & STATE MANAGEMENT
// ==========================================

const STORAGE_KEYS = {
  TOOLS_META: 'lh_resources_tools_meta_v1',
  GRADE_BOUNDARIES: 'lh_resources_grade_boundaries_v1',
  FORMULA_SHEETS: 'lh_resources_formula_sheets_v1',
  KEYWORDS: 'lh_resources_keywords_v1',
  SCHEDULE: 'lh_resources_schedule_v1',
  TIMETABLE: 'lh_resources_student_timetable_v1',
  SCORE_ATTEMPTS: 'lh_resources_score_attempts_v1',
  LEARNED_KEYWORDS: 'lh_resources_learned_keywords_v1',
};

class ResourcesDataStore {
  private tools: ResourceToolMeta[] = [];
  private gradeBoundaries: GradeBoundaryRecord[] = [];
  private formulaSheets: FormulaSheetRecord[] = [];
  private keywords: KeywordDefinitionRecord[] = [];
  private examSchedule: CambridgeExamScheduleRecord[] = [];

  constructor() {
    this.loadState();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (Object.values(STORAGE_KEYS).includes(e.key || '')) {
          this.loadState();
        }
      });
    }
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const rawTools = localStorage.getItem(STORAGE_KEYS.TOOLS_META);
      const parsedTools: ResourceToolMeta[] = rawTools ? JSON.parse(rawTools) : INITIAL_RESOURCE_TOOLS;
      this.tools = parsedTools
        .filter(t => !REMOVED_TOOL_IDS.includes(t.id))
        .map((t, idx) => ({ ...t, sort_order: idx + 1 }));
      this.persist(STORAGE_KEYS.TOOLS_META, this.tools);

      const rawGb = localStorage.getItem(STORAGE_KEYS.GRADE_BOUNDARIES);
      this.gradeBoundaries = rawGb ? JSON.parse(rawGb) : INITIAL_GRADE_BOUNDARIES;

      const rawFs = localStorage.getItem(STORAGE_KEYS.FORMULA_SHEETS);
      this.formulaSheets = rawFs ? JSON.parse(rawFs) : INITIAL_FORMULA_SHEETS;

      const rawKw = localStorage.getItem(STORAGE_KEYS.KEYWORDS);
      this.keywords = rawKw ? JSON.parse(rawKw) : INITIAL_KEYWORDS;

      const rawSch = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      this.examSchedule = rawSch ? JSON.parse(rawSch) : INITIAL_CAMBRIDGE_SCHEDULE;
    } catch {
      this.tools = INITIAL_RESOURCE_TOOLS;
      this.gradeBoundaries = INITIAL_GRADE_BOUNDARIES;
      this.formulaSheets = INITIAL_FORMULA_SHEETS;
      this.keywords = INITIAL_KEYWORDS;
      this.examSchedule = INITIAL_CAMBRIDGE_SCHEDULE;
    }
  }

  private persist(key: string, data: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // 1. Tools Catalog Management
  getTools(): ResourceToolMeta[] {
    return this.tools;
  }

  getToolById(id: string): ResourceToolMeta | undefined {
    return this.tools.find(t => t.id === id);
  }

  updateToolStatus(id: string, status: ResourceToolMeta['status']) {
    this.tools = this.tools.map(t => t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t);
    this.persist(STORAGE_KEYS.TOOLS_META, this.tools);
  }

  updateToolMeta(id: string, updates: Partial<ResourceToolMeta>) {
    this.tools = this.tools.map(t => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t);
    this.persist(STORAGE_KEYS.TOOLS_META, this.tools);
  }

  // 2. Grade Boundaries
  getGradeBoundaries(subject?: string, year?: number, qualification?: string): GradeBoundaryRecord[] {
    return this.gradeBoundaries.filter(gb => {
      if (gb.status === 'archived') return false;
      if (subject && !gb.subject.toLowerCase().includes(subject.toLowerCase()) && !gb.subject_code.includes(subject)) return false;
      if (year && gb.year !== year) return false;
      if (qualification && qualification !== 'all' && gb.qualification !== qualification) return false;
      return true;
    });
  }

  getAllGradeBoundaries(): GradeBoundaryRecord[] {
    return this.gradeBoundaries;
  }

  saveGradeBoundary(record: GradeBoundaryRecord) {
    const exists = this.gradeBoundaries.findIndex(gb => gb.id === record.id);
    if (exists >= 0) {
      this.gradeBoundaries[exists] = { ...record, updated_at: new Date().toISOString() };
    } else {
      this.gradeBoundaries.unshift({ ...record, updated_at: new Date().toISOString() });
    }
    this.persist(STORAGE_KEYS.GRADE_BOUNDARIES, this.gradeBoundaries);
  }

  deleteGradeBoundary(id: string) {
    this.gradeBoundaries = this.gradeBoundaries.filter(gb => gb.id !== id);
    this.persist(STORAGE_KEYS.GRADE_BOUNDARIES, this.gradeBoundaries);
  }

  // 3. Formula Sheets
  getFormulaSheets(subject?: string, qualification?: string): FormulaSheetRecord[] {
    return this.formulaSheets.filter(fs => {
      if (fs.status === 'archived') return false;
      if (subject && !fs.subject.toLowerCase().includes(subject.toLowerCase())) return false;
      if (qualification && qualification !== 'all' && fs.qualification !== qualification) return false;
      return true;
    });
  }

  getAllFormulaSheets(): FormulaSheetRecord[] {
    return this.formulaSheets;
  }

  saveFormulaSheet(record: FormulaSheetRecord) {
    const exists = this.formulaSheets.findIndex(fs => fs.id === record.id);
    if (exists >= 0) {
      this.formulaSheets[exists] = { ...record, updated_at: new Date().toISOString() };
    } else {
      this.formulaSheets.unshift({ ...record, updated_at: new Date().toISOString() });
    }
    this.persist(STORAGE_KEYS.FORMULA_SHEETS, this.formulaSheets);
  }

  deleteFormulaSheet(id: string) {
    this.formulaSheets = this.formulaSheets.filter(fs => fs.id !== id);
    this.persist(STORAGE_KEYS.FORMULA_SHEETS, this.formulaSheets);
  }

  // 4. Keywords & Definitions
  getKeywords(subject?: string, qualification?: string): KeywordDefinitionRecord[] {
    return this.keywords.filter(kw => {
      if (kw.status === 'archived') return false;
      if (subject && !kw.subject.toLowerCase().includes(subject.toLowerCase())) return false;
      if (qualification && qualification !== 'all' && kw.qualification !== qualification) return false;
      return true;
    });
  }

  getAllKeywords(): KeywordDefinitionRecord[] {
    return this.keywords;
  }

  saveKeyword(record: KeywordDefinitionRecord) {
    const exists = this.keywords.findIndex(kw => kw.id === record.id);
    if (exists >= 0) {
      this.keywords[exists] = { ...record, updated_at: new Date().toISOString() };
    } else {
      this.keywords.unshift({ ...record, updated_at: new Date().toISOString() });
    }
    this.persist(STORAGE_KEYS.KEYWORDS, this.keywords);
  }

  deleteKeyword(id: string) {
    this.keywords = this.keywords.filter(kw => kw.id !== id);
    this.persist(STORAGE_KEYS.KEYWORDS, this.keywords);
  }

  getLearnedKeywordIds(userId: string): string[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.LEARNED_KEYWORDS}_${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  toggleLearnedKeyword(userId: string, keywordId: string): boolean {
    const current = this.getLearnedKeywordIds(userId);
    let updated: string[];
    let isLearned: boolean;
    if (current.includes(keywordId)) {
      updated = current.filter(id => id !== keywordId);
      isLearned = false;
    } else {
      updated = [...current, keywordId];
      isLearned = true;
    }
    localStorage.setItem(`${STORAGE_KEYS.LEARNED_KEYWORDS}_${userId}`, JSON.stringify(updated));
    return isLearned;
  }

  // 5. Cambridge Exam Schedule
  getExamSchedule(year?: number, session?: string): CambridgeExamScheduleRecord[] {
    return this.examSchedule.filter(es => {
      if (es.status === 'archived') return false;
      if (year && es.year !== year) return false;
      if (session && es.session !== session) return false;
      return true;
    });
  }

  getAllExamSchedules(): CambridgeExamScheduleRecord[] {
    return this.examSchedule;
  }

  saveExamSchedule(record: CambridgeExamScheduleRecord) {
    const exists = this.examSchedule.findIndex(es => es.id === record.id);
    if (exists >= 0) {
      this.examSchedule[exists] = { ...record, updated_at: new Date().toISOString() };
    } else {
      this.examSchedule.unshift({ ...record, updated_at: new Date().toISOString() });
    }
    this.persist(STORAGE_KEYS.SCHEDULE, this.examSchedule);
  }

  deleteExamSchedule(id: string) {
    this.examSchedule = this.examSchedule.filter(es => es.id !== id);
    this.persist(STORAGE_KEYS.SCHEDULE, this.examSchedule);
  }

  // 6. Student Timetable (User Specific with Supabase & Offline Cache)
  getStudentTimetable(userId: string): StudentTimetableItem[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.TIMETABLE}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  async getStudentTimetableAsync(userId: string): Promise<StudentTimetableItem[]> {
    const local = this.getStudentTimetable(userId);
    try {
      const { data, error } = await (supabase.from('student_timetables') as any)
        .select('*')
        .eq('user_id', userId)
        .order('exam_date', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: StudentTimetableItem[] = data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          subject: d.subject,
          subject_code: d.subject_code,
          paper: d.paper,
          exam_date: d.exam_date,
          start_time: d.start_time || '09:00 AM',
          duration_minutes: d.duration_minutes || 120,
          room: d.room || 'Main Exam Hall',
          target_grade: d.target_grade || 'A*',
          created_at: d.created_at || new Date().toISOString(),
        }));
        localStorage.setItem(`${STORAGE_KEYS.TIMETABLE}_${userId}`, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {
      console.warn('Could not fetch timetables from Supabase, using local cache:', e);
    }
    return local;
  }

  saveStudentTimetableItem(item: Omit<StudentTimetableItem, 'id' | 'created_at'>): StudentTimetableItem {
    const newItem: StudentTimetableItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const current = this.getStudentTimetable(item.user_id);
    current.push(newItem);
    localStorage.setItem(`${STORAGE_KEYS.TIMETABLE}_${item.user_id}`, JSON.stringify(current));

    // Async Supabase sync
    (supabase.from('student_timetables') as any)
      .insert({
        id: newItem.id,
        user_id: newItem.user_id,
        subject: newItem.subject,
        subject_code: newItem.subject_code,
        paper: newItem.paper,
        exam_date: newItem.exam_date,
        start_time: newItem.start_time,
        duration_minutes: newItem.duration_minutes,
        room: newItem.room,
        target_grade: newItem.target_grade,
      })
      .then(({ error }: any) => {
        if (error) console.warn('Supabase timetable insert warning:', error.message);
      })
      .catch(() => {});

    return newItem;
  }

  deleteStudentTimetableItem(userId: string, id: string) {
    const current = this.getStudentTimetable(userId);
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem(`${STORAGE_KEYS.TIMETABLE}_${userId}`, JSON.stringify(updated));

    // Async Supabase delete
    (supabase.from('student_timetables') as any)
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .then(({ error }: any) => {
        if (error) console.warn('Supabase timetable delete warning:', error.message);
      })
      .catch(() => {});
  }

  exportTimetableToIcs(items: StudentTimetableItem[], filename = 'Cambridge_Exam_Timetable.ics') {
    if (!items || items.length === 0) return;

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

    const formatIcsDate = (dateStr: string, timeStr = '09:00 AM') => {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0]) || 2026;
      const month = parseInt(parts[1]) || 5;
      const day = parseInt(parts[2]) || 1;

      let hour = 9;
      let minute = 0;
      if (timeStr) {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          hour = parseInt(match[1]);
          minute = parseInt(match[2]);
          const ampm = (match[3] || '').toUpperCase();
          if (ampm === 'PM' && hour < 12) hour += 12;
          if (ampm === 'AM' && hour === 12) hour = 0;
        }
      }
      return `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
    };

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LevelHubAI//Cambridge Timetable Builder//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Cambridge Exam Timetable (LevelHubAI)',
      'X-WR-TIMEZONE:UTC',
    ];

    items.forEach((item) => {
      const dtStart = formatIcsDate(item.exam_date, item.start_time);
      icsLines.push(
        'BEGIN:VEVENT',
        `UID:${item.id || crypto.randomUUID()}@levelhubai.com`,
        `DTSTAMP:${formatIcsDate(new Date().toISOString().slice(0, 10), '12:00 PM')}Z`,
        `DTSTART:${dtStart}`,
        `SUMMARY:Cambridge Exam: ${item.subject} (${item.paper})`,
        `DESCRIPTION:Target Grade: ${item.target_grade || 'A*'}\\nDuration: ${item.duration_minutes || 120} mins\\nLocation: ${item.room || 'Main Exam Hall'}\\nLevelHubAI Cambridge Self-Study`,
        `LOCATION:${item.room || 'Main Exam Hall'}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT24H',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: Cambridge ${item.subject} exam tomorrow!`,
        'END:VALARM',
        'END:VEVENT'
      );
    });

    icsLines.push('END:VCALENDAR');

    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 7. Student Flashcards & Leitner Spaced Repetition
  getStudentFlashcards(userId: string): StudentFlashcardRecord[] {
    try {
      const raw = localStorage.getItem(`lh_student_flashcards_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  async getStudentFlashcardsAsync(userId: string, subjectName?: string): Promise<StudentFlashcardRecord[]> {
    const local = this.getStudentFlashcards(userId);
    try {
      let query = (supabase.from('student_flashcards') as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (subjectName && subjectName !== 'all') {
        query = query.ilike('subject_name', `%${subjectName}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        localStorage.setItem(`lh_student_flashcards_${userId}`, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Could not fetch flashcards from Supabase, using local cache:', e);
    }
    return local;
  }

  async saveStudentFlashcardAsync(card: Omit<StudentFlashcardRecord, 'id' | 'created_at'>): Promise<StudentFlashcardRecord> {
    const newCard: StudentFlashcardRecord = {
      ...card,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = this.getStudentFlashcards(card.user_id);
    current.unshift(newCard);
    localStorage.setItem(`lh_student_flashcards_${card.user_id}`, JSON.stringify(current));

    try {
      await (supabase.from('student_flashcards') as any).insert({
        id: newCard.id,
        user_id: newCard.user_id,
        subject_id: newCard.subject_id,
        subject_name: newCard.subject_name,
        topic: newCard.topic || 'General',
        question: newCard.question,
        answer: newCard.answer,
        hint: newCard.hint,
        box_level: newCard.box_level || 1,
        next_review_date: newCard.next_review_date,
        times_reviewed: 0,
        times_correct: 0,
      });
    } catch (e) {
      console.warn('Supabase flashcard insert warning:', e);
    }

    return newCard;
  }

  async updateFlashcardReviewAsync(userId: string, cardId: string, known: boolean): Promise<void> {
    const current = this.getStudentFlashcards(userId);
    const card = current.find(c => c.id === cardId);
    if (!card) return;

    // Leitner intervals: Box 1 (1d), Box 2 (3d), Box 3 (7d), Box 4 (14d), Box 5 (30d)
    const boxIntervals: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
    let newBox = known ? Math.min(5, (card.box_level || 1) + 1) : 1;
    const intervalDays = boxIntervals[newBox] || 1;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    const nextReviewStr = nextDate.toISOString().slice(0, 10);

    card.box_level = newBox;
    card.next_review_date = nextReviewStr;
    card.times_reviewed = (card.times_reviewed || 0) + 1;
    if (known) card.times_correct = (card.times_correct || 0) + 1;
    card.updated_at = new Date().toISOString();

    localStorage.setItem(`lh_student_flashcards_${userId}`, JSON.stringify(current));

    try {
      await (supabase.from('student_flashcards') as any)
        .update({
          box_level: card.box_level,
          next_review_date: card.next_review_date,
          times_reviewed: card.times_reviewed,
          times_correct: card.times_correct,
          updated_at: card.updated_at,
        })
        .eq('id', cardId)
        .eq('user_id', userId);
    } catch {}
  }

  async deleteStudentFlashcardAsync(userId: string, cardId: string): Promise<void> {
    const current = this.getStudentFlashcards(userId);
    const updated = current.filter(c => c.id !== cardId);
    localStorage.setItem(`lh_student_flashcards_${userId}`, JSON.stringify(updated));

    try {
      await (supabase.from('student_flashcards') as any)
        .delete()
        .eq('id', cardId)
        .eq('user_id', userId);
    } catch {}
  }

  // 8. Student Learned Keywords & Glossary Tracking
  async getLearnedKeywordsAsync(userId: string): Promise<string[]> {
    const local = this.getLearnedKeywordIds(userId);
    try {
      const { data, error } = await (supabase.from('student_learned_keywords') as any)
        .select('keyword_id')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) {
        const ids = data.map((d: any) => d.keyword_id);
        localStorage.setItem(`${STORAGE_KEYS.LEARNED_KEYWORDS}_${userId}`, JSON.stringify(ids));
        return ids;
      }
    } catch {}
    return local;
  }

  async toggleLearnedKeywordAsync(userId: string, keywordId: string): Promise<boolean> {
    const isLearned = this.toggleLearnedKeyword(userId, keywordId);
    try {
      if (isLearned) {
        await (supabase.from('student_learned_keywords') as any).upsert({
          user_id: userId,
          keyword_id: keywordId,
          learned_at: new Date().toISOString(),
        });
      } else {
        await (supabase.from('student_learned_keywords') as any)
          .delete()
          .eq('user_id', userId)
          .eq('keyword_id', keywordId);
      }
    } catch {}
    return isLearned;
  }

  // 9. Paper Score Attempts (User Specific)
  async getScoreAttempts(userId: string): Promise<PaperScoreAttemptRecord[]> {
    try {
      const { data, error } = await (supabase.from('past_paper_attempts') as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          subject: d.subject || 'Mathematics',
          qualification: d.qualification || 'O Level',
          paper_name: d.paper_name || `Paper ${d.paper_id || 1}`,
          year: d.year || 2024,
          session: d.session || 'May/June',
          marks_obtained: d.score || d.marks_obtained || 0,
          total_marks: d.total_marks || 80,
          percentage: d.percentage || Math.round(((d.score || 0) / (d.total_marks || 80)) * 100),
          grade: d.grade || 'A',
          attempt_number: d.attempt_number || 1,
          created_at: d.created_at || new Date().toISOString(),
        }));
      }
    } catch {}

    const raw = localStorage.getItem(`${STORAGE_KEYS.SCORE_ATTEMPTS}_${userId}`);
    if (raw) return JSON.parse(raw);
    return [];
  }

  async saveScoreAttempt(attempt: Omit<PaperScoreAttemptRecord, 'id' | 'created_at'>): Promise<PaperScoreAttemptRecord> {
    const newRecord: PaperScoreAttemptRecord = {
      ...attempt,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    // Try Supabase insert
    try {
      await (supabase.from('past_paper_attempts') as any).insert({
        id: newRecord.id,
        user_id: newRecord.user_id,
        score: newRecord.marks_obtained,
        total_marks: newRecord.total_marks,
        percentage: newRecord.percentage,
        time_taken_seconds: (newRecord.duration_minutes || 60) * 60,
      });
    } catch {}

    // Store in local persistence
    const current = await this.getScoreAttempts(attempt.user_id);
    current.unshift(newRecord);
    localStorage.setItem(`${STORAGE_KEYS.SCORE_ATTEMPTS}_${attempt.user_id}`, JSON.stringify(current));
    return newRecord;
  }
}

export const resourcesStore = new ResourcesDataStore();
