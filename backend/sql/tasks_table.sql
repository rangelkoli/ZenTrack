
-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT FALSE,
    dueDate TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries by user_id
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Create index for filtering completed tasks
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Example query: Get all tasks for a user
-- SELECT * FROM tasks WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Example query: Get incomplete tasks for a user
-- SELECT * FROM tasks WHERE user_id = '00000000-0000-0000-0000-000000000000' AND completed = FALSE;

-- Example query: Get tasks by category for a user
-- SELECT * FROM tasks WHERE user_id = '00000000-0000-0000-0000-000000000000' AND category = 'Work';

-- Example query: Get tasks due today for a user
-- SELECT * FROM tasks 
-- WHERE user_id = '00000000-0000-0000-0000-000000000000' 
-- AND dueDate::date = CURRENT_DATE;

-- Example query: Get overdue tasks for a user
-- SELECT * FROM tasks 
-- WHERE user_id = '00000000-0000-0000-0000-000000000000' 
-- AND dueDate < CURRENT_TIMESTAMP 
-- AND completed = FALSE;

-- Example query: Get tasks by priority for a user
-- SELECT * FROM tasks 
-- WHERE user_id = '00000000-0000-0000-0000-000000000000' 
-- AND priority = 'high';
