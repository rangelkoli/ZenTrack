
-- Create a function that updates the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that calls the function before an update
CREATE TRIGGER update_tasks_modtime
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Example: Trigger to log task changes (for audit purposes)
CREATE TABLE task_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO task_audit_log (task_id, action, old_data, new_data, changed_by)
    VALUES (
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
        auth.uid()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for all operations
CREATE TRIGGER task_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_changes();
