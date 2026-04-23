-- Add last_active_date to profiles
ALTER TABLE profiles ADD COLUMN last_active_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Add DELETE policy for quests (so users can delete their own quests)
CREATE POLICY "Users can delete own quests" ON quests FOR DELETE USING (auth.uid() = user_id);
