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

app.get('/buses/full', (req, res) => {
  db.query('SELECT bus_number, capacity, driver, status FROM buses', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/routes', (req, res) => {
  db.query(`
    SELECT 
      id AS route_id,
      origin,
      destination,
      distance_km,
      ROUND(distance_km / 50) AS hours,
      ROUND((distance_km % 50) / 50 * 60) AS minutes
    FROM routes
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/bookings', (req, res) => {
  db.query(`
    SELECT 
      b.id AS booking_id,
      b.passenger_name,
      bu.bus_number,
      CONCAT(r.origin, ' - ', r.destination) AS route,
      b.booking_date,
      p.amount,
      b.status
    FROM bookings b
    JOIN buses bu ON b.bus_id = bu.id
    JOIN routes r ON b.route_id = r.id
    JOIN payments p ON b.id = p.booking_id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

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

app.get('/buses', (req, res) => {
  db.query('SELECT bus_number, capacity, driver FROM buses', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/drivers', (req, res) => {
  db.query(`
    SELECT d.name AS driver, b.bus_number AS assigned_bus 
    FROM drivers d
    LEFT JOIN buses b ON d.bus_id = b.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/buses/full', (req, res) => {
  db.query('SELECT bus_number, capacity, driver, status FROM buses', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/routes', (req, res) => {
  db.query('SELECT * FROM routes', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/bookings', (req, res) => {
  db.query(`
    SELECT 
      b.id AS booking_id,
      b.passenger_name,
      bu.bus_number,
      CONCAT(r.origin, ' - ', r.destination) AS route,
      b.booking_date,
      b.amount,
      b.status
    FROM bookings b
    JOIN buses bu ON b.bus_id = bu.id
    JOIN routes r ON b.route_id = r.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));