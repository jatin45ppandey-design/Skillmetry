-- Phase A1: canonical Full Stack career. Existing careers and learner records
-- remain untouched; this migration only adds a new catalog option and its links.

insert into public.careers (id, title, description, version) values
  ('full-stack-developer', 'Full Stack Developer', 'Build complete, dependable web applications', 1)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  version = excluded.version;

insert into public.career_skills (career_id, skill_id, weight) values
  ('full-stack-developer', 'html', 7),
  ('full-stack-developer', 'css', 6),
  ('full-stack-developer', 'javascript', 12),
  ('full-stack-developer', 'typescript', 10),
  ('full-stack-developer', 'react', 12),
  ('full-stack-developer', 'node', 14),
  ('full-stack-developer', 'rest-api', 12),
  ('full-stack-developer', 'sql', 10),
  ('full-stack-developer', 'authentication', 6),
  ('full-stack-developer', 'testing', 5),
  ('full-stack-developer', 'docker', 3),
  ('full-stack-developer', 'deployment', 3)
on conflict (career_id, skill_id) do update set weight = excluded.weight;
