-- Add theme color support to providers table
ALTER TABLE public.providers 
ADD COLUMN theme_color text DEFAULT 'blue' CHECK (theme_color IN ('blue', 'green', 'purple', 'orange', 'pink', 'teal', 'red', 'indigo'));

-- Add comment to explain the column
COMMENT ON COLUMN public.providers.theme_color IS 'Theme color for provider profile customization. Available options: blue, green, purple, orange, pink, teal, red, indigo';