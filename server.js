const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

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

// --- NEW GET Endpoints for Forms ---

// Get drivers list for dropdown
app.get('/drivers/list', (req, res) => {
  db.query('SELECT id, name FROM drivers WHERE availability = "available"', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get bus stops list for dropdown
app.get('/bus_stops/list', (req, res) => {
  db.query('SELECT id, name FROM bus_stops', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get buses list for dropdown
app.get('/buses/list', (req, res) => {
  db.query('SELECT id, bus_number FROM buses WHERE status = "active"', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get routes list for dropdown
app.get('/routes/list', (req, res) => {
  db.query(`
        SELECT r.id, CONCAT(o.name, ' -> ', d.name) AS route_name 
        FROM routes r
        JOIN bus_stops o ON r.origin_bus_stop_id = o.id
        JOIN bus_stops d ON r.destination_bus_stop_id = d.id
    `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get passengers list for dropdown
app.get('/passengers/list', (req, res) => {
  db.query('SELECT id, name FROM passengers', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


// --- NEW POST Endpoints to add data ---

// Add a new bus
app.post('/buses', (req, res) => {
  const { bus_number, capacity, driver_id, bus_stop_id, status, bus_type } = req.body;
  const sql = 'INSERT INTO buses (bus_number, capacity, driver_id, bus_stop_id, status, bus_type) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [bus_number, capacity, driver_id, bus_stop_id, status, bus_type], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Bus added successfully!', busId: result.insertId });
  });
});

// Add a new route
app.post('/routes', (req, res) => {
  const { origin_bus_stop_id, destination_bus_stop_id, distance_km, duration_min, fare } = req.body;
  const sql = 'INSERT INTO routes (origin_bus_stop_id, destination_bus_stop_id, distance_km, duration_min, fare) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [origin_bus_stop_id, destination_bus_stop_id, distance_km, duration_min, fare], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Route added successfully!', routeId: result.insertId });
  });
});

// Add a new booking
app.post('/bookings', (req, res) => {
  const { passenger_id, bus_id, route_id, seat_number, payment_method, payment_status, amount } = req.body;
  // Generate a unique ticket number
  const ticket_number = `KSRTC-${Date.now()}`;
  const booking_time = new Date();

  const sql = `INSERT INTO bookings (passenger_id, bus_id, route_id, seat_number, booking_time, amount, status, ticket_number, payment_method, payment_status) 
               VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)`;

  db.query(sql, [passenger_id, bus_id, route_id, seat_number, booking_time, amount, ticket_number, payment_method, payment_status], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Booking created successfully!', bookingId: result.insertId });
  });
});

// --- NEW PUT Endpoints for Updates ---
app.put('/buses/:id', (req, res) => {
  const { id } = req.params;
  const { bus_number, capacity, driver_id, bus_stop_id, status, bus_type } = req.body;
  const sql = 'UPDATE buses SET bus_number = ?, capacity = ?, driver_id = ?, bus_stop_id = ?, status = ?, bus_type = ? WHERE id = ?';
  db.query(sql, [bus_number, capacity, driver_id || null, bus_stop_id || null, status, bus_type, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Bus updated successfully!' });
  });
});
app.put('/routes/:id', (req, res) => {
  const { id } = req.params;
  const { origin_bus_stop_id, destination_bus_stop_id, distance_km, duration_min, fare } = req.body;
  const sql = 'UPDATE routes SET origin_bus_stop_id = ?, destination_bus_stop_id = ?, distance_km = ?, duration_min = ?, fare = ? WHERE id = ?';
  db.query(sql, [origin_bus_stop_id, destination_bus_stop_id, distance_km, duration_min, fare, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Route updated successfully!' });
  });
});
app.put('/bookings/:id/cancel', (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE bookings SET status = 'cancelled' WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Booking cancelled successfully!' });
  });
});

// --- NEW DELETE Endpoints ---
app.delete('/routes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM routes WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Cannot delete route. It might be associated with existing bookings or schedules.' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Route not found.' });
    res.json({ message: 'Route deleted successfully!' });
  });
});
// DELETE Bus (with dependency check)
app.delete('/buses/:id', (req, res) => {
  const { id } = req.params;
  const { force } = req.query; // Check for a 'force' flag

  // If the 'force' flag is present, bypass the dependency check
  if (force === 'true') {
    db.query('DELETE FROM buses WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error while deleting.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bus not found.' });
      }
      res.json({ message: 'Bus deleted successfully.' });
    });
    return;
  }

  // Check for dependencies in schedules and bookings
  db.query('SELECT route_id FROM schedules WHERE bus_id = ? LIMIT 2', [id], (err, schedules) => {
    if (err) return res.status(500).json({ error: 'Database error while checking dependencies.' });
    db.query('SELECT id FROM bookings WHERE bus_id = ? LIMIT 2', [id], (err, bookings) => {
      if (err) return res.status(500).json({ error: 'Database error while checking dependencies.' });

      let message = '';
      let conflict = false;

      if (schedules.length > 0) {
        conflict = true;
        message += `Bus is part of route: R${schedules[0].route_id.toString().padStart(3, '0')}`;
        if (schedules.length > 1) message += '...';
      }

      if (bookings.length > 0) {
        conflict = true;
        if (schedules.length > 0) message += ' and ';
        message += `has existing bookings: B${bookings[0].id.toString().padStart(3, '0')}`;
        if (bookings.length > 1) message += '...';
      }

      if (conflict) {
        // Return a 409 Conflict status with the warning message
        return res.status(409).json({ error: message });
      }

      // No dependencies, proceed with deletion
      db.query('DELETE FROM buses WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Database error while deleting.' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Bus not found.' });
        }
        res.json({ message: 'Bus deleted successfully.' });
      });
    });
  });
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
      r.duration_min,
      FLOOR(r.duration_min / 60) AS hours,
      r.duration_min % 60 AS minutes
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
    ORDER BY b.booking_time DESC
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
      (SELECT SUM(amount) FROM bookings WHERE payment_status = 'paid') AS totalRevenue
  `, (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});

// Get basic bus info for dashboard
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

// Get drivers with assigned bus and availability for dashboard
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

// Get a single bus's details
app.get('/buses/details/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM buses WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Bus not found.' });
    res.json(results[0]);
  });
});

// Get a single route's details
app.get('/routes/details/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM routes WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Route not found.' });
    res.json(results[0]);
  });
});

// Execute custom SQL query (only SELECT queries for safety)
app.get('/query', (req, res) => {
  const sql = req.query.sql;
  if (!sql) {
    return res.status(400).json({ error: 'No SQL query provided' });
  }
  // Basic safety check: only allow SELECT queries
  if (!sql.trim().toLowerCase().startsWith('select')) {
    return res.status(400).json({ error: 'Only SELECT queries are allowed' });
  }
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
