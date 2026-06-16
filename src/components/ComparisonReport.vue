<template>
  <div :class="['report-wrapper', viewMode]">
    <!-- Inside-Page Control Row (Hidden in standard Print Mode) -->
    <header class="page-action-header no-print">
      <div class="page-title-badge">
        <span class="pulse-dot"></span>
        <h2>Trang 2: Biểu Đồ So Sánh {{ selectedYear - 1 }} - {{ selectedYear }}</h2>
      </div>
      
      <div class="page-actions">
        <!-- View Mode Selector -->
        <div class="mode-selector">
          <button 
            :class="['btn-mode', { active: viewMode === 'dashboard' }]" 
            @click="setViewMode('dashboard')"
            title="Xem bảng điều khiển và biểu đồ so sánh trực quan"
          >
            <span class="icon">📊</span> Bảng Điều Khiển
          </button>
          <button 
            :class="['btn-mode', { active: viewMode === 'print-preview' }]" 
            @click="setViewMode('print-preview')"
            title="Xem giao diện chuẩn khổ giấy báo cáo thực tế"
          >
            <span class="icon">📄</span> Bản In A4
          </button>
        </div>

        <!-- Export Excel Action -->
        <button class="btn-action btn-excel" @click="exportExcel" title="Xuất dữ liệu báo cáo ra file Excel">
          <span class="icon">📥</span> Xuất Excel
        </button>

        <!-- Print Action -->
        <button class="btn-action btn-print" @click="triggerPrint" title="In báo cáo này ra giấy hoặc PDF">
          <span class="icon">🖨️</span> In Báo Cáo
        </button>

        <!-- Reset Data -->
        <button class="btn-action btn-secondary" @click="resetData" title="Khôi phục số liệu gốc theo ảnh">
          <span class="icon">🔄</span> Khôi Phục
        </button>
      </div>
    </header>

    <!-- Interactive Dashboard View -->
    <main v-if="viewMode === 'dashboard'" class="dashboard-content animate-fade-in no-print">
      <section class="charts-comparison-grid">
        <!-- Chart 1: Trước Ủi -->
        <div class="chart-card card-box">
          <div class="table-title-container">
            <h4>So Sánh Tỷ Lệ Hàng Hư TRƯỚC ỦI ({{ selectedYear - 1 }} vs {{ selectedYear }})</h4>
            <span class="table-subtitle">Biểu đồ so sánh tỷ lệ trước ủi theo từng tháng và trung bình cả năm</span>
          </div>

          <div class="chart-container">
            <svg class="custom-svg-chart" viewBox="0 0 1000 320" width="100%" height="280">
              <!-- Grid Lines (0% - 16%, step 2%) -->
              <line v-for="grid in yGridLines1" :key="'g1-'+grid.y" x1="60" :y1="grid.y" x2="960" :y2="grid.y" class="grid-line" />
              <!-- Y Axis labels -->
              <text v-for="grid in yGridLines1" :key="'yl1-'+grid.label" x="45" :y="grid.y + 4" class="axis-text text-right">{{ grid.label }}%</text>
              <!-- X Axis Month labels -->
              <text v-for="m in 12" :key="'xl1-'+m" :x="getXColumnCenter(m)" y="300" class="axis-text text-center">{{ 'T' + m }}</text>
              <text :x="getXColumnCenter(13)" y="300" class="axis-text text-center fw-bold">TB</text>

              <!-- Bars rendering -->
              <g v-for="m in 13" :key="'bars1-'+m">
                <!-- Bar 2024 (Trước ủi) -->
                <rect 
                  :x="getBarX(m, 0)"
                  :y="getBarY(getVal1(m, 0), 16)"
                  :width="barConfig.width"
                  :height="getBarHeight(getVal1(m, 0), 16)"
                  class="bar-rect bar-2024"
                  @mouseenter="showTooltip($event, selectedYear - 1, 'Trước ủi', m, getVal1(m, 0))"
                  @mouseleave="hideTooltip"
                />
                <!-- Bar 2025 (Trước ủi) -->
                <rect 
                  :x="getBarX(m, 1)"
                  :y="getBarY(getVal1(m, 1), 16)"
                  :width="barConfig.width"
                  :height="getBarHeight(getVal1(m, 1), 16)"
                  class="bar-rect bar-2025"
                  @mouseenter="showTooltip($event, selectedYear, 'Trước ủi', m, getVal1(m, 1))"
                  @mouseleave="hideTooltip"
                />
              </g>
            </svg>

            <!-- Legend inside chart card -->
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color bar-color-2024"></span>
                <span class="legend-label">Trước ủi {{ selectedYear - 1 }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-color bar-color-2025"></span>
                <span class="legend-label">Trước ủi {{ selectedYear }}</span>
              </div>
            </div>
          </div>

          <div class="responsive-table-wrapper margin-top-md">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th class="col-xn">{{ data2024.col1Header }}</th>
                  <th v-for="m in 12" :key="'h1-p2-'+m">T{{ m }}</th>
                  <th>Trung Bình</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="row-label">Trước ủi {{ selectedYear - 1 }}</td>
                  <td v-for="(val, idx) in data2024.rows[0].months" :key="'c1-24-'+idx" class="text-center">
                    {{ val.toFixed(2) }}%
                  </td>
                  <td class="cell-avg-val text-center">{{ calculateRowAvg(data2024.rows[0], selectedYear - 1) }}</td>
                </tr>
                <tr>
                  <td class="row-label">Trước ủi {{ selectedYear }}</td>
                  <td v-for="(val, idx) in data2025.rows[0].months" :key="'c1-25-'+idx" class="text-center">
                    {{ val.toFixed(2) }}%
                  </td>
                  <td class="cell-avg-val text-center">{{ calculateRowAvg(data2025.rows[0], selectedYear) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Chart 2: Sau Ủi -->
        <div class="chart-card card-box">
          <div class="table-title-container">
            <h4>So Sánh Tỷ Lệ Hàng Hư SAU ỦI ({{ selectedYear - 1 }} vs {{ selectedYear }})</h4>
            <span class="table-subtitle">Biểu đồ so sánh tỷ lệ sau ủi theo từng tháng và trung bình cả năm</span>
          </div>

          <div class="chart-container">
            <svg class="custom-svg-chart" viewBox="0 0 1000 320" width="100%" height="280">
              <!-- Grid Lines (0% - 30%, step 5%) -->
              <line v-for="grid in yGridLines2" :key="'g2-'+grid.y" x1="60" :y1="grid.y" x2="960" :y2="grid.y" class="grid-line" />
              <!-- Y Axis labels -->
              <text v-for="grid in yGridLines2" :key="'yl2-'+grid.label" x="45" :y="grid.y + 4" class="axis-text text-right">{{ grid.label }}%</text>
              <!-- X Axis Month labels -->
              <text v-for="m in 12" :key="'xl2-'+m" :x="getXColumnCenter(m)" y="300" class="axis-text text-center">{{ 'T' + m }}</text>
              <text :x="getXColumnCenter(13)" y="300" class="axis-text text-center fw-bold">TB</text>

              <!-- Bars rendering -->
              <g v-for="m in 13" :key="'bars2-'+m">
                <!-- Bar 2024 (Sau ủi) -->
                <rect 
                  :x="getBarX(m, 0)"
                  :y="getBarY(getVal2(m, 0), 30)"
                  :width="barConfig.width"
                  :height="getBarHeight(getVal2(m, 0), 30)"
                  class="bar-rect bar-2024"
                  @mouseenter="showTooltip($event, selectedYear - 1, 'Sau ủi', m, getVal2(m, 0))"
                  @mouseleave="hideTooltip"
                />
                <!-- Bar 2025 (Sau ủi) -->
                <rect 
                  :x="getBarX(m, 1)"
                  :y="getBarY(getVal2(m, 1), 30)"
                  :width="barConfig.width"
                  :height="getBarHeight(getVal2(m, 1), 30)"
                  class="bar-rect bar-2025"
                  @mouseenter="showTooltip($event, selectedYear, 'Sau ủi', m, getVal2(m, 1))"
                  @mouseleave="hideTooltip"
                />
              </g>
            </svg>

            <!-- Legend inside chart card -->
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color bar-color-2024"></span>
                <span class="legend-label">Sau ủi {{ selectedYear - 1 }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-color bar-color-2025"></span>
                <span class="legend-label">Sau ủi {{ selectedYear }}</span>
              </div>
            </div>
          </div>

          <div class="responsive-table-wrapper margin-top-md">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th class="col-xn">{{ data2024.col1Header }}</th>
                  <th v-for="m in 12" :key="'h2-p2-'+m">T{{ m }}</th>
                  <th>Trung Bình</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="row-label">Sau ủi {{ selectedYear - 1 }}</td>
                  <td v-for="(val, idx) in data2024.rows[1].months" :key="'c2-24-'+idx" class="text-center">
                    {{ val.toFixed(2) }}%
                  </td>
                  <td class="cell-avg-val text-center">{{ calculateRowAvg(data2024.rows[1], selectedYear - 1) }}</td>
                </tr>
                <tr>
                  <td class="row-label">Sau ủi {{ selectedYear }}</td>
                  <td v-for="(val, idx) in data2025.rows[1].months" :key="'c2-25-'+idx" class="text-center">
                    {{ val.toFixed(2) }}%
                  </td>
                  <td class="cell-avg-val text-center">{{ calculateRowAvg(data2025.rows[1], selectedYear) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Tooltip Element -->
      <div v-if="tooltip.visible" class="chart-tooltip" :style="tooltip.style">
        <div class="tooltip-title">{{ tooltip.month }} ({{ tooltip.year }})</div>
        <div class="tooltip-content">
          <strong>{{ tooltip.label }}:</strong> <span class="text-highlight">{{ tooltip.value }}%</span>
        </div>
      </div>
    </main>

    <!-- Print / Official A4 Document View -->
    <div v-else-if="viewMode === 'print-preview'" class="a4-document-container animate-scale-in">
      <div class="a4-paper-sheet paper-comparison-sheet">
        <!-- Chart 1: Trước Ủi -->
        <div class="print-chart-block">
          <div class="print-chart-title">TỔNG KẾT TỶ LỆ HÀNG HƯ TRUNG BÌNH NĂM {{ selectedYear - 1 }} XNTH 2</div>
          
          <div class="paper-chart-flex">
            <!-- SVG Y Axis Labels (Left-aligned next to chart) -->
            <div class="paper-y-axis">
              <span v-for="grid in paperGridLines1" :key="'pl1-'+grid.label">{{ grid.label }}%</span>
            </div>
            
            <!-- SVG Bars Area -->
            <div class="paper-svg-container">
              <svg viewBox="0 0 840 180" class="paper-svg-chart">
                <!-- Grid Lines -->
                <line v-for="grid in paperGridLines1" :key="'pgl1-'+grid.y" x1="0" :y1="grid.y" x2="840" :y2="grid.y" stroke="#ccc" stroke-dasharray="3,3" stroke-width="0.8" />
                
                <!-- Bars -->
                <g v-for="m in 13" :key="'pb1-'+m">
                  <rect :x="getPaperBarX(m, 0)" :y="getPaperBarY(getVal1(m, 0), 16)" width="12" :height="getPaperBarHeight(getVal1(m, 0), 16)" fill="#d2d2d2" stroke="#000" stroke-width="0.8" />
                  <rect :x="getPaperBarX(m, 1)" :y="getPaperBarY(getVal1(m, 1), 16)" width="12" :height="getPaperBarHeight(getVal1(m, 1), 16)" fill="#545454" stroke="#000" stroke-width="0.8" />
                </g>
              </svg>
            </div>
          </div>

          <!-- Axis Labels aligned underneath columns -->
          <div class="paper-x-axis">
            <span v-for="m in 12" :key="'pax1-'+m">Tháng {{ m }}</span>
            <span class="fw-bold">Trung Bình</span>
          </div>

          <!-- Data Table 1 -->
          <table class="print-data-table margin-top-xs">
            <tbody>
              <tr>
                <td class="cell-label cell-legend-label" style="width: 15.5%;">
                  <span class="legend-square fill-light"></span> Trước ủi {{ selectedYear - 1 }}
                </td>
                <td v-for="(val, idx) in data2024.rows[0].months" :key="'pct1-24-'+idx" class="cell-val-center">
                  {{ val.toFixed(2) }}%
                </td>
                <td class="cell-avg-val-center">{{ calculateRowAvg(data2024.rows[0], selectedYear - 1) }}</td>
              </tr>
              <tr>
                <td class="cell-label cell-legend-label" style="width: 15.5%;">
                  <span class="legend-square fill-dark"></span> Trước ủi {{ selectedYear }}
                </td>
                <td v-for="(val, idx) in data2025.rows[0].months" :key="'pct1-25-'+idx" class="cell-val-center">
                  {{ val.toFixed(2) }}%
                </td>
                <td class="cell-avg-val-center">{{ calculateRowAvg(data2025.rows[0], selectedYear) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Chart 2: Sau Ủi -->
        <div class="print-chart-block margin-top-md">
          <div class="print-chart-title">TỔNG KẾT TỶ LỆ HÀNG HƯ TRUNG BÌNH NĂM {{ selectedYear }} XNTH 2</div>
          
          <div class="paper-chart-flex">
            <!-- Y Axis labels -->
            <div class="paper-y-axis">
              <span v-for="grid in paperGridLines2" :key="'pl2-'+grid.label">{{ grid.label }}%</span>
            </div>
            
            <!-- SVG Bars Area -->
            <div class="paper-svg-container">
              <svg viewBox="0 0 840 180" class="paper-svg-chart">
                <!-- Grid Lines -->
                <line v-for="grid in paperGridLines2" :key="'pgl2-'+grid.y" x1="0" :y1="grid.y" x2="840" :y2="grid.y" stroke="#ccc" stroke-dasharray="3,3" stroke-width="0.8" />
                
                <!-- Bars -->
                <g v-for="m in 13" :key="'pb2-'+m">
                  <rect :x="getPaperBarX(m, 0)" :y="getPaperBarY(getVal2(m, 0), 30)" width="12" :height="getPaperBarHeight(getVal2(m, 0), 30)" fill="#d2d2d2" stroke="#000" stroke-width="0.8" />
                  <rect :x="getPaperBarX(m, 1)" :y="getPaperBarY(getVal2(m, 1), 30)" width="12" :height="getPaperBarHeight(getVal2(m, 1), 30)" fill="#545454" stroke="#000" stroke-width="0.8" />
                </g>
              </svg>
            </div>
          </div>

          <!-- Axis Labels aligned underneath columns -->
          <div class="paper-x-axis">
            <span v-for="m in 12" :key="'pax2-'+m">Tháng {{ m }}</span>
            <span class="fw-bold">Trung Bình</span>
          </div>

          <!-- Data Table 2 -->
          <table class="print-data-table margin-top-xs">
            <tbody>
              <tr>
                <td class="cell-label cell-legend-label" style="width: 15.5%;">
                  <span class="legend-square fill-light"></span> Sau ủi {{ selectedYear - 1 }}
                </td>
                <td v-for="(val, idx) in data2024.rows[1].months" :key="'pct2-24-'+idx" class="cell-val-center">
                  {{ val.toFixed(2) }}%
                </td>
                <td class="cell-avg-val-center">{{ calculateRowAvg(data2024.rows[1], selectedYear - 1) }}</td>
              </tr>
              <tr>
                <td class="cell-label cell-legend-label" style="width: 15.5%;">
                  <span class="legend-square fill-dark"></span> Sau ủi {{ selectedYear }}
                </td>
                <td v-for="(val, idx) in data2025.rows[1].months" :key="'pct2-25-'+idx" class="cell-val-center">
                  {{ val.toFixed(2) }}%
                </td>
                <td class="cell-avg-val-center">{{ calculateRowAvg(data2025.rows[1], selectedYear) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Signing Signatures Footer -->
        <footer class="print-report-footer">
          <div class="footer-sign-col">
            <span class="fw-bold">Giám đốc XN3</span>
          </div>
          <div class="footer-sign-col text-right">
            <span>Ngày &nbsp;&nbsp;&nbsp;&nbsp; Tháng &nbsp;&nbsp;&nbsp;&nbsp; Năm {{ selectedYear }}</span>
            <span class="fw-bold margin-top-xs block">Bộ phận QLCL</span>
          </div>
        </footer>
      </div>
      
      <!-- Back to top floating warning (Interactive in print-preview but hidden in printing) -->
      <div class="preview-mode-banner no-print">
        <p>💡 Đây là giao diện giả lập Trang 2 in A4 chính xác nhất. Bạn có thể nhấn <strong>In Báo Cáo</strong> để in trực tiếp hoặc lưu thành PDF.</p>
        <button class="btn-action" @click="setViewMode('dashboard')">Quay lại bảng điều khiển</button>
      </div>
    </div>
  </div>
</template>

<script>
import { exportComparisonReport } from '@/utils/excelExport';

export default {
  name: 'ComparisonReport',
  props: {
    theme: {
      type: String,
      default: 'dark'
    },
    data2024: {
      type: Object,
      required: true
    },
    data2025: {
      type: Object,
      required: true
    },
    selectedYear: {
      type: Number,
      default: 2025
    }
  },
  data() {
    return {
      viewMode: 'dashboard', // 'dashboard' or 'print-preview'
      
      // Inline Tooltip State
      tooltip: {
        visible: false,
        year: null,
        label: '',
        month: '',
        value: 0,
        style: {
          top: '0px',
          left: '0px'
        }
      },

      // Dashboard Chart SVG settings
      chartConfig: {
        width: 1000,
        height: 320,
        paddingX: 70,
        paddingY: 35,
        graphHeight: 230,
        graphWidth: 890
      },

      // Bar Dimensions
      barConfig: {
        width: 14,
        gap: 3
      }
    };
  },
  computed: {
    // Computed gridline mappings for dashboard
    yGridLines1() {
      const lines = [];
      for (let i = 0; i <= 8; i++) {
        const val = i * 2; // 0% to 16%
        lines.push({ label: val, y: this.getBarY(val, 16) });
      }
      return lines;
    },
    yGridLines2() {
      const lines = [];
      for (let i = 0; i <= 6; i++) {
        const val = i * 5; // 0% to 30%
        lines.push({ label: val, y: this.getBarY(val, 30) });
      }
      return lines;
    },
    // Computed gridlines for paper print view (shorter height)
    paperGridLines1() {
      const lines = [];
      for (let i = 0; i <= 8; i++) {
        const val = i * 2;
        lines.push({ label: val, y: 150 - (val * (150 / 16)) });
      }
      return lines;
    },
    paperGridLines2() {
      const lines = [];
      for (let i = 0; i <= 6; i++) {
        const val = i * 5;
        lines.push({ label: val, y: 150 - (val * (150 / 30)) });
      }
      return lines;
    }
  },
  methods: {
    exportExcel() {
      exportComparisonReport(this.selectedYear, this.data2024, this.data2025);
    },
    setViewMode(mode) {
      this.viewMode = mode;
      this.$emit('view-mode-change', mode);
    },
    triggerPrint() {
      this.viewMode = 'print-preview';
      this.$emit('view-mode-change', 'print-preview');
      this.$nextTick(() => {
        window.print();
      });
    },
    resetData() {
      this.$emit('reset-data');
    },

    // Averages calculation matching years
    calculateRowAvg(row, year) {
      if (row.average !== undefined && row.average !== null) {
        const precision = year === 2024 ? 1 : 2;
        return row.average.toFixed(precision) + '%';
      }
      const sum = row.months.reduce((a, b) => a + Number(b || 0), 0);
      const avg = sum / 12;
      const precision = year === 2024 ? 1 : 2;
      return avg.toFixed(precision) + '%';
    },

    // Math mappings for Dashboard SVG bar charts
    getXColumnCenter(mIdx) {
      const space = this.chartConfig.graphWidth / 13;
      return this.chartConfig.paddingX + ((mIdx - 1) * space) + (space / 2);
    },
    getBarX(mIdx, seriesIdx) {
      const center = this.getXColumnCenter(mIdx);
      if (seriesIdx === 0) {
        return center - this.barConfig.width - 2;
      } else {
        return center + 2;
      }
    },
    getBarY(value, maxY) {
      const graphBottom = this.chartConfig.paddingY + this.chartConfig.graphHeight;
      const ratio = value / maxY;
      return graphBottom - (ratio * this.chartConfig.graphHeight);
    },
    getBarHeight(value, maxY) {
      const ratio = value / maxY;
      return ratio * this.chartConfig.graphHeight;
    },

    // Getter helper functions for values (handling 12 months + average)
    getVal1(mIdx, seriesIdx) {
      const table = seriesIdx === 0 ? this.data2024 : this.data2025;
      const row = table.rows[0];
      if (mIdx <= 12) {
        return row.months[mIdx - 1];
      } else {
        if (row.average !== undefined && row.average !== null) {
          return row.average;
        }
        const sum = row.months.reduce((a, b) => a + b, 0);
        return sum / 12;
      }
    },
    getVal2(mIdx, seriesIdx) {
      const table = seriesIdx === 0 ? this.data2024 : this.data2025;
      const row = table.rows[1];
      if (mIdx <= 12) {
        return row.months[mIdx - 1];
      } else {
        if (row.average !== undefined && row.average !== null) {
          return row.average;
        }
        const sum = row.months.reduce((a, b) => a + b, 0);
        return sum / 12;
      }
    },

    // Math mappings for paper view
    getPaperBarX(mIdx, seriesIdx) {
      // columns span 840 px
      const colWidth = 840 / 13;
      const colCenter = ((mIdx - 1) * colWidth) + (colWidth / 2);
      if (seriesIdx === 0) {
        return colCenter - 13;
      } else {
        return colCenter + 1;
      }
    },
    getPaperBarY(value, maxY) {
      const ratio = value / maxY;
      return 150 - (ratio * 150); // 150px baseline
    },
    getPaperBarHeight(value, maxY) {
      const ratio = value / maxY;
      return ratio * 150;
    },

    // Show tooltip hover action
    showTooltip(event, year, stage, mIdx, val) {
      const chartContainer = event.target.closest('.chart-container');
      if (!chartContainer) return;
      
      const rect = chartContainer.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      this.tooltip.year = year;
      this.tooltip.month = mIdx === 13 ? 'Trung Bình' : 'Tháng ' + mIdx;
      this.tooltip.label = stage + ' ' + year;
      this.tooltip.value = val.toFixed(2);
      this.tooltip.style = {
        top: `${clientY - 75}px`,
        left: `${clientX - 60}px`
      };
      this.tooltip.visible = true;
    },
    hideTooltip() {
      this.tooltip.visible = false;
    }
  }
};
</script>

<style scoped>
/* Scoped actions */
.page-action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.page-title-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title-badge h2 {
  font-size: 18px;
  font-weight: 700;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background-color: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(79, 70, 229, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Charts grid */
.charts-comparison-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-box {
  background-color: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: 0 10px 15px -3px var(--shadow-color);
}

.table-title-container {
  margin-bottom: 20px;
}

.table-title-container h4 {
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
}

.table-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  display: block;
  margin-top: 4px;
}

/* SVGs inside Dashboard view */
.chart-container {
  position: relative;
  width: 100%;
}

.custom-svg-chart {
  background-color: var(--bg-primary);
  border-radius: 12px;
  padding: 12px;
  overflow: visible;
}

.grid-line {
  stroke: var(--chart-grid);
  stroke-width: 1;
}

.axis-text {
  font-size: 11px;
  fill: var(--text-secondary);
  font-weight: 500;
}

.text-right { text-anchor: end; }
.text-center { text-anchor: middle; }

/* Custom bar aesthetics */
.bar-rect {
  transition: height 0.4s ease, y 0.4s ease, opacity 0.2s;
  cursor: pointer;
  stroke-width: 0.8px;
  stroke: rgba(0, 0, 0, 0.15);
  rx: 2px; /* rounded top edges */
}

.bar-rect:hover {
  opacity: 0.85;
}

.bar-2024 {
  fill: #3b82f6; /* Blue series */
}

.bar-2025 {
  fill: #ec4899; /* Pink series */
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.bar-color-2024 { background-color: #3b82f6; }
.bar-color-2025 { background-color: #ec4899; }

/* Tooltip */
.chart-tooltip {
  position: absolute;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  pointer-events: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  transition: top 0.1s ease, left 0.1s ease;
}

.tooltip-title {
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.tooltip-content {
  color: var(--text-secondary);
}

.text-highlight {
  color: var(--text-primary);
  font-weight: 700;
}

/* Margin helper */
.margin-top-md { margin-top: 24px; }
.margin-top-xs { margin-top: 8px; }

/* Tables styling in dashboard */
.responsive-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  font-size: 12px;
}

.dashboard-table th, 
.dashboard-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.dashboard-table th {
  background-color: rgba(0, 0, 0, 0.15);
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  font-size: 11px;
}

.dashboard-table th.col-xn {
  text-align: left;
  padding-left: 16px;
  width: 120px;
}

.dashboard-table td.row-label {
  text-align: left;
  font-weight: 600;
  padding-left: 16px;
  background-color: rgba(0, 0, 0, 0.05);
  width: 120px;
}

.cell-avg-val {
  font-weight: 700;
  color: var(--accent-color);
  background-color: rgba(79, 70, 229, 0.05);
  width: 90px;
}

/* Paper View Mode Styling */
.a4-document-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background-color: #525659;
  min-height: 100vh;
}

.a4-paper-sheet {
  background-color: white;
  color: black;
  width: 297mm;
  min-height: 210mm;
  padding: 12mm 15mm;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  font-family: 'Times New Roman', Times, serif;
}

.print-chart-block {
  width: 100%;
}

.print-chart-title {
  text-align: center;
  font-size: 13.5px;
  font-weight: bold;
  letter-spacing: 0.3px;
  margin-bottom: 14px;
}

.paper-chart-flex {
  display: flex;
  gap: 8px;
  width: 100%;
}

/* Y Axis labels aligned in single column */
.paper-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 150px; /* aligns with bars area height */
  width: 48px;
  text-align: right;
  font-size: 10.5px;
  padding-right: 6px;
  border-right: 1.5px solid #000;
}

.paper-svg-container {
  flex-grow: 1;
  height: 150px;
}

.paper-svg-chart {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.paper-x-axis {
  display: flex;
  width: 100%;
  padding-left: 56px; /* Offset matching Y-axis width */
  margin-top: 4px;
}

.paper-x-axis span {
  width: calc(100% / 13);
  text-align: center;
  font-size: 10px;
}

/* A4 Print Tables */
.print-data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

.print-data-table td {
  border: 1px solid #000;
  font-size: 11px;
  padding: 6px 3px;
  text-align: center;
}

.print-data-table td.cell-label {
  text-align: left;
  padding-left: 6px;
  font-weight: normal;
}

.print-data-table td.cell-legend-label {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #000;
}

.legend-square {
  width: 9px;
  height: 9px;
  border: 1px solid #000;
  display: inline-block;
  flex-shrink: 0;
}

.fill-light { background-color: #d2d2d2; }
.fill-dark { background-color: #545454; }

.cell-avg-val-center {
  font-weight: bold;
  width: 10%;
  background-color: transparent;
}

/* Footer layout */
.print-report-footer {
  margin-top: auto; /* Push to bottom of A4 page */
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-top: none;
}

.footer-sign-col {
  width: 45%;
  font-size: 12px;
}

.footer-sign-col span {
  display: block;
}

.block { display: block; }
.fw-bold { font-weight: bold; }
.text-right { text-anchor: end; text-align: right; }

/* Buttons & Mode switches */
.mode-selector {
  display: flex;
  background-color: var(--bg-primary);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid var(--border-color);
}

.btn-mode {
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-mode.active {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.btn-action {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
}

.btn-print {
  background-color: var(--accent-color);
  color: white;
  border: none;
}

.btn-print:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-excel {
  background-color: #107c41;
  color: white;
  border: none;
}

.btn-excel:hover {
  background-color: #0b5930;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background-color: var(--border-color);
}

.preview-mode-banner {
  margin-top: 30px;
  background-color: #1e293b;
  color: white;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  max-width: 297mm;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.preview-mode-banner p {
  font-size: 13.5px;
  color: #d1d5db;
}

.preview-mode-banner button {
  background-color: var(--accent-color);
  color: white;
  border: none;
}

.preview-mode-banner button:hover {
  background-color: var(--accent-hover);
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@media print {
  .no-print {
    display: none !important;
  }
  
  .a4-document-container {
    padding: 0 !important;
    background-color: white !important;
    min-height: auto !important;
  }

  .a4-paper-sheet {
    box-shadow: none !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
  }

  @page {
    size: A4 landscape;
    margin: 10mm 15mm;
  }
}
</style>
