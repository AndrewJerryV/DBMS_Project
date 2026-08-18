const mysql = require('mysql2');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password@123',
      database: process.env.DB_NAME || 'DBMS_Project',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });
  }
  return pool;
}

function query(sql, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = undefined;
  }
  const wrapped = callback
    ? (err, ...rest) => {
        if (err) console.error('[db] query error:', err.code, err.message, '| sql:', String(sql).slice(0, 200));
        callback(err, ...rest);
      }
    : callback;
  return getPool().query(sql, params, wrapped);
}

function closePool() {
  if (pool) {
    const p = pool;
    pool = null;
    try {
      const done = p.end();
      if (done && typeof done.catch === 'function') done.catch(() => {});
    } catch (e) { /* ignore */ }
  }
}

module.exports = { query, closePool, getPool };