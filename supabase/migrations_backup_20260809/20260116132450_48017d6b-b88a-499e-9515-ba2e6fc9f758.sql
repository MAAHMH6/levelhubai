-- Update Urdu icon to gray book (using BookOpen icon reference and gray color)
UPDATE public.subjects SET icon = 'BookOpen', color = '#6B7280' WHERE id = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

-- Update Pakistan Studies to have a black dot color (using Map icon)
UPDATE public.subjects SET icon = 'Map', color = '#1F2937' WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Update Islamiyat with moon/star icon and teal color
UPDATE public.subjects SET icon = 'Moon', color = '#14B8A6' WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';