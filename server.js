const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password@123',
  database: 'DBMS_Project'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Get full bus info
app.get('/buses/full', (req, res) => {
  db.query(`
    SELECT 
      bu.bus_number, 
      bu.capacity, 
      d.name AS driver,
      bu.status,
      bs.name AS bus_stop,
      bu.bus_type
    FROM buses bu
    LEFT JOIN drivers d ON bu.driver_id = d.id
    LEFT JOIN bus_stops bs ON bu.bus_stop_id = bs.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get all routes with duration in hours/minutes and fare
app.get('/routes', (req, res) => {
  db.query(`
    SELECT 
      r.id AS route_id,
      o.name AS origin,
      d.name AS destination,
      r.distance_km,
      r.fare,
      ROUND(r.distance_km / 50) AS hours,
      ROUND((r.distance_km % 50) / 50 * 60) AS minutes
    FROM routes r
    JOIN bus_stops o ON r.origin_bus_stop_id = o.id
    JOIN bus_stops d ON r.destination_bus_stop_id = d.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get all bookings with passenger info
app.get('/bookings', (req, res) => {
  db.query(`
    SELECT 
      b.id AS booking_id,
      p.name AS passenger_name,
      bu.bus_number,
      CONCAT(o.name, ' - ', d.name) AS route,
      b.booking_time,
      b.amount,
      b.status,
      b.ticket_number,
      b.payment_method,
      b.payment_status,
      b.seat_number
    FROM bookings b
    JOIN passengers p ON b.passenger_id = p.id
    JOIN buses bu ON b.bus_id = bu.id
    JOIN routes r ON b.route_id = r.id
    JOIN bus_stops o ON r.origin_bus_stop_id = o.id
    JOIN bus_stops d ON r.destination_bus_stop_id = d.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Dashboard summary
app.get('/dashboard/summary', (req, res) => {
  db.query(`
    SELECT 
      (SELECT COUNT(*) FROM buses) AS totalBuses,
      (SELECT COUNT(*) FROM routes) AS totalRoutes,
      (SELECT COUNT(*) FROM bookings) AS totalBookings,
      (SELECT SUM(amount) FROM bookings) AS totalRevenue
  `, (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});

// Get basic bus info
app.get('/buses', (req, res) => {
  db.query(`
    SELECT 
      bu.bus_number, 
      bu.capacity, 
      d.name AS driver
    FROM buses bu
    LEFT JOIN drivers d ON bu.driver_id = d.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get drivers with assigned bus and availability
app.get('/drivers', (req, res) => {
  db.query(`
    SELECT 
      d.name AS driver, 
      b.bus_number AS assigned_bus,
      d.availability
    FROM drivers d
    LEFT JOIN buses b ON d.id = b.driver_id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
app.post('/staff/login', (req, res) => {
  const { email, password } = req.body;

  // Query staff by email
  db.query('SELECT * FROM staff WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const staff = results[0];
    console.log("Input:", password);
console.log("Stored:", staff.password);
    // Compare the input password with existing data
    if (password !== staff.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Login success
    res.json({ 
      message: 'Login successful', 
      staffId: staff.id, 
      name: staff.name, 
      role: staff.role, 
      status: staff.status 
    });
  });
});



app.listen(3000, () => console.log('Server running on http://localhost:3000'));
