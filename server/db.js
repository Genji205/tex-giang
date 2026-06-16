const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'DESKTOP-5FQN74S',
  database: process.env.DB_NAME || 'PMS_TGI_TH_XNM_1804',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: true, // Use this if you're on Windows Azure, or need SSL encryption
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server successfully!');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise
};
