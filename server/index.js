const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { poolPromise } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// A simple test endpoint to check database connection and query version
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT @@VERSION as version");
    res.json({
      status: 'success',
      message: 'Database query executed successfully!',
      data: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Database query failed!',
      error: err.message
    });
  }
});

// An endpoint to list all tables in the database
app.get('/api/tables', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    res.json({
      status: 'success',
      tables: result.recordset
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
