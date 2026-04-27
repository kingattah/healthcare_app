# Online Hospital Appointment Booking and Management System (Edo State University Teaching Hospital as a Case Study)

Production-ready modular web app using Bootstrap 5 frontend + Supabase Auth/Database/Realtime backend. Branding strings (full project name, navigation labels) live in `js/config.js` as `APP_FULL_NAME`, `APP_NAV_TITLE`, and `APP_NAV_SUBTITLE`. Page `<title>` tags use a short “ESUTH hospital appointments” suffix for readability in browser tabs.

## Stack
- Frontend: HTML, CSS, JavaScript, Bootstrap 5
- Backend: Supabase (Auth, Postgres, Realtime, RLS)
- Architecture: modular page controllers + reusable services/components

## Project Structure
- `index.html`, `login.html`, `register.html`
- `dashboard/patient.html`, `dashboard/doctor.html`, `dashboard/admin.html`
- `js/`
  - `supabaseClient.js`, `auth.js`, `booking.js`, `dashboard.js`
  - `services/` (`authService`, `bookingService`, `doctorService`, `adminService`, `uiService`)
  - `pages/` (`indexPage`, `loginPage`, `registerPage`, `patientPage`, `doctorPage`, `adminPage`)
- `css/main.css`
- `components/navbar.js`
- `supabase/schema.sql`, `supabase/policies.sql`, `supabase/seed.sql`

## Setup
1. Create a Supabase project.
2. Run SQL scripts in this order:
   1. `supabase/schema.sql`
   2. `supabase/policies.sql`
   3. `supabase/seed.sql` (optional sample data)
3. Copy `js/config.example.js` values into `js/config.js`.
4. Serve the folder with a static server.

## Deploy to GitHub Pages
1. Push to GitHub.
2. Open repository settings -> Pages.
3. Set source to `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for the deployment URL.

This project uses relative links so it works on GitHub Pages project URLs such as:
- `https://<username>.github.io/healthcare_app/`

## Auth + Roles
- Signup: email/password with role metadata (`patient`, `doctor`, `admin`)
- `users` table is synced from `auth.users` via trigger
- Page access is protected by role checks in frontend + RLS in database

## Functional Notes
- Patient:
  - browse departments/doctors
  - select available schedule slots
  - book, cancel, and reschedule appointments
  - view history
- Doctor:
  - set daily availability windows
  - view assigned appointments
  - update status (`Confirmed`, `Completed`, `Cancelled`)
- Admin:
  - view all users/doctors/appointments
  - create doctor profile from existing auth user
  - monitor analytics cards

## Realtime
- Dashboard pages subscribe to appointment table changes and auto-refresh.

## Production Recommendations
- Add server-side admin APIs for sensitive operations.
- Replace prompt-based reschedule with modal picker.
- Add email notifications and audit logs.
- Add test coverage (integration + UI e2e).
