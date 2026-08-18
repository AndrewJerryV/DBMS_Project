const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Add this line
const saltRounds = 10; // Add this line for bcrypt

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

// --- THIS QUERY IS UPDATED ---
// The driver list now shows available drivers who are either unassigned OR assigned to a bus under maintenance.
app.get('/drivers/list', (req, res) => {
  const { currentDriverId } = req.query;
  let sql = `
    SELECT d.id, d.name
    FROM drivers d
    LEFT JOIN buses b ON d.id = b.driver_id
    WHERE d.availability = 'available' AND b.id IS NULL
  `;
  const params = [];

  if (currentDriverId) {
    sql += ` UNION SELECT id, name FROM drivers WHERE id = ? `;
    params.push(currentDriverId);
  }

  sql += ' ORDER BY name;';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching drivers.' });
    res.json(results);
  });
});

app.get('/bus_stops/list', (req, res) => {
  db.query('SELECT id, name FROM bus_stops', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/buses/list', (req, res) => {
  db.query('SELECT id, bus_number FROM buses WHERE status = "active"', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

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

app.get('/passengers/list', (req, res) => {
  db.query('SELECT id, name FROM passengers', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/staff/list', (req, res) => {
  const sql = "SELECT id, name FROM staff WHERE role IN ('conductor', 'operator') AND status = 'active'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching staff.' });
    res.json(results);
  });
});

app.get('/passengers/search', (req, res) => {
    const { term } = req.query;
    if (!term) {
        return res.json([]);
    }
    const searchTerm = `%${term}%`;
    const sql = 'SELECT id, name, email, phone FROM passengers WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? LIMIT 10';
    db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database search error.' });
        }
        res.json(results);
    });
});

app.get('/bookings/find-trips', (req, res) => {
    const { originId, destinationId } = req.query;

    if (!originId || !destinationId) {
        return res.status(400).json({ error: 'Origin and Destination IDs are required.' });
    }
    const sql = `
        SELECT
            s.id AS schedule_id, s.departure_time, s.arrival_time,
            b.id AS bus_id, b.bus_number, b.bus_type,
            r.id AS route_id, r.fare,
            FLOOR(r.duration_min / 60) AS hours, r.duration_min % 60 AS minutes
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN routes r ON s.route_id = r.id
        WHERE r.origin_bus_stop_id = ? AND r.destination_bus_stop_id = ?
          AND s.status = 'scheduled' AND s.departure_time > NOW()
        ORDER BY s.departure_time;
    `;
    db.query(sql, [originId, destinationId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error while finding trips.' });
        }
        res.json(results);
    });
});

