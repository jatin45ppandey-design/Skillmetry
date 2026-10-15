-- Canonical Phase 2A catalog. IDs mirror src/data/catalog.ts exactly.

insert into public.careers (id, title, description, version) values
  ('ml-engineer', 'ML Engineer', 'From datasets to deployed intelligence', 1),
  ('frontend-developer', 'Frontend Developer', 'Interfaces that feel effortless', 1),
  ('backend-developer', 'Backend Developer', 'APIs, systems and trusted infrastructure', 1)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  version = excluded.version;

insert into public.skills (id, label, category, description) values
  ('python', 'Python', 'Foundation', 'Write maintainable Python programs.'),
  ('sql', 'SQL', 'Foundation', 'Query, join and aggregate relational data.'),
  ('math', 'Math & Statistics', 'Foundation', 'Statistics, algebra and basic probability.'),
  ('data-processing', 'Data Processing', 'Core', 'Clean and transform structured datasets.'),
  ('ml-foundations', 'ML Fundamentals', 'Core', 'Train supervised machine-learning models.'),
  ('model-evaluation', 'Model Evaluation', 'Applied', 'Measure model quality and detect leakage.'),
  ('rest-api', 'REST APIs', 'Applied', 'Create and consume API endpoints.'),
  ('docker', 'Docker', 'Applied', 'Containerize services reproducibly.'),
  ('deployment', 'Deployment', 'Applied', 'Deploy and monitor an application.'),
  ('html', 'HTML', 'Foundation', 'Build semantic page structure.'),
  ('css', 'CSS', 'Foundation', 'Implement responsive visual layouts.'),
  ('javascript', 'JavaScript', 'Foundation', 'Use modern language features and async programming.'),
  ('typescript', 'TypeScript', 'Core', 'Write strongly typed JavaScript.'),
  ('react', 'React', 'Core', 'Build component-driven interfaces.'),
  ('accessibility', 'Accessibility', 'Applied', 'Build inclusive, keyboard-accessible interfaces.'),
  ('testing', 'Testing', 'Applied', 'Write reliable unit and integration tests.'),
  ('node', 'Node.js', 'Core', 'Build and debug Node.js services.'),
  ('authentication', 'Authentication', 'Applied', 'Implement secure sessions and authorization.')
on conflict (id) do update set
  label = excluded.label,
  category = excluded.category,
  description = excluded.description;

insert into public.skill_prerequisites (skill_id, prerequisite_skill_id) values
  ('data-processing', 'python'),
  ('ml-foundations', 'python'),
  ('ml-foundations', 'math'),
  ('ml-foundations', 'data-processing'),
  ('model-evaluation', 'ml-foundations'),
  ('deployment', 'rest-api'),
  ('deployment', 'docker'),
  ('css', 'html'),
  ('typescript', 'javascript'),
  ('react', 'javascript'),
  ('react', 'html'),
  ('react', 'css'),
  ('accessibility', 'html'),
  ('accessibility', 'css'),
  ('node', 'javascript'),
  ('authentication', 'rest-api')
on conflict (skill_id, prerequisite_skill_id) do nothing;

insert into public.career_skills (career_id, skill_id, weight) values
  ('ml-engineer', 'python', 15),
  ('ml-engineer', 'sql', 10),
  ('ml-engineer', 'math', 10),
  ('ml-engineer', 'data-processing', 10),
  ('ml-engineer', 'ml-foundations', 20),
  ('ml-engineer', 'model-evaluation', 10),
  ('ml-engineer', 'rest-api', 5),
  ('ml-engineer', 'docker', 10),
  ('ml-engineer', 'deployment', 10),
  ('frontend-developer', 'html', 12),
  ('frontend-developer', 'css', 12),
  ('frontend-developer', 'javascript', 18),
  ('frontend-developer', 'typescript', 12),
  ('frontend-developer', 'react', 18),
  ('frontend-developer', 'accessibility', 10),
  ('frontend-developer', 'testing', 10),
  ('frontend-developer', 'deployment', 8),
  ('backend-developer', 'javascript', 10),
  ('backend-developer', 'typescript', 10),
  ('backend-developer', 'node', 20),
  ('backend-developer', 'rest-api', 15),
  ('backend-developer', 'sql', 15),
  ('backend-developer', 'authentication', 10),
  ('backend-developer', 'docker', 10),
  ('backend-developer', 'testing', 10)
on conflict (career_id, skill_id) do update set weight = excluded.weight;

insert into public.missions (id, career_id, skill_id, title, description, estimated_hours) values
  ('ml-deploy', 'ml-engineer', 'deployment', 'Deploy an ML inference API', 'Wrap a trained model in an API and document its deployment.', 8),
  ('dockerize', 'ml-engineer', 'docker', 'Dockerize a Python service', 'Make your Python app run reproducibly in a container.', 4),
  ('sql-analysis', 'ml-engineer', 'sql', 'SQL data exploration', 'Explore a dataset using joins, group-by and windows.', 4),
  ('react-dashboard', 'frontend-developer', 'react', 'Build an accessible dashboard', 'Create a keyboard-friendly responsive React dashboard.', 7),
  ('typescript-refactor', 'frontend-developer', 'typescript', 'Refactor a JavaScript app', 'Introduce TypeScript types and remove unsafe assumptions.', 4),
  ('node-api', 'backend-developer', 'node', 'Build a tested Node API', 'Create routes, validation and an integration test.', 6),
  ('auth-service', 'backend-developer', 'authentication', 'Secure an authenticated endpoint', 'Implement user ownership and access checks.', 6)
on conflict (id) do update set
  career_id = excluded.career_id,
  skill_id = excluded.skill_id,
  title = excluded.title,
  description = excluded.description,
  estimated_hours = excluded.estimated_hours;
