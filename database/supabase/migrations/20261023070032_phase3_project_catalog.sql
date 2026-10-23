-- Phase 3 project catalog additions. Source-only until explicitly approved and
-- rehearsed with the complete migration chain and owner-scoped workflow tests.
insert into public.missions(id,career_id,skill_id,title,description,estimated_hours) values
  ('frontend-component-library','frontend-developer','accessibility','Ship an accessible component library','Design, document and test a small reusable component set across keyboard and responsive states.',9),
  ('backend-service-observability','backend-developer','testing','Harden an observable API service','Add bounded errors, health reporting and operational signals to a small backend service.',7)
on conflict (id) do nothing;
