
-- Function to mark task as complete
CREATE OR REPLACE FUNCTION complete_task(task_id UUID, is_completed BOOLEAN)
RETURNS SETOF tasks
LANGUAGE SQL
SECURITY DEFINER
AS $$
    UPDATE tasks
    SET completed = is_completed, updatedAt = CURRENT_TIMESTAMP
    WHERE id = task_id AND auth.uid() = user_id
    RETURNING *;
$$;

-- Function to get upcoming tasks for a user
CREATE OR REPLACE FUNCTION get_upcoming_tasks(days INTEGER DEFAULT 7)
RETURNS SETOF tasks
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT * FROM tasks
    WHERE user_id = auth.uid()
    AND dueDate >= CURRENT_TIMESTAMP
    AND dueDate <= CURRENT_TIMESTAMP + (days || ' days')::interval
    ORDER BY dueDate ASC;
$$;

-- Function to get tasks statistics for a user
CREATE OR REPLACE FUNCTION get_tasks_stats()
RETURNS TABLE(
    total_tasks BIGINT,
    completed_tasks BIGINT,
    pending_tasks BIGINT,
    overdue_tasks BIGINT,
    completion_percentage NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE completed = TRUE) as completed,
            COUNT(*) FILTER (WHERE completed = FALSE) as pending,
            COUNT(*) FILTER (WHERE completed = FALSE AND dueDate < CURRENT_TIMESTAMP) as overdue
        FROM tasks
        WHERE user_id = auth.uid()
    )
    SELECT 
        total as total_tasks,
        completed as completed_tasks,
        pending as pending_tasks,
        overdue as overdue_tasks,
        CASE WHEN total > 0 THEN ROUND((completed::numeric / total::numeric) * 100, 2) ELSE 0 END as completion_percentage
    FROM stats;
$$;
