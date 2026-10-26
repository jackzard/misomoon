-- Days an import left out because misomoon had counted them already, or an earlier import
-- covers them (keepNew in apps/api/src/imports.ts).
ALTER TABLE imports ADD COLUMN skipped_days INTEGER NOT NULL DEFAULT 0;
