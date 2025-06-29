
-- Drop the existing unique constraint on username
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS providers_username_key;

-- Create a partial unique index that only enforces uniqueness for non-NULL usernames
CREATE UNIQUE INDEX providers_username_unique_idx ON public.providers (username) WHERE username IS NOT NULL;
