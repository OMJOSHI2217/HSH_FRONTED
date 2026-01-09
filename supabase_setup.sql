-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'main' or 'sub'
    parent_id TEXT, -- Can be UUID or String, keeping flexible
    student_ids TEXT[] DEFAULT '{}', -- Array to store student IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL, 
    due_date TEXT, -- Storing as text (ISO string) or DATE
    status TEXT DEFAULT 'pending', -- 'pending' or 'done'
    assigned_to TEXT, -- Student ID
    assigned_to_name TEXT,
    category TEXT,
    description TEXT,
    is_practice_question BOOLEAN DEFAULT FALSE,
    question_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add RLS Policies (Optional but recommended - Basic Open Access for now)
-- Enable RLS but allow public access for now for simplicity in this admin panel context
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read/write for all" ON categories;
CREATE POLICY "Enable read/write for all" ON categories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read/write for all" ON tasks;
CREATE POLICY "Enable read/write for all" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- 4. Fix for missing columns if table already exists (Idempotent-ish)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='student_ids') THEN
        ALTER TABLE categories ADD COLUMN student_ids TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='name') THEN
        ALTER TABLE categories ADD COLUMN name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='type') THEN
        ALTER TABLE categories ADD COLUMN type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='parent_id') THEN
        ALTER TABLE categories ADD COLUMN parent_id TEXT;
    END IF;
END $$;

-- 5. Fix for Check Constraint "categories_type_check"
-- The existing constraint might be rejecting 'main'/'sub'. We will drop it and re-add a compatible one.
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;

-- Allow only 'main' and 'sub' (lowercase) as used in the frontend
ALTER TABLE categories ADD CONSTRAINT categories_type_check CHECK (type IN ('main', 'sub'));


-- 6. Create Education Resources Table
CREATE TABLE IF NOT EXISTS education_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'link')),
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE education_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for all" ON education_resources FOR ALL USING (true) WITH CHECK (true);

