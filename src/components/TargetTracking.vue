<template>
  <div :class="['report-wrapper', viewMode]">
    <!-- Inside-Page Control Row (Hidden in standard Print Mode) -->
    <header class="page-action-header no-print">
      <div class="page-title-badge">
        <span class="pulse-dot"></span>
        <h2>Trang 3: Theo Dõi Mục Tiêu Chất Lượng {{ selectedYear }}</h2>
      </div>

      <div class="page-actions">
        <!-- View Mode Selector -->
        <div class="mode-selector">
          <button
            :class="['btn-mode', { active: viewMode === 'dashboard' }]"
            @click="setViewMode('dashboard')"
            title="Xem bảng điều khiển và biểu đồ mục tiêu trực quan"
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
      v-if="viewMode === 'dashboard'"
      class="dashboard-content animate-fade-in no-print"
    >
      <section class="metrics-dashboard-list">
        <div
          v-for="(metric, mIdx) in targetTrackingData.metrics"
          :key="metric.id"
          class="metric-card card-box"
        >
          <div class="table-title-container">
            <h4>{{ metric.name }}</h4>
            <span class="table-subtitle"
              >Nhập đúp chuột vào bất kỳ ô số liệu nào dưới đây để chỉnh
              sửa</span
            >
          </div>

          <!-- ECharts Chart Area -->
          <div class="chart-container">
            <v-chart class="chart" :option="getChartOption(metric)" autoresize />
          </div>

          <!-- Data table -->
          <div class="responsive-table-wrapper margin-top-sm">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th class="col-xn">Tháng</th>
                  <th v-for="m in 12" :key="'th-' + m">T{{ m }}</th>
                </tr>
              </thead>
              <tbody>
                <!-- Target Row -->
                <tr>
                  <td
                    class="row-label clickable-target-label"
                    @click="openSettingsModal(mIdx, 0)"
                    title="Click để mở bảng cấu hình mục tiêu"
                  >
                    Mục tiêu (MTiêu)
                  </td>
                  <td
                    v-for="(val, idx) in metric.target"
                    :key="'cell-t-' + idx"
                    class="cell-editable target-cell-clickable"
                    @click="openSettingsModal(mIdx, idx)"
                    title="Click để mở bảng cấu hình mục tiêu"
                  >
                    <span>{{ formatDecimals(val) }}%</span>
                  </td>
                </tr>
                <!-- Actual Row -->
                <tr>
                  <td class="row-label">Thực tế (TTế)</td>
                  <td
                    v-for="(val, idx) in metric.actual"
                    :key="'cell-a-' + idx"
                    :class="[
                      'cell-editable',
                      { editing: isEditing(mIdx, 'actual', idx) },
                    ]"
                    @dblclick="startEdit(mIdx, 'actual', idx, val)"
                  >
                    <span v-if="!isEditing(mIdx, 'actual', idx)"
                      >{{ formatDecimals(val) }}%</span
                    >
                    <input
                      v-else
                      :ref="'input-' + mIdx + '-actual-' + idx"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1000"
                      class="cell-input"
                      v-model.number="editState.value"
                      @blur="saveEdit"
                      @keydown.enter="saveEdit"
                      @keydown.escape="cancelEdit"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </main>

    <!-- Print / Official A4 Document View -->
    <div
      v-else-if="viewMode === 'print-preview'"
      class="a4-document-container animate-scale-in"
    >
      <div class="a4-paper-sheet paper-portrait-sheet">
        <!-- Header text on portrait print page -->
        <header class="print-paper-header">
          <div class="print-company-name">CÔNG TY CỔ PHẦN TEX-GIANG</div>
          <div class="print-report-main-title">
            {{ targetTrackingData.title }}
          </div>
          <div class="print-report-sub-title">
            {{ targetTrackingData.subtitle }}
          </div>
        </header>

        <!-- Divider line -->
        <hr class="print-header-divider" />

        <!-- 5 Compact Sections Stacked -->
        <div class="print-metrics-container">
          <div
            v-for="metric in targetTrackingData.metrics"
            :key="'p-met-' + metric.id"
            class="print-metric-section"
          >
            <!-- Title -->
            <div class="print-section-title">{{ metric.name }}</div>

            <!-- Chart Box -->
            <div class="print-svg-wrapper">
              <div class="print-axis-left">
                <span
                  v-for="gridVal in getGridValues(metric)"
                  :key="'p-yl-' + gridVal"
                >
                  {{ formatLabelVal(gridVal) }}%
                </span>
              </div>
              <div class="print-svg-plot">
                <svg viewBox="0 0 840 90" class="print-svg-draw">
                  <!-- Grid Lines -->
                  <line
                    v-for="gridVal in getGridValues(metric)"
                    :key="'pgl-' + gridVal"
                    x1="0"
                    :y1="getPrintY(gridVal, metric.maxY)"
                    x2="840"
                    :y2="getPrintY(gridVal, metric.maxY)"
                    stroke="#bbb"
                    stroke-dasharray="3,3"
                    stroke-width="0.5"
                  />
                  <!-- Line 1: Mục Tiêu -->
                  <path
                    :d="getPrintChartPath(metric, 'target')"
                    stroke="#a5a5a5"
                    stroke-width="1.2"
                    fill="none"
                  />
                  <!-- Line 2: Thực Tế -->
                  <path
                    :d="getPrintChartPath(metric, 'actual')"
                    stroke="#000"
                    stroke-width="1.8"
                    fill="none"
                  />

                  <!-- Nodes for actual values -->
                  <circle
                    v-for="(val, idx) in metric.actual"
                    :key="'pa-dot-' + idx"
                    :cx="getPrintX(idx + 1)"
                    :cy="getPrintY(val, metric.maxY)"
                    r="2.5"
                    fill="#000"
                    stroke="#000"
                  />
                  <circle
                    v-for="(val, idx) in metric.target"
                    :key="'pt-dot-' + idx"
                    :cx="getPrintX(idx + 1)"
                    :cy="getPrintY(val, metric.maxY)"
                    r="1.5"
                    fill="#a5a5a5"
                    stroke="#a5a5a5"
                  />
                </svg>
              </div>
            </div>

            <!-- X Axis Monthly Label row -->
            <div class="print-x-axis">
              <span v-for="m in 12" :key="'p-xl-' + m">tháng {{ m }}</span>
            </div>

            <!-- Table -->
            <table class="print-data-table print-compact-table">
              <tbody>
                <tr>
                  <td class="cell-label" style="width: 15.5%">Tháng</td>
                  <td v-for="m in 12" :key="'p-td-m-' + m" class="fw-bold">
                    {{ m }}
                  </td>
                </tr>
                <tr>
                  <td class="cell-label">MTiêu</td>
                  <td
                    v-for="(val, idx) in metric.target"
                    :key="'p-td-t-' + idx"
                  >
                    {{ formatDecimals(val) }}%
                  </td>
                </tr>
                <tr>
                  <td class="cell-label">TTế</td>
                  <td
                    v-for="(val, idx) in metric.actual"
                    :key="'p-td-a-' + idx"
                  >
                    {{ formatDecimals(val) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Signing Signatures Footer -->
        <footer class="print-report-footer">
          <div class="footer-sign-col text-right">
            <span
              >Ngày &nbsp;&nbsp;&nbsp;&nbsp; Tháng &nbsp;&nbsp;&nbsp;&nbsp; Năm
              {{ selectedYear }}</span
            >
            <span class="fw-bold margin-top-xs block">Người theo dõi</span>
          </div>
        </footer>
      </div>

      <!-- Back to top floating warning (Interactive in print-preview but hidden in printing) -->
      <div class="preview-mode-banner no-print">
        <p>
          💡 Đây là giao diện giả lập Trang 3 in A4 Portrait chính xác nhất. Bạn
          có thể nhấn <strong>In Báo Cáo</strong> để in trực tiếp hoặc lưu thành
          PDF.
        </p>
        <button class="btn-action" @click="setViewMode('dashboard')">
          Quay lại bảng điều khiển
        </button>
      </div>
    </div>

    <!-- Modal Popup for Quality Target Configuration -->
    <div v-if="isModalOpen" class="target-modal-overlay no-print animate-fade-in-overlay" @click.self="closeModal">
      <div class="target-modal-content animate-scale-in-content">
        <header class="modal-header">
          <h3>Cấu Hình Mục Tiêu: {{ activeModalMetric ? activeModalMetric.name : '' }}</h3>
          <button class="btn-close-modal" @click="closeModal" title="Đóng">&times;</button>
        </header>
        <div class="modal-body">
          <!-- Thiết lập nhanh -->
          <div class="modal-quick-apply">
            <label>Thiết lập nhanh cả năm:</label>
            <input type="number" step="0.1" v-model.number="tempQuickTargetValue" @keydown.enter="applyTempQuickTarget" />
            <button @click="applyTempQuickTarget">Áp dụng</button>
          </div>
          <!-- Bảng 12 tháng -->
          <div class="modal-config-table-wrapper">
            <table class="modal-config-table">
              <thead>
                <tr>
                  <th v-for="m in 12" :key="m">Tháng {{ m }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td v-for="(val, idx) in tempTargetValues" :key="idx">
                    <input
                      :ref="'cfg-input-' + idx"
                      type="number"
                      step="0.1"
                      v-model.number="tempTargetValues[idx]"
                      @keydown.enter="saveModalChanges"
                      @keydown.escape="closeModal"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <footer class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Hủy</button>
          <button class="btn-save" @click="saveModalChanges">Lưu thay đổi</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { exportTargetTracking } from "@/utils/excelExport";

export default {
  name: "TargetTracking",
  props: {
    theme: {
      type: String,
      default: "dark",
    },
    targetTrackingData: {
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
      viewMode: "dashboard",

      // Modal State
      isModalOpen: false,
      activeModalMetricIdx: null,
      tempTargetValues: [],
      tempQuickTargetValue: 5.0,

      // Inline Editing state (actual values only now)
      editState: {
        metricIdx: null,
        rowKey: null, // 'target' or 'actual'
        monthIdx: null,
        value: null,
      },

      // Tooltip State for SVG charts
      tooltip: {
        visible: false,
        label: "",
        month: 1,
        value: 0,
        style: {
          top: "0px",
          left: "0px",
        },
      },

      // Dashboard Chart SVG settings
      chartConfig: {
        width: 1000,
        height: 240,
        paddingX: 70,
        paddingY: 30,
        graphHeight: 160,
        graphWidth: 890,
      },
    };
  },
  computed: {
    activeModalMetric() {
      if (this.activeModalMetricIdx === null || !this.targetTrackingData || !this.targetTrackingData.metrics) {
        return null;
      }
      return this.targetTrackingData.metrics[this.activeModalMetricIdx];
    },
  },
  methods: {
    openSettingsModal(metricIdx, monthIdx = null) {
      this.activeModalMetricIdx = metricIdx;
      const metric = this.targetTrackingData.metrics[metricIdx];
      if (!metric) return;
      
      this.tempTargetValues = [...metric.target];
      this.tempQuickTargetValue = metric.target[monthIdx !== null ? monthIdx : 0] || 5.0;
      this.isModalOpen = true;

      this.$nextTick(() => {
        const inputId = monthIdx !== null ? monthIdx : 0;
        const refName = `cfg-input-${inputId}`;
        const inputEl = this.$refs[refName];
        if (inputEl) {
          const targetEl = Array.isArray(inputEl) ? inputEl[0] : inputEl;
          if (targetEl && targetEl.focus) {
            targetEl.focus();
            if (targetEl.select) targetEl.select();
          }
        }
      });
    },
    closeModal() {
      this.isModalOpen = false;
      this.activeModalMetricIdx = null;
      this.tempTargetValues = [];
    },
    applyTempQuickTarget() {
      let val = parseFloat(this.tempQuickTargetValue);
      if (isNaN(val)) val = 0;
      val = Math.max(0, Math.min(1000, val));
      this.tempTargetValues = Array(12).fill(val);
    },
    saveModalChanges() {
      if (this.activeModalMetricIdx === null) return;
      
      this.tempTargetValues.forEach((val, idx) => {
        let parsedValue = parseFloat(val);
        if (isNaN(parsedValue)) {
          parsedValue = 0;
        }
        parsedValue = Math.max(0, Math.min(1000, parsedValue));
        
        this.$emit("update-target-data", {
          metricIdx: this.activeModalMetricIdx,
          rowKey: "target",
          monthIdx: idx,
          value: parsedValue,
        });
      });
      
      this.closeModal();
    },
    exportExcel() {
      exportTargetTracking(this.selectedYear, this.targetTrackingData);
    },
    setViewMode(mode) {
      this.viewMode = mode;
      this.$emit("view-mode-change", mode);
    },
    triggerPrint() {
      this.viewMode = "print-preview";
      this.$emit("view-mode-change", "print-preview");
      this.$nextTick(() => {
        window.print();
      });
    },
    resetData() {
      this.$emit("reset-data");
    },

    getChartOption(metric) {
      const isDark = this.theme === 'dark';
      const textColor = isDark ? '#888' : '#666';
      const splitLineColor = isDark ? '#222' : '#ddd';
      const colorTarget = '#64748b'; // Slate (Mục tiêu)
      const colorActual = '#06b6d4'; // Cyan (Thực tế)
      
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross', crossStyle: { color: textColor } },
          backgroundColor: isDark ? '#050505' : '#fff',
          borderColor: isDark ? '#333' : '#ccc',
          textStyle: { color: isDark ? '#f5f5f5' : '#111' },
          borderWidth: 1,
          borderRadius: 0,
        },
        legend: {
          data: ['Mục tiêu', 'Thực tế'],
          textStyle: { color: textColor },
          icon: 'rect',
          bottom: 0
        },
        grid: { left: '2%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
          axisLabel: { color: textColor },
          axisLine: { lineStyle: { color: splitLineColor } },
        },
        yAxis: {
          type: 'value',
          max: metric.maxY,
          axisLabel: { color: textColor, formatter: '{value}%' },
          splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } }
        },
        series: [
          {
            name: 'Mục tiêu',
            type: 'line',
            data: metric.target,
            itemStyle: { color: colorTarget },
            lineStyle: { type: 'dashed', width: 2 },
            symbolSize: 6,
          },
          {
            name: 'Thực tế',
            type: 'line',
            data: metric.actual,
            itemStyle: { color: colorActual },
            lineStyle: { width: 3, shadowColor: colorActual, shadowBlur: 8 },
            symbolSize: 8,
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [{ offset: 0, color: 'rgba(6,182,212,0.4)' }, { offset: 1, color: 'rgba(6,182,212,0)' }]
              }
            }
          }
        ]
      };
    },
    // Formatting decimal presentation

    // Formatting decimal presentation
    formatDecimals(val) {
      if (val === undefined || val === null) return "0";
      if (val === 100.0) return "100";
      if (val === 0.0) return "0";
      // keep original format matching the table (e.g. 7.30 or 7.0)
      return val.toFixed(1).replace(".0", "");
    },
    formatLabelVal(val) {
      return val.toString().replace(".0", "");
    },

    // Formatting decimal presentation

    // SVG coordinate math for print A4 portrait view (compact scale)
    getGridValues(metric) {
      const max = metric.maxY || 25;
      const step = max / 4;
      return [max, max - step, max - step * 2, max - step * 3, 0];
    },
    getPrintX(mIdx) {
      // 840px graph area width
      return (mIdx - 1) * (840 / 11);
    },
    getPrintY(value, maxY) {
      // 90px graph area height
      const ratio = value / maxY;
      return 90 - ratio * 90;
    },
    getPrintChartPath(metric, key) {
      const values = metric[key];
      let path = "";
      values.forEach((v, idx) => {
        const x = this.getPrintX(idx + 1);
        const y = this.getPrintY(v, metric.maxY);
        if (idx === 0) {
          path += `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      });
      return path;
    },

    // Inline edit hooks
    isEditing(metricIdx, rowKey, monthIdx) {
      return (
        this.editState.metricIdx === metricIdx &&
        this.editState.rowKey === rowKey &&
        this.editState.monthIdx === monthIdx
      );
    },
    startEdit(metricIdx, rowKey, monthIdx, currentVal) {
      this.editState.metricIdx = metricIdx;
      this.editState.rowKey = rowKey;
      this.editState.monthIdx = monthIdx;
      this.editState.value = currentVal;

      this.$nextTick(() => {
        const refName = `input-${metricIdx}-${rowKey}-${monthIdx}`;
        const inputEl = this.$refs[refName];
        if (inputEl && inputEl[0]) {
          inputEl[0].focus();
          inputEl[0].select();
        }
      });
    },
    saveEdit() {
      if (this.editState.metricIdx === null) return;

      let parsedValue = parseFloat(this.editState.value);
      if (isNaN(parsedValue)) {
        parsedValue = 0;
      }
      parsedValue = Math.max(0, Math.min(1000, parsedValue));

      this.$emit("update-target-data", {
        metricIdx: this.editState.metricIdx,
        rowKey: this.editState.rowKey,
        monthIdx: this.editState.monthIdx,
        value: parsedValue,
      });

      this.cancelEdit();
    },
    cancelEdit() {
      this.editState.metricIdx = null;
      this.editState.rowKey = null;
      this.editState.monthIdx = null;
      this.editState.value = null;
    },

    hideTooltip() {
      this.tooltip.visible = false;
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

/* Dashboard metric list */
.metrics-dashboard-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.card-box {
  background-color: var(--bg-secondary);
  border-radius: 0px;
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

/* Custom Charts */
.chart-container {
  position: relative;
  width: 100%;
}

.chart {
  width: 100%;
  height: 250px;
}

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
  min-width: 1000px;
  font-size: 12.5px;
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
  font-size: 10.5px;
  letter-spacing: 0.3px;
}

.dashboard-table th.col-xn {
  text-align: left;
  padding-left: 16px;
  width: 180px;
}

.dashboard-table td.row-label {
  text-align: left;
  font-weight: 600;
  padding-left: 16px;
  background-color: rgba(0, 0, 0, 0.05);
  width: 180px;
}

.dashboard-table td.cell-editable {
  cursor: pointer;
  position: relative;
  transition: background-color 0.15s ease;
  width: 6.8%;
  font-weight: 500;
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
  font-size: 12.5px;
  outline: none;
}

/* A4 Print View Portrait Layout */
.a4-document-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background-color: #525659;
  min-height: 100vh;
}

.a4-paper-sheet.paper-portrait-sheet {
  background-color: white;
  color: black;
  width: 210mm; /* A4 Portrait Width */
  min-height: 297mm; /* A4 Portrait Height */
  padding: 10mm 12mm;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  font-family: "Times New Roman", Times, serif;
}

/* Print Header Style */
.print-paper-header {
  width: 100%;
}

.print-company-name {
  font-size: 12px;
  text-align: left;
  font-weight: normal;
  margin-bottom: 12px;
}

.print-report-main-title {
  text-align: center;
  font-size: 17px;
  font-weight: bold;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.print-report-sub-title {
  text-align: center;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.print-header-divider {
  border: 0.8px solid #000;
  margin-bottom: 12px;
  width: 100%;
}

/* Print metric section */
.print-metrics-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.print-metric-section {
  width: 100%;
}

.print-section-title {
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4px;
}

/* Mini Print Line charts */
.print-svg-wrapper {
  display: flex;
  gap: 8px;
  width: 100%;
}

.print-axis-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90px; /* aligns with bars area height */
  width: 45px;
  text-align: right;
  font-size: 9px;
  padding-right: 5px;
  border-right: 1px solid #000;
}

.print-svg-plot {
  flex-grow: 1;
  height: 90px;
}

.print-svg-draw {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.print-x-axis {
  display: flex;
  width: 100%;
  padding-left: 53px; /* Offset matching Y-axis width */
  margin-top: 2px;
  margin-bottom: 4px;
}

.print-x-axis span {
  width: calc(100% / 12);
  text-align: center;
  font-size: 8px;
}

/* W3C Tables on Print view */
.print-data-table {
  width: 100%;
  border-collapse: collapse;
}

.print-compact-table td {
  font-size: 9.5px;
  padding: 3px 2px;
  border: 0.8px solid #000;
  text-align: center;
}

.print-compact-table td.cell-label {
  text-align: left;
  padding-left: 6px;
  font-weight: bold;
}

.fw-bold {
  font-weight: bold;
}

/* Footers */
.print-report-footer {
  margin-top: auto; /* Push to bottom of A4 page */
  padding-top: 15px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.footer-sign-col {
  width: 45%;
  font-size: 11px;
}

.footer-sign-col span {
  display: block;
}

.block {
  display: block;
}
.fw-bold {
  font-weight: bold;
}
.text-right {
  text-anchor: end;
  text-align: right;
}
.margin-top-xs {
  margin-top: 8px;
}
.margin-top-sm {
  margin-top: 16px;
}

/* Button Styles */
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
  max-width: 210mm;
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

@media print {
  .no-print {
    display: none !important;
  }

  .a4-document-container {
    padding: 0 !important;
    background-color: white !important;
    min-height: auto !important;
  }

  .a4-paper-sheet.paper-portrait-sheet {
    box-shadow: none !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
  }

  @page {
    size: A4 portrait;
    margin: 8mm 10mm;
  }
}

/* Modal Popup Styles */
.target-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.target-modal-content {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 92%;
  max-width: 920px;
  box-shadow: 0 25px 50px -12px var(--shadow-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Animations */
.animate-fade-in-overlay {
  animation: fadeInOverlay 0.25s ease-out forwards;
}

.animate-scale-in-content {
  animation: scaleInContent 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleInContent {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(0, 0, 0, 0.15);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 28px;
  line-height: 1;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  transition: color 0.15s, transform 0.15s;
}

.btn-close-modal:hover {
  color: var(--text-primary);
  transform: scale(1.1);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

/* Quick apply bar */
.modal-quick-apply {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background-color: rgba(79, 70, 229, 0.05);
  border: 1.5px dashed rgba(79, 70, 229, 0.3);
  border-radius: 12px;
}

.light .modal-quick-apply {
  background-color: rgba(59, 130, 246, 0.05);
  border: 1.5px dashed rgba(59, 130, 246, 0.3);
}

.modal-quick-apply label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-quick-apply input {
  width: 100px;
  height: 38px;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  color: var(--text-primary);
  text-align: center;
  font-weight: 700;
  outline: none;
  transition: border-color 0.15s;
}

.modal-quick-apply input:focus {
  border-color: var(--accent-color);
}

.modal-quick-apply button {
  padding: 8px 20px;
  height: 38px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s, box-shadow 0.15s;
}

.modal-quick-apply button:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.modal-quick-apply button:active {
  transform: translateY(0);
}

/* Modal configuration table */
.modal-config-table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-primary);
}

.modal-config-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.modal-config-table th,
.modal-config-table td {
  padding: 14px 8px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.modal-config-table th {
  background-color: rgba(0, 0, 0, 0.1);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.modal-config-table td input {
  width: 85%;
  height: 38px;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  color: var(--text-primary);
  text-align: center;
  font-weight: 700;
  outline: none;
  transition: all 0.15s ease;
}

.modal-config-table td input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  transform: scale(1.05);
}

.light .modal-config-table td input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background-color: rgba(0, 0, 0, 0.15);
}

.modal-footer button {
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.light .btn-cancel:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.btn-save {
  background-color: var(--accent-color);
  color: white;
  border: none;
}

.btn-save:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-save:active {
  transform: translateY(0);
}

/* Clickable table elements pointer feedback */
.clickable-target-label {
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;
}
.clickable-target-label:hover {
  color: var(--accent-color) !important;
  background-color: rgba(79, 70, 229, 0.08) !important;
}

.target-cell-clickable {
  cursor: pointer;
  transition: all 0.15s ease;
}

.target-cell-clickable:hover {
  background-color: rgba(79, 70, 229, 0.12) !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
}

.light .clickable-target-label:hover {
  background-color: rgba(59, 130, 246, 0.08) !important;
  color: var(--accent-color) !important;
}

.light .target-cell-clickable:hover {
  background-color: rgba(59, 130, 246, 0.12) !important;
}
</style>
