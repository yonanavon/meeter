-- AddForeignKey
ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "reminder_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
