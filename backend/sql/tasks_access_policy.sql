
-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own tasks
CREATE POLICY user_tasks_policy ON tasks
    FOR ALL
    USING (auth.uid() = user_id);

-- Allow the service role to access all tasks (for admin purposes)
CREATE POLICY service_role_policy ON tasks
    FOR ALL
    USING (auth.role() = 'service_role');
    
-- If you need more granular control, you could create separate policies for different operations:

-- Policy for selecting (viewing) tasks
CREATE POLICY user_select_tasks_policy ON tasks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for inserting (creating) tasks
CREATE POLICY user_insert_tasks_policy ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for updating tasks
CREATE POLICY user_update_tasks_policy ON tasks
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy for deleting tasks
CREATE POLICY user_delete_tasks_policy ON tasks
    FOR DELETE
    USING (auth.uid() = user_id);
