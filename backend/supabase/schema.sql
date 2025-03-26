-- Create the meals table with ordered status
CREATE TABLE IF NOT EXISTS public.meals (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type VARCHAR(10) NOT NULL,   -- "P" (Soup) or "1", "2", "3", etc. (Meal Type)
  name TEXT NOT NULL,          -- Meal name
  price DECIMAL(5,2) NOT NULL DEFAULT 0.00,  -- Meal price
  database_source VARCHAR(10) NOT NULL DEFAULT 'S4',  -- Source database
  order_end_time TIMESTAMP WITH TIME ZONE,  -- Meal order end time
  is_ordered BOOLEAN DEFAULT false,         -- Whether this meal is ordered
  quantity INTEGER DEFAULT 0,               -- Number of ordered items
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Create a unique constraint for meal identification
  CONSTRAINT unique_meal UNIQUE (date, type, name)
);