app.get('/schedules', (req, res) => {
  const sql = `
    SELECT
      s.id, s.departure_time, s.arrival_time, s.status,
      b.bus_number,
      CONCAT(o.name, ' -> ', d.name) AS route_name
    FROM schedules s
    LEFT JOIN buses b ON s.bus_id = b.id
    LEFT JOIN routes r ON s.route_id = r.id
    LEFT JOIN bus_stops o ON r.origin_bus_stop_id = o.id
    LEFT JOIN bus_stops d ON r.destination_bus_stop_id = d.id
    ORDER BY s.departure_time DESC;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- POST Endpoints to add data ---

app.post('/schedules', (req, res) => {
  const { bus_id, route_id, departure_time, arrival_time, driver_id, staff_id } = req.body;
  const sql = 'INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, driver_id, staff_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [bus_id, route_id, departure_time, arrival_time, driver_id, staff_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Schedule created successfully!', scheduleId: result.insertId });
  });
});

// PUT to update a schedule's status
app.put('/schedules/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  // Only allow 'scheduled' or 'cancelled' as valid statuses
  if (!['scheduled', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' });
  }
  const sql = 'UPDATE schedules SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Schedule not found.' });
    res.json({ message: `Schedule status updated to ${status}.` });
  });
});

// DELETE a schedule
app.delete('/schedules/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM schedules WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'This schedule may have bookings. Cannot delete.' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Schedule not found.' });
    res.json({ message: 'Schedule deleted successfully.' });
  });
});

app.get('/schedules/details/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM schedules WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Schedule not found.' });
    res.json(results[0]);
  });
});

// Add with other PUT endpoints to handle updates
app.put('/schedules/:id', (req, res) => {
    const { id } = req.params;
    // The driver_id is sent from the client after being fetched there
    const { bus_id, route_id, departure_time, arrival_time, staff_id, driver_id } = req.body;
    const sql = 'UPDATE schedules SET bus_id = ?, route_id = ?, departure_time = ?, arrival_time = ?, driver_id = ?, staff_id = ? WHERE id = ?';
    
    db.query(sql, [bus_id, route_id, departure_time, arrival_time, driver_id, staff_id, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Schedule not found.' });
        res.json({ message: 'Schedule updated successfully!' });
    });
});

app.post('/buses', (req, res) => {
  const { bus_number, capacity, driver_id, bus_stop_id, status, bus_type } = req.body;
  const sql = 'INSERT INTO buses (bus_number, capacity, driver_id, bus_stop_id, status, bus_type) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [bus_number, capacity, driver_id || null, bus_stop_id, status, bus_type], (err, result) => {
    if (err) {
      // Check for the unique constraint violation error
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: `Bus number '${bus_number}' already exists.` });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Bus added successfully!', busId: result.insertId });
  });
});

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

app.post('/passengers', (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required.' });
    }
    const sql = 'INSERT INTO passengers (name, email, phone) VALUES (?, ?, ?)';
    db.query(sql, [name, email, phone || null], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                db.query('SELECT id FROM passengers WHERE email = ?', [email], (findErr, findResults) => {
                    if (findErr) return res.status(500).json({ error: 'Database error.' });
                    if (findResults.length > 0) {
                        return res.status(200).json({ 
                            message: 'Passenger with this email already exists.', 
                            passengerId: findResults[0].id 
                        });
                    }
                    return res.status(409).json({ error: 'A passenger with this email already exists.' });
                });
            } else {
                console.error(err);
                return res.status(500).json({ error: 'Database error while creating passenger.' });
            }
        } else {
            res.status(201).json({ message: 'Passenger created!', passengerId: result.insertId });
        }
    });
});


// Add a new booking
app.post('/bookings', (req, res) => {
  const { passenger_id, bus_id, route_id, seat_number, payment_method, payment_status, amount } = req.body;
  const ticket_number = `KSRTC-${Date.now()}`;
  const booking_time = new Date();
  
  const sql = `INSERT INTO bookings (passenger_id, bus_id, route_id, seat_number, booking_time, amount, status, ticket_number, payment_method, payment_status) 
               VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`;

  db.query(sql, [passenger_id, bus_id, route_id, seat_number, booking_time, amount, ticket_number, payment_method, payment_status], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Booking created successfully!', bookingId: result.insertId });
  });
});

// --- PUT Endpoints for Updates ---
app.put('/buses/:id', (req, res) => {
  const { id } = req.params;
  const { bus_number, capacity, driver_id, bus_stop_id, status, bus_type } = req.body;
  let finalDriverId = driver_id || null;
  let message = 'Bus updated successfully!';

  if (status === 'maintenance') {
    finalDriverId = null;
    message = 'Bus set to maintenance and driver has been un-assigned.';
  }

  const sql = 'UPDATE buses SET bus_number = ?, capacity = ?, driver_id = ?, bus_stop_id = ?, status = ?, bus_type = ? WHERE id = ?';
  db.query(sql, [bus_number, capacity, finalDriverId, bus_stop_id || null, status, bus_type, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Bus not found.' });
    res.json({ message: message });
  });
});

app.delete('/bookings/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM bookings WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Booking deleted permanently.' });
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

// --- NEW ENDPOINT TO COMPLETE BOOKING ---
app.put('/bookings/:id/complete', (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE bookings SET status = 'completed', payment_status = 'paid' WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Booking marked as completed successfully!' });
  });
});


// --- DELETE Endpoints ---
app.delete('/buses/:id', (req, res) => {
  const { id } = req.params;
  const { force } = req.query; 

  if (force === 'true') {
    db.query('DELETE FROM bookings WHERE bus_id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query('DELETE FROM schedules WHERE bus_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query('DELETE FROM buses WHERE id = ?', [id], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          if (result.affectedRows === 0) return res.status(404).json({ error: 'Bus not found.' });
          res.json({ message: 'Bus and associated records deleted successfully.' });
        });
      });
    });
    return;
  }

  db.query('SELECT 1 FROM schedules WHERE bus_id = ? LIMIT 1', [id], (err, schedules) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT 1 FROM bookings WHERE bus_id = ? LIMIT 1', [id], (err, bookings) => {
      if (err) return res.status(500).json({ error: err.message });
      if (schedules.length > 0 || bookings.length > 0) {
        return res.status(409).json({ error: 'Bus has dependencies (schedules or bookings).' });
      }
      db.query('DELETE FROM buses WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Bus not found.' });
        res.json({ message: 'Bus deleted successfully.' });
      });
    });
  });
});

app.delete('/routes/:id', (req, res) => {
  const { id } = req.params;
  const { force } = req.query;

  if (force === 'true') {
    db.query('DELETE FROM bookings WHERE route_id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query('DELETE FROM schedules WHERE route_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query('DELETE FROM routes WHERE id = ?', [id], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          if (result.affectedRows === 0) return res.status(404).json({ error: 'Route not found.' });
          res.json({ message: 'Route and associated records deleted successfully!' });
        });
      });
    });
    return;
  }

  db.query('SELECT 1 FROM schedules WHERE route_id = ? LIMIT 1', [id], (err, schedules) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT 1 FROM bookings WHERE route_id = ? LIMIT 1', [id], (err, bookings) => {
      if (err) return res.status(500).json({ error: err.message });
      if (schedules.length > 0 || bookings.length > 0) {
        return res.status(409).json({ error: 'Route has dependencies (schedules or bookings).' });
      }
      db.query('DELETE FROM routes WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Route not found.' });
        res.json({ message: 'Route deleted successfully!' });
      });
    });
  });
});

// --- GET Endpoints for Data Tables ---

app.get('/buses/full', (req, res) => {
  db.query(`
    SELECT 
      bu.id AS id, bu.bus_number, bu.capacity, 
      d.name AS driver, bu.status, bs.name AS bus_stop, bu.bus_type
    FROM buses bu
    LEFT JOIN drivers d ON bu.driver_id = d.id
    LEFT JOIN bus_stops bs ON bu.bus_stop_id = bs.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/routes', (req, res) => {
  db.query(`
    SELECT 
      r.id AS route_id, o.name AS origin, d.name AS destination, r.distance_km, r.fare, r.duration_min,
      FLOOR(r.duration_min / 60) AS hours, r.duration_min % 60 AS minutes
    FROM routes r
    JOIN bus_stops o ON r.origin_bus_stop_id = o.id
    JOIN bus_stops d ON r.destination_bus_stop_id = d.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/bookings', (req, res) => {
  db.query(`
    SELECT 
      b.id AS booking_id, p.name AS passenger_name, bu.bus_number,
      CONCAT(o.name, ' - ', d.name) AS route,
      b.booking_time, b.amount, b.status, b.ticket_number,
      b.payment_method, b.payment_status, b.seat_number
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


// --- Dashboard Endpoints ---

app.get('/dashboard/summary', (req, res) => {
  db.query(`
    SELECT 
      (SELECT COUNT(*) FROM buses) AS totalBuses,
      (SELECT COUNT(*) FROM routes) AS totalRoutes,
      (SELECT COUNT(*) FROM bookings WHERE status != 'cancelled') AS totalBookings,
      (SELECT SUM(amount) FROM bookings WHERE payment_status = 'paid') AS totalRevenue
  `, (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});

app.get('/buses', (req, res) => {
  db.query(`
    SELECT bu.bus_number, bu.capacity, d.name AS driver
    FROM buses bu LEFT JOIN drivers d ON bu.driver_id = d.id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/drivers', (req, res) => {
  db.query(`
    SELECT
      d.name AS driver,
      CASE
        WHEN d.availability = 'on_leave' THEN NULL
        ELSE b.bus_number
      END AS assigned_bus,
      d.availability
    FROM drivers d
    LEFT JOIN buses b ON d.id = b.driver_id
  `, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// --- Staff & Auth Endpoints ---

const STAFF_ROLES = ['admin', 'operator', 'conductor'];

app.get('/staff/quick-login/users', (req, res) => {
  const sql = `
    SELECT s.id, s.name, s.role
    FROM staff s
    JOIN (
      SELECT role, MIN(id) AS min_id
      FROM staff
      WHERE status = 'active' AND role IN (?)
      GROUP BY role
    ) first_user ON first_user.role = s.role AND first_user.min_id = s.id
    WHERE s.status = 'active'
    ORDER BY FIELD(s.role, 'admin', 'operator', 'conductor');
  `;
  db.query(sql, [STAFF_ROLES], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching quick login users.' });
    res.json(results);
  });
});

app.post('/staff/quick-login', (req, res) => {
  const { role } = req.body;
  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role provided.' });
  }
  const sql = 'SELECT id, name, role FROM staff WHERE role = ? AND status = "active" ORDER BY id LIMIT 1';
  db.query(sql, [role], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: `No active ${role} staff found.` });
    const staff = results[0];
    res.json({ message: 'Login successful', staffId: staff.id, name: staff.name, role: staff.role });
  });
});

app.post('/staff/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM staff WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email' });
    const staff = results[0];
    // Compare submitted password with the stored hash
    bcrypt.compare(password, staff.password, (bcryptErr, isMatch) => {
      if (bcryptErr) return res.status(500).json({ error: 'Error during authentication' });
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      res.json({ message: 'Login successful', staffId: staff.id, name: staff.name, role: staff.role });
    });
  });
});

app.get('/staff/details/:id', (req, res) => {
  const { id } = req.params;
  // This query is updated to include the 'salary' column
  const sql = 'SELECT id, name, role, email, phone, status, date_joined, salary FROM staff WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Staff not found.' });
    res.json(results[0]);
  });
});

app.put('/staff/:id', (req, res) => {
    const { id } = req.params;
    const { phone, email } = req.body; 
    if (!phone || !email) {
        return res.status(400).json({ error: 'Phone and email are required.' });
    }
    const sql = 'UPDATE staff SET phone = ?, email = ? WHERE id = ?';
    db.query(sql, [phone, email, id], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'This email is already in use.' });
            }
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Staff not found.' });
        }
        res.json({ message: 'Profile updated successfully!' });
    });
});

// --- Details for Edit Modals ---

app.get('/buses/details/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM buses WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Bus not found.' });
    res.json(results[0]);
  });
});

app.get('/routes/details/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM routes WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Route not found.' });
    res.json(results[0]);
  });
});


// --- Chart Data Endpoints ---

app.get('/dashboard/bookings-by-day', (req, res) => {
  const sql = `
    SELECT DATE_FORMAT(booking_time, '%Y-%m-%d') as date, COUNT(*) as count
    FROM bookings
    GROUP BY DATE_FORMAT(booking_time, '%Y-%m-%d')
    ORDER BY date DESC
    LIMIT 7;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching chart data' });
    const labels = [];
    const data = [];
    for (let i = results.length - 1; i >= 0; i--) {
      labels.push(results[i].date);
      data.push(results[i].count);
    }
    res.json({ labels, data });
  });
});

app.get('/dashboard/bus-utilization', (req, res) => {
  const sql = `SELECT status, COUNT(*) as count FROM buses GROUP BY status;`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching chart data' });
    res.json(results);
  });
});

app.get('/dashboard/booking-status-distribution', (req, res) => {
  const sql = `SELECT status, COUNT(*) as count FROM bookings GROUP BY status;`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error fetching chart data' });
    res.json(results);
  });
});

app.put('/staff/:id/password', (req, res) => {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ error: 'All password fields are required.' });
    }

    db.query('SELECT password FROM staff WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (results.length === 0) return res.status(404).json({ error: 'Staff not found.' });
        
        const staff = results[0];
        
        bcrypt.compare(current_password, staff.password, (compareErr, isMatch) => {
            if (compareErr) return res.status(500).json({ error: 'Authentication error.' });
            if (!isMatch) return res.status(403).json({ error: 'Incorrect current password.' });

            // Hash the new password before updating
            bcrypt.hash(new_password, saltRounds, (hashErr, hash) => {
                if (hashErr) return res.status(500).json({ error: 'Failed to secure new password.' });

                db.query('UPDATE staff SET password = ? WHERE id = ?', [hash, id], (updateErr) => {
                    if (updateErr) return res.status(500).json({ error: 'Failed to update password.' });
                    res.json({ message: 'Password updated successfully!' });
                });
            });
        });
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));