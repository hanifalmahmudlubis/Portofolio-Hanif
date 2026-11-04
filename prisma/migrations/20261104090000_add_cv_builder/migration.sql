ALTER TABLE "SiteSettings"
  ADD COLUMN "profile" JSONB,
  ADD COLUMN "education" JSONB,
  ADD COLUMN "softSkills" JSONB,
  ADD COLUMN "languages" JSONB,
  ADD COLUMN "cvPreferences" JSONB;
ALTER TABLE "Project" ADD COLUMN "cvHighlights" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Experience"
  ADD COLUMN "employmentType" TEXT,
  ADD COLUMN "responsibilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Certificate" ADD COLUMN "issueDate" TEXT;
ALTER TABLE "Technology"
  ADD COLUMN "skillGroup" TEXT,
  ADD COLUMN "skillOrder" INTEGER NOT NULL DEFAULT 1000,
  ADD COLUMN "showInSkills" BOOLEAN NOT NULL DEFAULT true;

-- Move the existing public skill list into the same catalog used by projects.
-- Match existing names without changing their IDs, categories, or project relations.
CREATE TEMP TABLE "cv_initial_skills" (name TEXT, category TEXT, group_key TEXT, position INTEGER);
INSERT INTO "cv_initial_skills" VALUES
('HTML','Programming','web',0), ('CSS','Programming','web',1),
('JavaScript','Programming','web',2), ('PHP','Programming','web',3),
('Java','Programming','web',4), ('Laravel','Framework','web',5), ('CodeIgniter','Framework','web',6),
('Flutter','Mobile','mobile',0), ('Dart','Mobile','mobile',1),
('SQL','Database','databases',0), ('MySQL','Database','databases',1),
('Python','Machine Learning','machine',0), ('CatBoost','Machine Learning','machine',1),
('Scikit-learn','Machine Learning','machine',2), ('Pandas','Machine Learning','machine',3), ('SHAP','Machine Learning','machine',4),
('Network Troubleshooting','Networking','network',0), ('Cisco','Networking','network',1), ('n8n','Automation','network',2),
('Git','Tools','tools',0), ('GitHub','Tools','tools',1), ('QGIS','Tools','tools',2), ('Figma','Tools','tools',3);
INSERT INTO "Technology" (id,name,category,"skillGroup","skillOrder")
SELECT 'cv_skill_' || md5(s.name), s.name, s.category, s.group_key, s.position
FROM "cv_initial_skills" s
WHERE NOT EXISTS (SELECT 1 FROM "Technology" t WHERE lower(t.name)=lower(s.name));
UPDATE "Technology" t SET "skillGroup"=s.group_key, "skillOrder"=s.position
FROM "cv_initial_skills" s WHERE lower(t.name)=lower(s.name) AND t."skillGroup" IS NULL;
DROP TABLE "cv_initial_skills";
