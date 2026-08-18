# KSRTC Bus Management System

A full-stack bus management dashboard for KSRTC that lets staff manage buses, routes, schedules, bookings, and drivers through an interactive web interface.

## Features

- **Role-based authentication** — Staff login with roles: `admin`, `operator`, `conductor`
- **Quick Login** — One-click login buttons on the login page for each role, using real active staff accounts (no credentials needed for demo purposes)
- **Dashboard** — Summary cards (total buses, routes, bookings, revenue) and interactive Chart.js charts (bookings overview, bus utilization)
- **Management views** — Add, edit, delete, and search records for:
  - Buses
  - Routes
  - Schedules
  - Bookings
- **Booking workflow** — Find available trips, book seats, cancel/complete bookings, passenger autocomplete
- **Settings** — Profile editing (email/phone), password change, dark mode theme toggle

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MySQL (mysql2 driver)
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Libraries:** bcrypt (password hashing), Chart.js (charts), Font Awesome (icons)

## Database Schema

Tables: `bus_stops`, `buses`, `drivers`, `routes`, `staff`, `passengers`, `bookings`, `schedules`

Key relationships:
- `buses.driver_id → drivers.id`
- `buses.bus_stop_id → bus_stops.id`
- `routes.origin/destination_bus_stop_id → bus_stops.id`
- `bookings.passenger_id/bus_id/route_id`
- `schedules.bus_id/route_id/driver_id/staff_id`

See `Database structure.txt` for the full schema and `dbms_project_backup.sql` for the seed data.

## Setup

### 1. Create and populate the database

```bash
mysql -u root -p DBMS_Project < dbms_project_backup.sql
```

> Run this from the project folder. If the database does not exist yet, create it first with `CREATE DATABASE DBMS_Project;`

### 2. Install dependencies

```bash
npm install
```

Installs `express`, `mysql2`, `cors`, and `bcrypt`.

### 3. Run the server

```bash
node server.js
```

The server runs on `http://localhost:3000`.

### 4. Open the app

Open `index.html` in a browser. If you are not logged in, you will be redirected to `staff.html` to log in.

## Login

Use the normal email/password form, or use the **Quick Login** buttons to log in with one click as an existing staff member of each role:

| Role        | Example user   |
|-------------|----------------|
| Admin       | Anil Kumar     |
| Operator    | Rekha Nair     |
| Conductor   | Sajith R       |