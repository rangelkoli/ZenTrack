
-- Habits table for storing habit definitions
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  color VARCHAR(20) DEFAULT '#4CAF50',
  icon VARCHAR(50),
  archived BOOLEAN DEFAULT FALSE,
  frequency JSONB DEFAULT '{"type": "daily", "days": [1,2,3,4,5,6,0]}'::jsonb,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Habit completions for tracking each instance of habit completion
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL,
  completed_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE (habit_id, completed_at)
);

-- Habit streaks for performance optimization
CREATE TABLE IF NOT EXISTS habit_streaks (
  habit_id UUID PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_completed_at DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
