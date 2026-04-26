create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  full_name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  name text not null,
  specialization text not null,
  department text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  available_date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint schedules_time_check check (start_time < end_time),
  constraint unique_schedule_slot unique (doctor_id, available_date, start_time, end_time)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uniq_patient_slot
  on public.appointments(patient_id, appointment_date, appointment_time)
  where status <> 'Cancelled';

create unique index if not exists uniq_doctor_slot
  on public.appointments(doctor_id, appointment_date, appointment_time)
  where status <> 'Cancelled';

create index if not exists idx_doctors_department on public.doctors(department);
create index if not exists idx_appointments_doctor on public.appointments(doctor_id);
create index if not exists idx_appointments_patient on public.appointments(patient_id);
create index if not exists idx_schedules_doctor_date on public.schedules(doctor_id, available_date);

create or replace function public.touch_appointments_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
before update on public.appointments
for each row execute function public.touch_appointments_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users(id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'patient')
  )
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
