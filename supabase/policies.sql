alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.schedules enable row level security;
alter table public.appointments enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.users where id = auth.uid();
$$;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile" on public.users
for select using (id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "Admin manages users" on public.users;
create policy "Admin manages users" on public.users
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "Patient manages own profile" on public.patients;
create policy "Patient manages own profile" on public.patients
for all using (user_id = auth.uid() or public.current_role() = 'admin')
with check (user_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "Doctor profile readable" on public.doctors;
create policy "Doctor profile readable" on public.doctors
for select using (true);

drop policy if exists "Admin manages doctors" on public.doctors;
create policy "Admin manages doctors" on public.doctors
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "Doctor can read own record" on public.doctors;
create policy "Doctor can read own record" on public.doctors
for select using (user_id = auth.uid());

drop policy if exists "Doctor can manage own schedules" on public.schedules;
create policy "Doctor can manage own schedules" on public.schedules
for all
using (
  exists (
    select 1 from public.doctors d
    where d.id = schedules.doctor_id and d.user_id = auth.uid()
  ) or public.current_role() = 'admin'
)
with check (
  exists (
    select 1 from public.doctors d
    where d.id = schedules.doctor_id and d.user_id = auth.uid()
  ) or public.current_role() = 'admin'
);

drop policy if exists "Anyone can read schedules" on public.schedules;
create policy "Anyone can read schedules" on public.schedules
for select using (auth.role() = 'authenticated');

drop policy if exists "Patient can create own appointments" on public.appointments;
create policy "Patient can create own appointments" on public.appointments
for insert with check (
  exists (
    select 1 from public.patients p
    where p.id = appointments.patient_id and p.user_id = auth.uid()
  )
);

drop policy if exists "Patient can read own appointments" on public.appointments;
create policy "Patient can read own appointments" on public.appointments
for select using (
  exists (
    select 1 from public.patients p
    where p.id = appointments.patient_id and p.user_id = auth.uid()
  )
  or public.current_role() = 'admin'
  or exists (
    select 1 from public.doctors d
    where d.id = appointments.doctor_id and d.user_id = auth.uid()
  )
);

drop policy if exists "Patient updates own appointments" on public.appointments;
create policy "Patient updates own appointments" on public.appointments
for update using (
  exists (
    select 1 from public.patients p
    where p.id = appointments.patient_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.patients p
    where p.id = appointments.patient_id and p.user_id = auth.uid()
  )
);

drop policy if exists "Doctor updates own appointments" on public.appointments;
create policy "Doctor updates own appointments" on public.appointments
for update using (
  exists (
    select 1 from public.doctors d
    where d.id = appointments.doctor_id and d.user_id = auth.uid()
  ) or public.current_role() = 'admin'
)
with check (
  exists (
    select 1 from public.doctors d
    where d.id = appointments.doctor_id and d.user_id = auth.uid()
  ) or public.current_role() = 'admin'
);

drop policy if exists "Admin manages appointments" on public.appointments;
create policy "Admin manages appointments" on public.appointments
for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
