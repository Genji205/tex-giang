const sql = require('mssql/msnodesqlv8');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_DATABASE || 'PMS_TGI_TH_XNM_1804',
  driver: 'msnodesqlv8',
  connectionTimeout: 5000,
  options: {
    trustedConnection: true, // Windows Authentication
    trustServerCertificate: true // Chấp nhận chứng chỉ tự ký ở máy local
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
    console.log('Connected to SQL Server successfully via Windows Authentication!');
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
