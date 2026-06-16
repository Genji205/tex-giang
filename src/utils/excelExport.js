import * as XLSX from 'xlsx';

export function exportQualityReport(selectedYear, data2024, data2025) {
  const prevYear = selectedYear - 1;
  const activeYear = selectedYear;

  const data = [
    [`BÁO CÁO TỔNG KẾT CHẤT LƯỢNG XNTH NĂM ${activeYear}`],
    [],
    [`Doanh nghiệp: CÔNG TY CỔ PHẦN TEX-GIANG`, ``, ``, `Mã tài liệu: L 02`, ``, ``, `Ngày ban hành: 29/09/2017`],
    [],
    [`NĂM ${prevYear}`],
    [`XN 3`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Trung Bình']
  ];

  // Append 2024 rows
  data2024.rows.forEach(row => {
    const months = row.months.map(v => `${v.toFixed(2)}%`);
    const sum = row.months.reduce((a, b) => a + b, 0);
    const avg = (sum / 12).toFixed(1) + '%';
    data.push([row.label, ...months, avg]);
  });

  data.push([]);
  data.push([`NĂM ${activeYear}`]);
  data.push([`XN 3`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Trung Bình']);

  // Append 2025 rows
  data2025.rows.forEach(row => {
    const months = row.months.map(v => `${v.toFixed(2)}%`);
    const sum = row.months.reduce((a, b) => a + b, 0);
    const avg = (sum / 12).toFixed(2) + '%';
    data.push([row.label, ...months, avg]);
  });

  const sheet = { name: 'Chat Luong', data };
  downloadWorkbook([sheet], `Bao_Cao_Chat_Luong_${activeYear}`);
}

export function exportComparisonReport(selectedYear, data2024, data2025) {
  const prevYear = selectedYear - 1;
  const activeYear = selectedYear;

  const data = [
    [`BÁO CÁO SO SÁNH TỶ LỆ HÀNG HƯ ${prevYear} - ${activeYear}`],
    [],
    [`1. TRƯỚC ỦI (${prevYear} vs ${activeYear})`],
    [`Chỉ số`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Trung Bình']
  ];

  // Table 1 (Trước ủi) row 2024
  const t1RowPrev = data2024.rows[0];
  const t1PrevMonths = t1RowPrev.months.map(v => `${v.toFixed(2)}%`);
  const t1PrevAvg = (t1RowPrev.months.reduce((a, b) => a + b, 0) / 12).toFixed(1) + '%';
  data.push([`Trước ủi ${prevYear}`, ...t1PrevMonths, t1PrevAvg]);

  // Table 1 (Trước ủi) row 2025
  const t1RowActive = data2025.rows[0];
  const t1ActiveMonths = t1RowActive.months.map(v => `${v.toFixed(2)}%`);
  const t1ActiveAvg = (t1RowActive.months.reduce((a, b) => a + b, 0) / 12).toFixed(2) + '%';
  data.push([`Trước ủi ${activeYear}`, ...t1ActiveMonths, t1ActiveAvg]);

  data.push([]);
  data.push([`2. SAU ỦI (${prevYear} vs ${activeYear})`]);
  data.push([`Chỉ số`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Trung Bình']);

  // Table 2 (Sau ủi) row 2024
  const t2RowPrev = data2024.rows[1];
  const t2PrevMonths = t2RowPrev.months.map(v => `${v.toFixed(2)}%`);
  const t2PrevAvg = (t2RowPrev.months.reduce((a, b) => a + b, 0) / 12).toFixed(1) + '%';
  data.push([`Sau ủi ${prevYear}`, ...t2PrevMonths, t2PrevAvg]);

  // Table 2 (Sau ủi) row 2025
  const t2RowActive = data2025.rows[1];
  const t2ActiveMonths = t2RowActive.months.map(v => `${v.toFixed(2)}%`);
  const t2ActiveAvg = (t2RowActive.months.reduce((a, b) => a + b, 0) / 12).toFixed(2) + '%';
  data.push([`Sau ủi ${activeYear}`, ...t2ActiveMonths, t2ActiveAvg]);

  const sheet = { name: 'So Sanh', data };
  downloadWorkbook([sheet], `Bao_Cao_So_Sanh_${prevYear}_${activeYear}`);
}

export function exportTargetTracking(selectedYear, targetTrackingData) {
  const data = [
    [`THEO DÕI MỤC TIÊU CHẤT LƯỢNG NĂM ${selectedYear}`],
    [`MỤC TIÊU - KẾT QUẢ XNCG NĂM ${selectedYear}`],
    []
  ];

  targetTrackingData.metrics.forEach(metric => {
    data.push([metric.name.toUpperCase()]);
    data.push([`Chỉ số`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']);
    
    const formatDec = (val) => {
      if (val === 100.0 || val === 0.0) return val;
      return val.toFixed(1).replace('.0', '');
    };
    
    const targetRow = metric.target.map(v => `${formatDec(v)}%`);
    data.push([`Mục tiêu (MTiêu)`, ...targetRow]);

    const actualRow = metric.actual.map(v => `${formatDec(v)}%`);
    data.push([`Thực tế (TTế)`, ...actualRow]);
    
    data.push([]);
  });

  const sheet = { name: 'Muc Tieu', data };
  downloadWorkbook([sheet], `Theo_Doi_Muc_Tieu_${selectedYear}`);
}

export function exportFinalReport(selectedYear, finalReportData, totals) {
  const data = [
    [finalReportData.title],
    [`CÔNG TY CỔ PHẦN TEX-GIANG`, ``, ``, `Bộ phận: QLCL`],
    [finalReportData.date],
    [],
    [`Tháng`, `Số lần final`, `Số lần đạt`, `Số lần không đạt`, `% Đạt`, `% Không đạt`, `Lỗi bị tái chế`]
  ];

  finalReportData.rows.forEach(row => {
    const passedRate = row.final === 0 ? '0.00%' : ((row.passed / row.final) * 100).toFixed(2) + '%';
    const failedRate = row.final === 0 ? '0.00%' : ((row.failed / row.final) * 100).toFixed(2) + '%';
    data.push([row.month, row.final, row.passed, row.failed, passedRate, failedRate, row.defects || '']);
  });

  // Totals Row
  data.push([
    `Tổng`,
    totals.final,
    totals.passed,
    totals.failed,
    totals.passedRate + '%',
    totals.failedRate + '%',
    ''
  ]);

  const sheet = { name: 'Ket Qua Final', data };
  downloadWorkbook([sheet], `Ket_Qua_Final_${selectedYear}`);
}

function downloadWorkbook(sheets, filename) {
  const wb = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);
    
    // Auto-adjust column widths
    const maxCols = sheet.data.reduce((max, r) => Math.max(max, r.length), 0);
    const colWidths = Array(maxCols).fill({ wch: 12 });
    colWidths[0] = { wch: 25 }; // first column wider
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
