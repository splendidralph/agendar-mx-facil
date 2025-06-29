
-- Step 2: Update existing data to map to new categories
UPDATE services SET category = 'corte_barberia' WHERE category IN ('haircut', 'beard');
UPDATE services SET category = 'unas' WHERE category = 'nails';
UPDATE services SET category = 'maquillaje_cejas' WHERE category = 'eyebrows';
UPDATE services SET category = 'masajes_relajacion' WHERE category = 'massage';
UPDATE services SET category = 'color_alisado' WHERE category = 'other';

-- Update providers table category field as well
UPDATE providers SET category = 'corte_barberia' WHERE category IN ('haircut', 'beard');
UPDATE providers SET category = 'unas' WHERE category = 'nails';
UPDATE providers SET category = 'maquillaje_cejas' WHERE category = 'eyebrows';
UPDATE providers SET category = 'masajes_relajacion' WHERE category = 'massage';
UPDATE providers SET category = 'color_alisado' WHERE category = 'other';

-- Step 3: Create a new enum type with only the new values
CREATE TYPE service_category_new AS ENUM (
  'corte_barberia',
  'unas', 
  'maquillaje_cejas',
  'cuidado_facial',
  'masajes_relajacion',
  'color_alisado'
);

-- Step 4: Update the services table to use the new enum
ALTER TABLE services ALTER COLUMN category TYPE service_category_new USING category::text::service_category_new;

-- Step 5: Update the providers table to use text for flexibility
ALTER TABLE providers ALTER COLUMN category TYPE text;

-- Step 6: Drop the old enum and rename the new one
DROP TYPE service_category;
ALTER TYPE service_category_new RENAME TO service_category;
