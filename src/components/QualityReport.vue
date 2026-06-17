<template>
  <div :class="['report-wrapper', viewMode]">
    <!-- Inside-Page Control Row (Hidden in standard Print Mode) -->
    <header class="page-action-header no-print">
      <div class="page-title-badge">
        <span class="pulse-dot"></span>
        <h2>Trang 1: Báo Cáo Chất Lượng XNTH {{ selectedYear }}</h2>
      </div>

      <div class="page-actions">
        <!-- View Mode Selector -->
        <div class="mode-selector">
          <button
            :class="['btn-mode', { active: viewMode === 'dashboard' }]"
            @click="setViewMode('dashboard')"
            title="Xem giao diện báo cáo thông minh và biểu đồ trực quan"
          >
            <span class="icon">📊</span> Bảng Điều Khiển
          </button>

        </div>

        <!-- Export Excel Action -->
        <button
          class="btn-action btn-excel"
          @click="exportExcel"
          title="Xuất dữ liệu báo cáo ra file Excel"
        >
          <span class="icon">📥</span> Xuất Excel
        </button>

        <!-- Print Action -->
        <button
          class="btn-action btn-print"
          @click="triggerPrint"
          title="In báo cáo này ra giấy hoặc PDF"
        >
          <span class="icon">🖨️</span> In Báo Cáo
        </button>

        <!-- Reset Data -->
        <button
          class="btn-action btn-secondary"
          @click="resetData"
          title="Khôi phục số liệu gốc theo ảnh"
        >
          <span class="icon">🔄</span> Khôi Phục
        </button>
      </div>
    </header>

    <!-- Interactive Dashboard View -->
    <main
      class="dashboard-content animate-fade-in no-print"
    >
      <!-- Welcome & Summary Cards -->
      <section class="summary-section">
        <div class="welcome-card">
          <h2>Báo Cáo Tổng Kết Chất Lượng XNTH {{ selectedYear }}</h2>
          <p>
            Nhập hoặc điều chỉnh số liệu của các tháng để cập nhật báo cáo tự
            động. Giao diện biểu đồ và thống kê sẽ thay đổi trực quan theo thời
            gian thực.
          </p>
          <div class="welcome-badges">
            <span class="badge">Doanh nghiệp: Tex-Giang</span>
            <span class="badge badge-success">Mã tài liệu: L 02</span>
            <span class="badge badge-info">Ngày ban hành: 29/09/2017</span>
          </div>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="charts-section card-box">
        <div class="section-header">
          <h3>Biểu Đồ Xu Hướng Tỷ Lệ Hàng Hư Theo Tháng (%)</h3>
          <div class="chart-controls">
            <button
              v-for="year in [selectedYear - 1, selectedYear]"
              :key="year"
              :class="['btn-tab', { active: activeChartYear === year }]"
              @click="activeChartYear = year"
            >
              Năm {{ year }}
            </button>
          </div>
        </div>

        <div class="chart-container">
          <!-- Custom Interactive SVG Chart -->
          <svg
            class="custom-svg-chart"
            viewBox="0 0 1000 350"
            width="100%"
            height="320"
          >
            <defs>
              <linearGradient id="areaTruocGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.00" />
              </linearGradient>
              <linearGradient id="areaSauGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ff5a00" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#ff5a00" stop-opacity="0.00" />
              </linearGradient>
            </defs>
            <!-- Grid Lines -->
            <line
              v-for="grid in yGridLines"
              :key="grid.y"
              x1="60"
              :y1="grid.y"
              x2="960"
              :y2="grid.y"
              class="grid-line"
            />

            <!-- X Axis Labels (Months) -->
            <text
              v-for="m in 12"
              :key="m"
              :x="getXCoordinate(m)"
              y="330"
              class="axis-text text-center"
            >
              {{ "T" + m }}
            </text>

            <!-- Y Axis Labels -->
            <text
              v-for="grid in yGridLines"
              :key="grid.label"
              x="45"
              :y="grid.y + 4"
              class="axis-text text-right"
            >
              {{ grid.label }}%
            </text>

            <!-- Line 1: Trước Ủi -->
            <path
              :d="getChartPath(activeChartYear, 0)"
              class="chart-path path-truoc"
            />
            <!-- Line 2: Sau Ủi -->
            <path
              :d="getChartPath(activeChartYear, 1)"
              class="chart-path path-sau"
            />

            <!-- Area under lines for premium look -->
            <path
              :d="getChartAreaPath(activeChartYear, 0)"
              class="chart-area-path area-truoc"
            />
            <path
              :d="getChartAreaPath(activeChartYear, 1)"
              class="chart-area-path area-sau"
            />

            <!-- Interactive Dots & Hover areas for Truoc Ui -->
            <g>
              <circle
                v-for="(val, idx) in getYearRowData(activeChartYear, 0)"
                :key="'t-dot-' + idx"
                :cx="getXCoordinate(idx + 1)"
                :cy="getYCoordinate(val)"
                r="6"
                class="chart-dot dot-truoc"
                @mouseenter="showTooltip($event, activeChartYear, 0, idx, val)"
                @mouseleave="hideTooltip"
              />
            </g>

            <!-- Interactive Dots & Hover areas for Sau Ui -->
            <g>
              <circle
                v-for="(val, idx) in getYearRowData(activeChartYear, 1)"
                :key="'s-dot-' + idx"
                :cx="getXCoordinate(idx + 1)"
                :cy="getYCoordinate(val)"
                r="6"
                class="chart-dot dot-sau"
                @mouseenter="showTooltip($event, activeChartYear, 1, idx, val)"
                @mouseleave="hideTooltip"
              />
            </g>
          </svg>

          <!-- Legend -->
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color color-truoc"></span>
              <span class="legend-label">Trước ủi {{ activeChartYear }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-color color-sau"></span>
              <span class="legend-label">Sau ủi {{ activeChartYear }}</span>
            </div>
          </div>

          <!-- Tooltip Element -->
          <div
            v-if="tooltip.visible"
            class="chart-tooltip"
            :style="tooltip.style"
          >
            <div class="tooltip-title">
              Tháng {{ tooltip.month }} ({{ tooltip.year }})
            </div>
            <div class="tooltip-content">
              <strong>{{ tooltip.label }}:</strong>
              <span class="text-highlight">{{ tooltip.value }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Tables Grid Section -->
      <section class="tables-section">
        <!-- Table 2024 -->
        <div class="table-card card-box">
          <div class="table-title-container">
            <h4>{{ data2024.title }}</h4>
            <span class="table-subtitle"
              >Nhấp đúp chuột vào bất kỳ ô số liệu nào để chỉnh sửa nhanh</span
            >
          </div>
          <div class="responsive-table-wrapper">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th class="col-xn">{{ data2024.col1Header }}</th>
                  <th v-for="m in 12" :key="'h1-' + m">Tháng {{ m }}</th>
                  <th class="col-avg">Trung Bình</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rIdx) in data2024.rows" :key="'r24-' + rIdx">
                  <td class="row-label">{{ row.label }}</td>
                  <td
                    v-for="(val, mIdx) in row.months"
                    :key="'cell24-' + rIdx + '-' + mIdx"
                    :class="[
                      'cell-editable',
                      { editing: isEditing(2024, rIdx, mIdx) },
                    ]"
                    @dblclick="startEdit(2024, rIdx, mIdx, val)"
                  >
                    <!-- Read Mode -->
                    <span
                      v-if="!isEditing(2024, rIdx, mIdx)"
                      class="cell-value-text"
                    >
                      {{ formatPercentage(val) }}
                    </span>
                    <!-- Edit Mode -->
                    <input
                      v-else
                      :ref="'input-2024-' + rIdx + '-' + mIdx"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      class="cell-input"
                      v-model.number="editState.value"
                      @blur="saveEdit"
                      @keydown.enter="saveEdit"
                      @keydown.escape="cancelEdit"
                    />
                  </td>
                  <td class="cell-avg-val">
                    {{ calculateAverage(row, 2024) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table 2025 -->
        <div class="table-card card-box">
          <div class="table-title-container">
            <h4>{{ data2025.title }}</h4>
            <span class="table-subtitle"
              >Nhấp đúp chuột vào bất kỳ ô số liệu nào để chỉnh sửa nhanh</span
            >
          </div>
          <div class="responsive-table-wrapper">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th class="col-xn">{{ data2025.col1Header }}</th>
                  <th v-for="m in 12" :key="'h2-' + m">Tháng {{ m }}</th>
                  <th class="col-avg">Trung Bình</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rIdx) in data2025.rows" :key="'r25-' + rIdx">
                  <td class="row-label">{{ row.label }}</td>
                  <td
                    v-for="(val, mIdx) in row.months"
                    :key="'cell25-' + rIdx + '-' + mIdx"
                    :class="[
                      'cell-editable',
                      { editing: isEditing(2025, rIdx, mIdx) },
                    ]"
                    @dblclick="startEdit(2025, rIdx, mIdx, val)"
                  >
                    <!-- Read Mode -->
                    <span
                      v-if="!isEditing(2025, rIdx, mIdx)"
                      class="cell-value-text"
                    >
                      {{ formatPercentage(val) }}
                    </span>
                    <!-- Edit Mode -->
                    <input
                      v-else
                      :ref="'input-2025-' + rIdx + '-' + mIdx"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      class="cell-input"
                      v-model.number="editState.value"
                      @blur="saveEdit"
                      @keydown.enter="saveEdit"
                      @keydown.escape="cancelEdit"
                    />
                  </td>
                  <td class="cell-avg-val">
                    {{ calculateAverage(row, 2025) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Intelligent Insights Section -->
      <section class="insights-section card-box">
        <h3>💡 Nhận Xét & Phân Tích Xu Hướng Chất Lượng</h3>
        <div class="insights-content">
          <div class="insight-item">
            <div class="insight-bullet">1</div>
            <p>
              <strong>Hiệu quả cải tiến:</strong> Tỷ lệ hàng hư trung bình năm
              2025 là <strong>{{ overallAvg2025 }}%</strong>,
              {{ improvementText2025Vs2024 }}. Đây là tín hiệu
              {{ isImproving ? "tích cực" : "cần lưu ý" }} cho hoạt động kiểm
              soát lỗi của Xí nghiệp 3.
            </p>
          </div>
          <div class="insight-item">
            <div class="insight-bullet">2</div>
            <p>
              <strong>Ảnh hưởng của công đoạn Ủi:</strong> Trong năm 2025, tỷ lệ
              lỗi trung bình công đoạn <em>Sau ủi</em> ({{ avgSauUi2025 }}%) so
              với công đoạn <em>Trước ủi</em> ({{ avgTruocUi2025 }}%) có độ lệch
              là <strong>{{ ironingDiff }}%</strong>. {{ ironingImpactText }}
            </p>
          </div>
          <div class="insight-item">
            <div class="insight-bullet">3</div>
            <p>
              <strong>Điểm nóng cần chú ý:</strong> Tháng
              <strong>{{ peakMonth.month }}</strong> có tỷ lệ lỗi cao nhất đạt
              <strong>{{ peakMonth.value }}%</strong> ở công đoạn
              {{ peakMonth.label }}. Ban Giám đốc nên tập trung đánh giá quy
              trình sản xuất và nguyên vật liệu của tháng này.
            </p>
          </div>
        </div>
      </section>
    </main>

    <!-- Print / Official A4 Document View -->
    <div
      class="a4-document-container animate-scale-in print-only"
    >
      <div class="a4-paper-sheet">
        <!-- Document Header Table-like grid -->
        <table class="report-header-table">
          <tbody>
            <tr>
              <!-- Logo Cell -->
              <td rowspan="2" class="header-logo-cell">
                <div class="tgi-logo-container">
                  <svg viewBox="0 0 120 70" class="tgi-logo-svg">
                    <!-- TGI Letters inside drawing -->
                    <text
                      x="12"
                      y="44"
                      font-family="'Times New Roman', Georgia, serif"
                      font-weight="900"
                      font-size="44"
                      fill="#000"
                    >
                      T
                    </text>
                    <!-- Stylized G -->
                    <circle
                      cx="56"
                      cy="30"
                      r="16.5"
                      stroke="#000"
                      stroke-width="1.8"
                      fill="none"
                    />
                    <circle
                      cx="56"
                      cy="30"
                      r="13.5"
                      stroke="#000"
                      stroke-width="1"
                      fill="none"
                    />
                    <line
                      x1="56"
                      y1="30"
                      x2="68"
                      y2="30"
                      stroke="#000"
                      stroke-width="2"
                    />
                    <text
                      x="45"
                      y="41"
                      font-family="'Times New Roman', Georgia, serif"
                      font-weight="900"
                      font-size="34"
                      fill="#000"
                    >
                      G
                    </text>
                    <!-- I -->
                    <text
                      x="82"
                      y="44"
                      font-family="'Times New Roman', Georgia, serif"
                      font-weight="900"
                      font-size="44"
                      fill="#000"
                    >
                      I
                    </text>

                    <!-- Bottom Text Box -->
                    <rect
                      x="3"
                      y="52"
                      width="114"
                      height="15"
                      fill="none"
                      stroke="#000"
                      stroke-width="1"
                    />
                    <text
                      x="60"
                      y="63"
                      font-family="Arial, Helvetica, sans-serif"
                      font-weight="bold"
                      font-size="9.5"
                      text-anchor="middle"
                      letter-spacing="1"
                      fill="#000"
                    >
                      TEX-GIANG
                    </text>
                  </svg>
                </div>
              </td>
              <!-- Company Title -->
              <td class="header-company-cell">
                <span class="txt-company">CÔNG TY CỔ PHẦN TEX-GIANG</span>
              </td>
              <!-- Ban Hanh -->
              <td class="header-meta-cell-top">
                <span class="txt-meta">Ban hành: &nbsp;&nbsp;&nbsp;L 02</span>
              </td>
            </tr>
            <tr>
              <!-- Document Title -->
              <td class="header-title-cell">
                <span class="txt-title"
                  >BÁO CÁO TỔNG KẾT CHẤT LƯỢNG XNTH NĂM 2025</span
                >
              </td>
              <!-- Ngay -->
              <td class="header-meta-cell-bottom">
                <span class="txt-meta">Ngày: &nbsp;&nbsp;&nbsp;29/09/2017</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Table 1 Container -->
        <div class="print-table-container">
          <div class="print-table-title">{{ data2024.title }}</div>
          <table class="print-data-table">
            <thead>
              <tr>
                <th style="width: 8.5%">{{ data2024.col1Header }}</th>
                <th v-for="m in 12" :key="'p1-' + m" style="width: 6.8%">
                  Tháng {{ m }}
                </th>
                <th style="width: 10%">Trung Binh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIdx) in data2024.rows" :key="'pr24-' + rIdx">
                <td class="cell-label">{{ row.label }}</td>
                <td
                  v-for="(val, mIdx) in row.months"
                  :key="'pcell24-' + rIdx + '-' + mIdx"
                  class="cell-val"
                >
                  {{ formatPercentage(val) }}
                </td>
                <td class="cell-avg">{{ calculateAverage(row, 2024) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table 2 Container -->
        <div class="print-table-container">
          <div class="print-table-title">{{ data2025.title }}</div>
          <table class="print-data-table">
            <thead>
              <tr>
                <th style="width: 8.5%">{{ data2025.col1Header }}</th>
                <th v-for="m in 12" :key="'p2-' + m" style="width: 6.8%">
                  Tháng {{ m }}
                </th>
                <th style="width: 10%">Trung Binh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIdx) in data2025.rows" :key="'pr25-' + rIdx">
                <td class="cell-label">{{ row.label }}</td>
                <td
                  v-for="(val, mIdx) in row.months"
                  :key="'pcell25-' + rIdx + '-' + mIdx"
                  class="cell-val"
                >
                  {{ formatPercentage(val) }}
                </td>
                <td class="cell-avg">{{ calculateAverage(row, 2025) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { exportQualityReport } from "@/utils/excelExport";

export default {
  name: "QualityReport",
  props: {
    theme: {
      type: String,
      default: "dark",
    },
    data2024: {
      type: Object,
      required: true,
    },
    data2025: {
      type: Object,
      required: true,
    },
    selectedYear: {
      type: Number,
      default: 2025,
    },
  },
  data() {
    return {
      viewMode: "dashboard", // 'dashboard' or 'print-preview'
      activeChartYear: this.selectedYear,

      // Inline Editing state
      editState: {
        year: null,
        rowIdx: null,
        monthIdx: null,
        value: null,
      },

      // Tooltip State for SVG charts
      tooltip: {
        visible: false,
        year: null,
        label: "",
        month: 1,
        value: 0,
        style: {
          top: "0px",
          left: "0px",
        },
      },

      // SVG Chart Settings
      chartConfig: {
        width: 1000,
        height: 350,
        paddingX: 70,
        paddingY: 45,
        graphHeight: 250,
        graphWidth: 890,
        maxY: 30,
      },
    };
  },
  computed: {
    // Averages and analytics
    avgTruocUi2024() {
      return this.computeRawAvg(this.data2024.rows[0].months);
    },
    avgSauUi2024() {
      return this.computeRawAvg(this.data2024.rows[1].months);
    },
    avgTruocUi2025() {
      return this.computeRawAvg(this.data2025.rows[0].months);
    },
    avgSauUi2025() {
      return this.computeRawAvg(this.data2025.rows[1].months);
    },
    overallAvg2024() {
      const allMonths = [
        ...this.data2024.rows[0].months,
        ...this.data2024.rows[1].months,
      ];
      return this.computeRawAvg(allMonths).toFixed(2);
    },
    overallAvg2025() {
      const allMonths = [
        ...this.data2025.rows[0].months,
        ...this.data2025.rows[1].months,
      ];
      return this.computeRawAvg(allMonths).toFixed(2);
    },
    ironingDiff() {
      return Math.abs(this.avgSauUi2025 - this.avgTruocUi2025).toFixed(2);
    },
    isImproving() {
      return parseFloat(this.overallAvg2025) < parseFloat(this.overallAvg2024);
    },
    improvementText2025Vs2024() {
      const diff = Math.abs(
        parseFloat(this.overallAvg2025) - parseFloat(this.overallAvg2024)
      ).toFixed(2);
      if (this.isImproving) {
        return `giảm được ${diff}% so với trung bình năm 2024 (${this.overallAvg2024}%)`;
      } else {
        return `tăng ${diff}% so với trung bình năm 2024 (${this.overallAvg2024}%)`;
      }
    },
    avgTrendClass() {
      return this.isImproving ? "text-success" : "text-danger";
    },
    avgTrendIcon() {
      return this.isImproving ? "📉" : "📈";
    },
    avgTrendText() {
      return this.isImproving ? "Giảm" : "Tăng";
    },
    peakMonth() {
      let maxVal = -1;
      let maxMonth = 1;
      let maxLabel = "";

      // Check 2025 rows
      this.data2025.rows.forEach((row) => {
        row.months.forEach((val, idx) => {
          if (val > maxVal) {
            maxVal = val;
            maxMonth = idx + 1;
            maxLabel = row.label;
          }
        });
      });

      return {
        value: maxVal.toFixed(2),
        month: maxMonth,
        label: maxLabel,
      };
    },
    ironingImpactText() {
      const diffVal = parseFloat(this.ironingDiff);
      if (this.avgSauUi2025 > this.avgTruocUi2025) {
        return `Ủi làm tăng tỷ lệ hư hỏng trung bình thêm ${diffVal}%. Cần xem xét giảm lực ép bàn ủi hoặc chất lượng keo, nhiệt độ ủi để bảo vệ thớ vải.`;
      } else if (this.avgSauUi2025 < this.avgTruocUi2025) {
        return `Quy trình ủi giúp cải thiện, giảm tỷ lệ hư hỏng khoảng ${diffVal}%, phản ánh công đoạn hoàn thiện đạt hiệu quả tốt.`;
      } else {
        return `Không có sự khác biệt đáng kể giữa trước và sau ủi. Quy trình ổn định.`;
      }
    },
    // Y gridlines calculation for SVG chart
    yGridLines() {
      const lines = [];
      const steps = 6;
      for (let i = 0; i <= steps; i++) {
        const value = i * 5;
        lines.push({
          label: value,
          y: this.getYCoordinate(value),
        });
      }
      return lines;
    },
  },
  methods: {
    exportExcel() {
      exportQualityReport(this.selectedYear, this.data2024, this.data2025);
    },
    triggerPrint() {
      window.print();
    },
    resetData() {
      this.$emit("reset-data");
    },
    formatPercentage(val) {
      if (val === undefined || val === null) return "";
      return val.toFixed(2) + "%";
    },
    computeRawAvg(months) {
      const sum = months.reduce((a, b) => a + Number(b || 0), 0);
      return sum / 12;
    },
    calculateAverage(row) {
      if (row.average !== undefined && row.average !== null) {
        return row.average.toFixed(2) + "%";
      }
      const avg = this.computeRawAvg(row.months);
      return avg.toFixed(2) + "%";
    },
    isEditing(year, rowIdx, monthIdx) {
      return (
        this.editState.year === year &&
        this.editState.rowIdx === rowIdx &&
        this.editState.monthIdx === monthIdx
      );
    },
    startEdit(year, rowIdx, monthIdx, currentVal) {
      this.editState.year = year;
      this.editState.rowIdx = rowIdx;
      this.editState.monthIdx = monthIdx;
      this.editState.value = currentVal;

      this.$nextTick(() => {
        const refName = `input-${year}-${rowIdx}-${monthIdx}`;
        const inputEl = this.$refs[refName];
        if (inputEl && inputEl[0]) {
          inputEl[0].focus();
          inputEl[0].select();
        }
      });
    },
    saveEdit() {
      if (this.editState.year === null) return;

      let parsedValue = parseFloat(this.editState.value);
      if (isNaN(parsedValue)) {
        parsedValue = 0;
      }
      parsedValue = Math.max(0, Math.min(100, parsedValue));

      this.$emit("update-data", {
        year: this.editState.year,
        rowIdx: this.editState.rowIdx,
        monthIdx: this.editState.monthIdx,
        value: parsedValue,
      });

      this.cancelEdit();
    },
    cancelEdit() {
      this.editState.year = null;
      this.editState.rowIdx = null;
      this.editState.monthIdx = null;
      this.editState.value = null;
    },
    getXCoordinate(monthIndex) {
      const space = this.chartConfig.graphWidth / 11;
      return this.chartConfig.paddingX + (monthIndex - 1) * space;
    },
    getYCoordinate(value) {
      const ratio = value / this.chartConfig.maxY;
      return (
        this.chartConfig.paddingY +
        this.chartConfig.graphHeight -
        ratio * this.chartConfig.graphHeight
      );
    },
    getYearRowData(year, rowIdx) {
      const sourceTable = year === 2024 ? this.data2024 : this.data2025;
      return sourceTable.rows[rowIdx].months;
    },
    getChartPath(year, rowIdx) {
      const data = this.getYearRowData(year, rowIdx);
      let path = "";
      data.forEach((val, idx) => {
        const x = this.getXCoordinate(idx + 1);
        const y = this.getYCoordinate(val);
        if (idx === 0) {
          path += `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      });
      return path;
    },
    getChartAreaPath(year, rowIdx) {
      const data = this.getYearRowData(year, rowIdx);
      const points = [];
      data.forEach((val, idx) => {
        points.push({
          x: this.getXCoordinate(idx + 1),
          y: this.getYCoordinate(val),
        });
      });

      const startX = this.getXCoordinate(1);
      const endX = this.getXCoordinate(12);
      const baselineY =
        this.chartConfig.paddingY + this.chartConfig.graphHeight;

      let path = `M ${startX} ${baselineY}`;
      points.forEach((p) => {
        path += ` L ${p.x} ${p.y}`;
      });
      path += ` L ${endX} ${baselineY} Z`;
      return path;
    },
    showTooltip(event, year, rowIdx, idx, val) {
      const sourceTable = year === 2024 ? this.data2024 : this.data2025;
      const rowLabel = sourceTable.rows[rowIdx].label;
      const chartContainer = event.target.closest(".chart-container");

      if (!chartContainer) return;

      const rect = chartContainer.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      this.tooltip.year = year;
      this.tooltip.month = idx + 1;
      this.tooltip.label =
        rowLabel.split(" ")[0] + " " + rowLabel.split(" ")[1];
      this.tooltip.value = val.toFixed(2);
      this.tooltip.style = {
        top: `${clientY - 75}px`,
        left: `${clientX - 60}px`,
      };
      this.tooltip.visible = true;
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
  },
  watch: {
    selectedYear(newYear) {
      this.activeChartYear = newYear;
    },
  },
};
</script>

<style scoped>
/* Page Specific Actions */
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

/* Inherited/Copied Dashboard Layout Styles */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card Box */
.card-box {
  background-color: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: 0 10px 15px -3px var(--shadow-color);
}

/* Welcome Card */
.summary-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #1e1b4b, #311042);
  color: white;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.app-container.light .welcome-card {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.welcome-card h2 {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.3;
}

.welcome-card p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.5;
}

.welcome-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  background-color: rgba(255, 255, 255, 0.12);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-success {
  background-color: rgba(16, 185, 129, 0.25);
  color: #34d399;
}

.badge-info {
  background-color: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
}

/* Stats */
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px var(--shadow-color);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.icon-blue {
  background-color: rgba(59, 130, 246, 0.1);
}
.icon-red {
  background-color: rgba(239, 68, 68, 0.1);
}
.icon-purple {
  background-color: rgba(139, 92, 246, 0.1);
}

.stat-info {
  flex-grow: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  margin: 2px 0;
}

.stat-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.text-success {
  color: #10b981;
}
.text-danger {
  color: #ef4444;
}

/* Charts styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 15px;
  font-weight: 700;
}

.chart-controls {
  display: flex;
  background-color: var(--bg-primary);
  border-radius: 6px;
  padding: 2px;
  border: 1px solid var(--border-color);
}

.btn-tab {
  padding: 6px 14px;
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-tab.active {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  box-shadow: 0 1px 3px var(--shadow-color);
}

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

.text-right {
  text-anchor: end;
}
.text-center {
  text-anchor: middle;
}

.chart-path {
  fill: none;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: d 0.4s ease;
}

.path-truoc {
  stroke: #06b6d4;
}

.path-sau {
  stroke: #ff5a00;
}

.chart-area-path {
  opacity: 1;
  transition: d 0.4s ease;
}

.app-container.light .chart-area-path {
  opacity: 1;
}

.area-truoc {
  fill: url(#areaTruocGrad);
}

.area-sau {
  fill: url(#areaSauGrad);
}

.chart-dot {
  stroke-width: 3;
  cursor: pointer;
  transition: r 0.2s ease, stroke-width 0.2s ease;
}

.dot-truoc {
  fill: var(--bg-primary);
  stroke: #06b6d4;
}

.dot-sau {
  fill: var(--bg-primary);
  stroke: #ff5a00;
}

.chart-dot:hover {
  r: 8px;
  stroke-width: 4px;
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
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.color-truoc {
  background: #06b6d4;
}
.color-sau {
  background: #ff5a00;
}

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

/* Tables */
.tables-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.table-title-container {
  margin-bottom: 16px;
}

.table-title-container h4 {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.table-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  display: block;
  margin-top: 4px;
}

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
  min-width: 1000px;
  font-size: 13px;
}

.dashboard-table th,
.dashboard-table td {
  padding: 14px 10px;
  text-align: right;
  border-bottom: 1px solid var(--border-color);
}

.dashboard-table th {
  background-color: rgba(0, 0, 0, 0.15);
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-align: center;
}

.dashboard-table th.col-xn {
  text-align: left;
  padding-left: 16px;
}

.dashboard-table td.row-label {
  text-align: left;
  font-weight: 600;
  padding-left: 16px;
  background-color: rgba(0, 0, 0, 0.05);
  width: 12%;
}

.dashboard-table td.cell-editable {
  cursor: pointer;
  position: relative;
  transition: background-color 0.15s ease;
  width: 6.8%;
  font-weight: 500;
  text-align: center;
}

.dashboard-table td.cell-editable:hover {
  background-color: rgba(79, 70, 229, 0.08);
}

.dashboard-table td.cell-editable.editing {
  padding: 4px;
  background-color: var(--bg-secondary);
}

.cell-input {
  width: 100%;
  height: 34px;
  background-color: var(--input-bg);
  border: 2px solid var(--accent-color);
  border-radius: 6px;
  color: var(--text-primary);
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  outline: none;
}

.cell-value-text {
  display: block;
}

.cell-avg-val {
  font-weight: 700;
  color: var(--accent-color);
  background-color: rgba(79, 70, 229, 0.05);
  text-align: center;
  width: 10%;
}

.dashboard-table th.col-avg {
  width: 10%;
}

/* Insights */
.insights-section h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
}

.insights-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.insight-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.insight-bullet {
  background-color: var(--accent-color);
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

.insight-item p {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.insight-item strong {
  color: var(--text-primary);
}

/* A4 Paper */
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
  padding: 15mm;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  font-family: "Times New Roman", Times, serif;
}

.report-header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
}

.report-header-table td {
  border: 1px solid #000;
  vertical-align: middle;
  padding: 8px 12px;
}

.header-logo-cell {
  width: 20%;
  text-align: center;
  padding: 10px 5px !important;
}

.tgi-logo-container {
  display: inline-block;
  width: 100px;
  height: auto;
}

.tgi-logo-svg {
  width: 100%;
  display: block;
}

.header-company-cell {
  width: 60%;
  text-align: center;
  border-bottom: none !important;
  height: 35px;
}

.txt-company {
  font-size: 13.5px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.header-meta-cell-top {
  width: 20%;
  font-size: 12px;
  text-align: left;
  border-bottom: none !important;
  padding-left: 15px !important;
}

.header-title-cell {
  width: 60%;
  text-align: center;
  padding: 12px 10px !important;
}

.txt-title {
  font-size: 18.5px;
  font-weight: bold;
  letter-spacing: 0.3px;
  word-spacing: 1px;
}

.header-meta-cell-bottom {
  width: 20%;
  font-size: 12px;
  text-align: left;
  padding-left: 15px !important;
}

.txt-meta {
  font-weight: normal;
}

.print-table-container {
  margin-top: 5px;
  margin-bottom: 20px;
}

.print-table-title {
  text-align: center;
  font-size: 15.5px;
  font-weight: bold;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.print-data-table {
  width: 100%;
  border-collapse: collapse;
}

.print-data-table th,
.print-data-table td {
  border: 1px solid #000;
  font-size: 12px;
  padding: 8px 4px;
}

.print-data-table th {
  text-align: center;
  font-weight: bold;
}

.print-data-table td.cell-label {
  font-weight: normal;
  text-align: left;
  padding-left: 8px;
}

.print-data-table td.cell-val {
  text-align: right;
  padding-right: 8px;
}

.print-data-table td.cell-avg {
  text-align: right;
  padding-right: 8px;
  font-weight: bold;
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
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Standard Buttons inside component actions */
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

@media print {
  .no-print {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .summary-section {
    grid-template-columns: 1fr;
  }
  .page-action-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  .page-actions {
    justify-content: space-between;
  }
}
</style>
