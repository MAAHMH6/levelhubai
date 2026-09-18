-- Seed A Level Subjects safely
INSERT INTO "public"."subjects" (
  "name", "subject_code", "qualification", "description", "is_premium", "enabled", "display_order", "icon", "color"
)
VALUES
  ('Mathematics', '9709', 'a_level', 'Cambridge International AS and A Level Mathematics (9709)', true, true, 10, '📐', 'blue'),
  ('Physics', '9702', 'a_level', 'Cambridge International AS and A Level Physics (9702)', true, true, 20, '⚡', 'purple'),
  ('Chemistry', '9701', 'a_level', 'Cambridge International AS and A Level Chemistry (9701)', true, true, 30, '🧪', 'cyan'),
  ('Biology', '9700', 'a_level', 'Cambridge International AS and A Level Biology (9700)', true, true, 40, '🧬', 'green'),
  ('Computer Science', '9618', 'a_level', 'Cambridge International AS and A Level Computer Science (9618)', true, true, 50, '💻', 'blue'),
  ('Economics', '9708', 'a_level', 'Cambridge International AS and A Level Economics (9708)', true, true, 60, '📈', 'yellow'),
  ('Business', '9609', 'a_level', 'Cambridge International AS and A Level Business (9609)', true, true, 70, '💼', 'orange'),
  ('Accounting', '9706', 'a_level', 'Cambridge International AS and A Level Accounting (9706)', true, true, 80, '📊', 'red'),
  ('English Language', '9093', 'a_level', 'Cambridge International AS and A Level English Language (9093)', true, true, 90, '📝', 'blue'),
  ('Psychology', '9990', 'a_level', 'Cambridge International AS and A Level Psychology (9990)', true, true, 100, '🧠', 'pink')
ON CONFLICT DO NOTHING;
