const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sql, poolPromise } = require('./db');

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

// Endpoint 1: Quality Report (Trang 1 & Trang 2)
app.get('/api/reports/quality', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || 2025;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Nam', sql.Int, year)
      .execute('sp_BaoCao_TiLeLoi_TruocSauUi');

    const truocMonths = new Array(12).fill(0);
    const sauMonths = new Array(12).fill(0);
    let truocAvg = 0;
    let sauAvg = 0;

    result.recordset.forEach(row => {
      const match = row.Thang.match(/Tháng\s+(\d+)/i);
      if (match) {
        const mIdx = parseInt(match[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          truocMonths[mIdx] = parseFloat((row.TileLoiTruocUi_PhanTram || '0').toString().replace('%', '')) || 0;
          sauMonths[mIdx] = parseFloat((row.TileLoiSauUi_PhanTram || '0').toString().replace('%', '')) || 0;
        }
      } else {
        truocAvg = parseFloat((row.TileLoiTruocUi_PhanTram || '0').toString().replace('%', '')) || 0;
        sauAvg = parseFloat((row.TileLoiSauUi_PhanTram || '0').toString().replace('%', '')) || 0;
      }
    });

    res.json({
      status: 'success',
      data: {
        title: `TỔNG KẾT TỶ LỆ HÀNG HƯ TRUNG BÌNH NĂM ${year} XNTH 2`,
        col1Header: 'XN 3',
        rows: [
          {
            label: `Trước ủi ${year}`,
            months: truocMonths,
            average: truocAvg
          },
          {
            label: `Sau ủi ${year}`,
            months: sauMonths,
            average: sauAvg
          }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// Endpoint 2: Target Tracking Report (Trang 3)
app.get('/api/reports/target-tracking', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || 2025;
    const beforeTarget = parseFloat(req.query.beforeTarget) || 5.0;
    const afterTarget = parseFloat(req.query.afterTarget) || 3.0;
    const finalTarget = parseFloat(req.query.finalTarget) || 3.0;

    const pool = await poolPromise;

    const [resTruoc, resSau, resFinal] = await Promise.all([
      pool.request()
        .input('Nam', sql.Int, year)
        .input('MucTieu', sql.Decimal(5, 2), beforeTarget)
        .execute('sp_BaoCao_TiLeLoi_TruocUi'),
      pool.request()
        .input('Nam', sql.Int, year)
        .input('MucTieu', sql.Decimal(5, 2), afterTarget)
        .execute('sp_BaoCao_TiLeLoi_SauUi'),
      pool.request()
        .input('Nam', sql.Int, year)
        .input('MucTieu', sql.Decimal(5, 2), finalTarget)
        .execute('sp_BaoCao_TiLeLoi_Final')
    ]);

    const parsePivot = (recordset) => {
      const target = new Array(12).fill(0);
      const actual = new Array(12).fill(0);
      recordset.forEach(row => {
        const type = row['Loại'];
        const arr = type === 'MTiêu' ? target : actual;
        for (let m = 1; m <= 12; m++) {
          if (row[m] !== undefined && row[m] !== null) {
            arr[m - 1] = parseFloat(row[m].toString().replace('%', '')) || 0;
          }
        }
      });
      return { target, actual };
    };

    const truocData = parsePivot(resTruoc.recordset);
    const sauData = parsePivot(resSau.recordset);
    const finalData = parsePivot(resFinal.recordset);

    res.json({
      status: 'success',
      data: {
        title: `THEO DÕI MỤC TIÊU CHẤT LƯỢNG ${year}`,
        subtitle: `MỤC TIÊU - KẾT QUẢ XNCG ${year}`,
        metrics: [
          {
            id: 'before-iron',
            name: 'Mục tiêu tỉ lệ SPKPH trước ủi',
            maxY: 50,
            yGridSteps: 5,
            target: truocData.target,
            actual: truocData.actual
          },
          {
            id: 'after-iron',
            name: 'Mục tiêu tỉ lệ SPKPH sau ủi',
            maxY: 20,
            yGridSteps: 4,
            target: sauData.target,
            actual: sauData.actual
          },
          {
            id: 'final-defect',
            name: 'Mục tiêu tỉ lệ SPKPH final',
            maxY: 50,
            yGridSteps: 5,
            target: finalData.target,
            actual: finalData.actual
          },
          {
            id: 'on-time-delivery',
            name: 'Mục tiêu giao hàng đúng tiến độ',
            maxY: 200,
            yGridSteps: 4,
            target: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
            actual: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0]
          },
          {
            id: 'customer-complaints',
            name: 'Mục tiêu khiếu nại của khách hàng',
            maxY: 4,
            yGridSteps: 2,
            target: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
            actual: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
          }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// Endpoint 3: Final Inspection Stats Report (Trang 4)
app.get('/api/reports/final-qa', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || 2025;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Nam', sql.Int, year)
      .execute('sp_BaoCao_ThongKe_KiemQA');

    const rows = Array.from({ length: 12 }, (_, i) => ({
      month: `T${i + 1}`,
      final: 0,
      passed: 0,
      failed: 0,
      defects: ''
    }));

    result.recordset.forEach(row => {
      const match = row['Tháng'].match(/T(\d+)/i);
      if (match) {
        const mIdx = parseInt(match[1], 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          rows[mIdx].final = row['Số lần final'] || 0;
          rows[mIdx].passed = row['Số lần đạt'] || 0;
          rows[mIdx].failed = row['Số lần không đạt'] || 0;
          rows[mIdx].defects = row['Lỗi bị tái chế'] || '';
        }
      }
    });

    res.json({
      status: 'success',
      data: {
        title: `BÁO CÁO KẾT QUẢ FINAL NĂM ${year} XN-CHỢ GẠO`,
        company: 'CÔNG TY CỔ PHẦN TEX-GIANG',
        department: 'Bộ phận: QLCL',
        date: `Ngày 27 tháng 12 Năm ${year}`,
        rows: rows
      }
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

