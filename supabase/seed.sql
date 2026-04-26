-- Seed depends on real auth users. First create these users via Supabase Auth:
--   admin@hospital.local
--   doctor1@hospital.local
-- Then run this script.

insert into public.users (id, email, role)
select au.id, au.email, 'admin'
from auth.users au
where au.email = 'admin@hospital.local'
on conflict (id) do update
set email = excluded.email,
    role = excluded.role;

insert into public.users (id, email, role)
select au.id, au.email, 'doctor'
from auth.users au
where au.email = 'doctor1@hospital.local'
on conflict (id) do update
set email = excluded.email,
    role = excluded.role;

insert into public.doctors (user_id, name, specialization, department)
select u.id, 'Dr. Sarah James', 'Cardiology', 'Cardiology'
from public.users u
where u.email = 'doctor1@hospital.local' and u.role = 'doctor'
on conflict (user_id) do update
set name = excluded.name,
    specialization = excluded.specialization,
    department = excluded.department;
