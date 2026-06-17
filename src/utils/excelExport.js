import * as XLSX from 'xlsx-js-style';

export function getQualitySheet(selectedYear, data2024, data2025) {
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

  const merges = [
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // Doanh nghiệp
    { s: { r: 2, c: 3 }, e: { r: 2, c: 5 } }, // Mã tài liệu
    { s: { r: 2, c: 6 }, e: { r: 2, c: 13 } }, // Ngày ban hành
    { s: { r: 4, c: 0 }, e: { r: 4, c: 13 } }  // NĂM 2024
  ];

  data2024.rows.forEach(row => {
    const months = row.months.map(v => v);
    const sum = row.months.reduce((a, b) => a + b, 0);
    const avg = sum / 12;
    data.push([row.label, ...months, avg]);
  });

  data.push([]);
  const yearActiveIdx = data.length;
  data.push([`NĂM ${activeYear}`]);
  data.push([`XN 3`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Trung Bình']);
  
  merges.push({ s: { r: yearActiveIdx, c: 0 }, e: { r: yearActiveIdx, c: 13 } });

  data2025.rows.forEach(row => {
    const months = row.months.map(v => v);
    const sum = row.months.reduce((a, b) => a + b, 0);
    const avg = sum / 12;
    data.push([row.label, ...months, avg]);
  });

  return { name: 'Chat Luong', data, merges };
}

export function exportQualityReport(selectedYear, data2024, data2025) {
  const sheet = getQualitySheet(selectedYear, data2024, data2025);
  downloadWorkbook([sheet], `Bao_Cao_Chat_Luong_${selectedYear}`);
}

export function getComparisonSheet(selectedYear, data2024, data2025) {
  const prevYear = selectedYear - 1;
  const activeYear = selectedYear;

  const data = [
    [`BÁO CÁO SO SÁNH TỶ LỆ HÀNG HƯ ${prevYear} - ${activeYear}`],
    [],
    [`TRƯỚC ỦI (${prevYear} vs ${activeYear})`],
    [`Chỉ số`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Trung Bình']
  ];

  const merges = [
    { s: { r: 2, c: 0 }, e: { r: 2, c: 13 } }
  ];

  const t1RowPrev = data2024.rows[0];
  const t1PrevMonths = t1RowPrev.months.map(v => v);
  const t1PrevAvg = t1RowPrev.months.reduce((a, b) => a + b, 0) / 12;
  data.push([`Trước ủi ${prevYear}`, ...t1PrevMonths, t1PrevAvg]);

  const t1RowActive = data2025.rows[0];
  const t1ActiveMonths = t1RowActive.months.map(v => v);
  const t1ActiveAvg = t1RowActive.months.reduce((a, b) => a + b, 0) / 12;
  data.push([`Trước ủi ${activeYear}`, ...t1ActiveMonths, t1ActiveAvg]);

  data.push([]);
  const section2Idx = data.length;
  data.push([`SAU ỦI (${prevYear} vs ${activeYear})`]);
  data.push([`Chỉ số`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Trung Bình']);

  merges.push({ s: { r: section2Idx, c: 0 }, e: { r: section2Idx, c: 13 } });

  const t2RowPrev = data2024.rows[1];
  const t2PrevMonths = t2RowPrev.months.map(v => v);
  const t2PrevAvg = t2RowPrev.months.reduce((a, b) => a + b, 0) / 12;
  data.push([`Sau ủi ${prevYear}`, ...t2PrevMonths, t2PrevAvg]);

  const t2RowActive = data2025.rows[1];
  const t2ActiveMonths = t2RowActive.months.map(v => v);
  const t2ActiveAvg = t2RowActive.months.reduce((a, b) => a + b, 0) / 12;
  data.push([`Sau ủi ${activeYear}`, ...t2ActiveMonths, t2ActiveAvg]);

  return { name: 'So Sanh', data, merges };
}

export function exportComparisonReport(selectedYear, data2024, data2025) {
  const sheet = getComparisonSheet(selectedYear, data2024, data2025);
  downloadWorkbook([sheet], `Bao_Cao_So_Sanh_${selectedYear - 1}_${selectedYear}`);
}

export function getTargetSheet(selectedYear, targetTrackingData) {
  const data = [
    [`THEO DÕI MỤC TIÊU CHẤT LƯỢNG NĂM ${selectedYear}`],
    [`MỤC TIÊU - KẾT QUẢ XNCG NĂM ${selectedYear}`],
    []
  ];

  const merges = [
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } } // Subtitle
  ];

  targetTrackingData.metrics.forEach(metric => {
    const sectionIdx = data.length;
    data.push([metric.name.toUpperCase()]);
    merges.push({ s: { r: sectionIdx, c: 0 }, e: { r: sectionIdx, c: 12 } });

    data.push([`Chỉ số`, 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']);
    
    const targetRow = metric.target.map(v => v);
    data.push([`Mục tiêu (MTiêu)`, ...targetRow]);

    const actualRow = metric.actual.map(v => v);
    data.push([`Thực tế (TTế)`, ...actualRow]);
    
    data.push([]);
  });

  return { name: 'Theo Doi Muc Tieu', data, merges };
}

export function exportTargetTracking(selectedYear, targetTrackingData) {
  const sheet = getTargetSheet(selectedYear, targetTrackingData);
  downloadWorkbook([sheet], `Theo_Doi_Muc_Tieu_${selectedYear}`);
}

export function getFinalSheet(selectedYear, finalReportData, totals) {
  const data = [
    [finalReportData.title],
    [`CÔNG TY CỔ PHẦN TEX-GIANG`, ``, ``, `Bộ phận: QLCL`],
    [finalReportData.date],
    [],
    [`Tháng`, `Số lần final`, `Số lần đạt`, `Số lần không đạt`, `% Đạt`, `% Không đạt`, `Lỗi bị tái chế`]
  ];

  const merges = [
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    { s: { r: 1, c: 3 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }
  ];

  finalReportData.rows.forEach(row => {
    const passedRate = row.final === 0 ? 0 : (row.passed / row.final) * 100;
    const failedRate = row.final === 0 ? 0 : (row.failed / row.final) * 100;
    data.push([row.month, row.final, row.passed, row.failed, passedRate, failedRate, row.defects || '']);
  });

  data.push([
    `Tổng`,
    totals.final,
    totals.passed,
    totals.failed,
    parseFloat(totals.passedRate),
    parseFloat(totals.failedRate),
    ''
  ]);

  return { name: 'Ket Qua Final', data, merges };
}

export function exportFinalReport(selectedYear, finalReportData, totals) {
  const sheet = getFinalSheet(selectedYear, finalReportData, totals);
  downloadWorkbook([sheet], `Ket_Qua_Final_${selectedYear}`);
}

export function exportAllReports(selectedYear, data2024, data2025, targetTrackingData, finalReportData, totals) {
  const sheet1 = getQualitySheet(selectedYear, data2024, data2025);
  const sheet2 = getComparisonSheet(selectedYear, data2024, data2025);
  const sheet3 = getTargetSheet(selectedYear, targetTrackingData);
  const sheet4 = getFinalSheet(selectedYear, finalReportData, totals);
  
  downloadWorkbook([sheet1, sheet2, sheet3, sheet4], `Toan_Bo_Bao_Cao_${selectedYear}`);
}

function downloadWorkbook(sheets, filename) {
  const wb = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);
    
    // Auto-adjust column widths dynamically based on content length
    const maxCols = sheet.data.reduce((max, r) => Math.max(max, r.length), 0);
    const colWidths = [];
    
    for (let c = 0; c < maxCols; c++) {
      let maxLen = 10; // Minimum width
      
      for (let r = 0; r < sheet.data.length; r++) {
        const val = sheet.data[r][c];
        if (val === undefined || val === null) continue;
        
        let valStr = String(val);
        if (typeof val === 'number') {
          valStr = val.toFixed(2); // Approximate length for formatted numbers
        }
        
        // Skip known merged or long rows that skew column widths
        if (r === 0) continue; // Main titles
        if (sheet.name === 'Chat Luong' && r === 2) continue; // Metadata
        if (sheet.name === 'Ket Qua Final' && (r === 1 || r === 2)) continue; // Metadata
        if (sheet.name === 'Theo Doi Muc Tieu' && r === 1) continue; // Subtitle
        
        // Skip section headers in C=0
        if (c === 0 && (
          valStr.includes('NĂM 20') ||
          valStr.includes('TRƯỚC ỦI') || 
          valStr.includes('SAU ỦI') ||
          (sheet.name === 'Theo Doi Muc Tieu' && valStr.startsWith('MỤC TIÊU '))
        )) {
          continue;
        }

        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      }
      
      // Add padding (4) and clamp to max width of 60
      colWidths.push({ wch: Math.min(maxLen + 4, 60) });
    }
    
    ws['!cols'] = colWidths;
    
    // Merge first row for title
    if (!ws['!merges']) ws['!merges'] = [];
    if (maxCols > 0) {
      ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } });
    }

    // Apply custom merges
    if (sheet.merges) {
      ws['!merges'].push(...sheet.merges);
    }

    // Ensure merged cells have actual cell objects so borders apply to the whole merged region
    if (ws['!merges']) {
      ws['!merges'].forEach(merge => {
        for (let R = merge.s.r; R <= merge.e.r; ++R) {
          for (let C = merge.s.c; C <= merge.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({c: C, r: R});
            if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
          }
        }
      });
    }

    // Apply styles
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({c: C, r: R});
          const cell = ws[cellRef];
          
          if (!cell) continue;

          let isHeader = false;
          let isTitle = (R === 0);
          let isBold = false;
          let alignCenter = false;
          let isMetadata = false;
          
          if (sheet.name === 'Chat Luong' && R === 2) isMetadata = true;
          if (sheet.name === 'Ket Qua Final' && (R === 1 || R === 2)) isMetadata = true;
          if (sheet.name === 'Theo Doi Muc Tieu' && R === 1) isMetadata = true;
          
          let firstCellInRow = ws[XLSX.utils.encode_cell({c: 0, r: R})];
          let rowLabel = firstCellInRow ? String(firstCellInRow.v) : '';
          let isSectionHeader = false;
          if (sheet.name === 'Chat Luong' && rowLabel.includes('NĂM 20') && R > 0) {
            isSectionHeader = true;
          } else if (sheet.name === 'So Sanh' && (rowLabel.includes('TRƯỚC ỦI') || rowLabel.includes('SAU ỦI')) && R > 0) {
            isSectionHeader = true;
          } else if (sheet.name === 'Theo Doi Muc Tieu' && rowLabel.includes('MỤC TIÊU ') && R > 2) {
            isSectionHeader = true;
          }
          
          const valStr = String(cell.v);
          
          // Identify headers
          if (
            R > 0 && 
            (valStr === 'Chỉ số' || valStr === 'Tháng' || valStr === 'XN 3' || 
             valStr === 'Trung Bình' || valStr === 'Tổng' || 
             (valStr.startsWith('T') && valStr.length <= 3) ||
             valStr.includes('Số lần') || valStr.includes('% Đạt') || valStr.includes('% Không đạt') || valStr.includes('Lỗi bị tái chế'))
          ) {
            isHeader = true;
          }
          
          // Identify bold elements
          if (
            valStr.includes('TRƯỚC ỦI') || valStr.includes('SAU ỦI') || 
            valStr === 'Tổng' || valStr.includes('NĂM 20') || 
            valStr.includes('MỤC TIÊU - KẾT QUẢ')
          ) {
            isBold = true;
          }

          if (
            isHeader || C > 0 || isTitle || 
            valStr.includes('Trước ủi') || valStr.includes('Sau ủi') ||
            valStr.includes('Mục tiêu') || valStr.includes('Thực tế')
          ) {
            alignCenter = true;
          }

          let wrapText = false;
          // Left-align the defect descriptions in Ket Qua Final and wrap text
          if (sheet.name === 'Ket Qua Final' && C === 6 && R > 4) {
            alignCenter = false;
            wrapText = true;
          }

          const borderStyle = {
            top: { style: "thin", color: { rgb: "A6A6A6" } },
            bottom: { style: "thin", color: { rgb: "A6A6A6" } },
            left: { style: "thin", color: { rgb: "A6A6A6" } },
            right: { style: "thin", color: { rgb: "A6A6A6" } }
          };

          // Base styling
          cell.s = {
            font: {
              name: "Arial",
              sz: isTitle ? 14 : 11,
              bold: isTitle || isHeader || isBold || isMetadata || isSectionHeader || C === 0
            },
            alignment: {
              vertical: "center",
              horizontal: (alignCenter || isSectionHeader) ? "center" : "left",
              wrapText: wrapText
            },
            border: (isTitle || isMetadata || (!valStr.trim() && !isMetadata && !isSectionHeader)) ? {} : borderStyle
          };

          // Override metadata and section headers
          if (isMetadata) {
            if (valStr.includes('MỤC TIÊU - KẾT QUẢ')) {
              cell.s.alignment.horizontal = "center";
            } else {
              cell.s.alignment.horizontal = "left";
            }
          }
          if (isSectionHeader) {
            cell.s.fill = { fgColor: { rgb: "E2E8F0" } }; // Slate 200 background
          }

          // Handle Number Formatting
          if (typeof cell.v === 'number') {
            if (sheet.name === 'Ket Qua Final') {
               if (C >= 4 && C <= 5) {
                 cell.z = '0.00"%"'; // Percentage formatting for columns D and E
               } else {
                 cell.z = '#,##0'; // Integer formatting for counts
               }
            } else {
               cell.z = '0.00"%"'; // Default to percentage for other sheets
            }
          }

          if (isTitle) {
            cell.s.font.color = { rgb: "0F4C81" }; // Classic Blue title
          }
          if (isHeader) {
            cell.s.fill = { fgColor: { rgb: "E2E8F0" } }; // Slate 200 background
          }
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

