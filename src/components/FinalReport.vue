<template>
  <div :class="['report-wrapper', viewMode]">
    <!-- Inside-Page Control Row (Hidden in standard Print Mode) -->
    <header class="page-action-header no-print">
      <div class="page-title-badge">
        <span class="pulse-dot"></span>
        <h2>Trang 4: Kết Quả Final {{ selectedYear }} - XN Chợ Gạo</h2>
      </div>
      
      <div class="page-actions">
        <!-- View Mode Selector -->
        <div class="mode-selector">
          <button 
            :class="['btn-mode', { active: viewMode === 'dashboard' }]" 
            @click="setViewMode('dashboard')"
            title="Xem bảng điều khiển và biểu đồ trực quan"
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
      <div class="dashboard-grid-layout">
        <!-- Card 1: Data Table (Left/Top) -->
        <div class="table-card card-box">
          <div class="table-title-container">
            <h4>Bảng Tổng Hợp Kết Quả Final XN-Chợ Gạo</h4>
            <span class="table-subtitle">Nhấp đúp chuột vào bất kỳ ô số liệu nào dưới đây để chỉnh sửa</span>
          </div>

          <div class="responsive-table-wrapper">
            <table class="dashboard-table final-table">
              <thead>
                <tr>
                  <th style="width: 8%;">Tháng</th>
                  <th style="width: 12%;">Số lần final</th>
                  <th style="width: 12%;">Số lần đạt</th>
                  <th style="width: 12%;">Số lần không đạt</th>
                  <th style="width: 12%;">% Đạt</th>
                  <th style="width: 12%;">% Không đạt</th>
                  <th>Lỗi bị tái chế</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in finalReportData.rows" :key="row.month">
                  <td class="row-label text-center">{{ row.month }}</td>
                  <!-- Final Count -->
                  <td 
                    :class="['cell-editable', { editing: isEditing(idx, 'final') }]"
                    @dblclick="startEdit(idx, 'final', row.final)"
                  >
                    <span v-if="!isEditing(idx, 'final')">{{ row.final }}</span>
                    <input 
                      v-else
                      :ref="'input-' + idx + '-final'"
                      type="number"
                      min="0"
                      class="cell-input"
                      v-model.number="editState.value"
                      @blur="saveEdit"
                      @keydown.enter="saveEdit"
                      @keydown.escape="cancelEdit"
                    />
                  </td>
                  <!-- Passed Count -->
                  <td 
                    :class="['cell-editable', { editing: isEditing(idx, 'passed') }]"
                    @dblclick="startEdit(idx, 'passed', row.passed)"
                  >
                    <span v-if="!isEditing(idx, 'passed')">{{ row.passed }}</span>
                    <input 
                      v-else
                      :ref="'input-' + idx + '-passed'"
                      type="number"
                      min="0"
                      class="cell-input"
                      v-model.number="editState.value"
                      @blur="saveEdit"
                      @keydown.enter="saveEdit"
                      @keydown.escape="cancelEdit"
                    />
                  </td>
                  <!-- Failed Count -->
                  <td 
                    :class="['cell-editable', { editing: isEditing(idx, 'failed') }]"
                    @dblclick="startEdit(idx, 'failed', row.failed)"
                  >
                    <span v-if="!isEditing(idx, 'failed')">{{ row.failed }}</span>
                    <input 
                      v-else
                      :ref="'input-' + idx + '-failed'"
                      type="number"
                      min="0"
                      class="cell-input"
                      v-model.number="editState.value"
                      @blur="saveEdit"
                      @keydown.enter="saveEdit"
                      @keydown.escape="cancelEdit"
                    />
                  </td>
                  <!-- % Passed (Auto Computed) -->
                  <td class="cell-calculated">{{ getPassedRate(row) }}%</td>
                  <!-- % Failed (Auto Computed) -->
                  <td class="cell-calculated text-danger">{{ getFailedRate(row) }}%</td>
                  <!-- Defects List -->
                  <td 
                    :class="['cell-editable text-left-align', { editing: isEditing(idx, 'defects') }]"
                    @dblclick="startEdit(idx, 'defects', row.defects)"
                  >
                    <span v-if="!isEditing(idx, 'defects')" class="cell-text-desc">{{ row.defects || '—' }}</span>
                    <input 
                      v-else
                      :ref="'input-' + idx + '-defects'"
                      type="text"
                      class="cell-input text-left-input"
                      v-model="editState.value"
                      @blur="saveEdit"
                      @keydown.enter="saveEdit"
                      @keydown.escape="cancelEdit"
                    />
                  </td>
                </tr>
                <!-- Totals Row -->
                <tr class="fw-bold bg-highlight">
                  <td class="row-label text-center">Tổng</td>
                  <td>{{ totalFinal }}</td>
                  <td>{{ totalPassed }}</td>
                  <td>{{ totalFailed }}</td>
                  <td class="cell-calculated">{{ totalPassedRate }}%</td>
                  <td class="cell-calculated text-danger">{{ totalFailedRate }}%</td>
                  <td class="text-left-align color-gray">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Card 2: Bar Chart -->
        <div class="chart-card card-box">
          <div class="table-title-container">
            <h4>Biểu Đồ Số Lần Final XN Chợ Gạo</h4>
            <span class="table-subtitle">Thể hiện trực quan số lần kiểm tra final qua 12 tháng cùng tổng số cả năm</span>
          </div>

          <div class="chart-container">
            <div class="chart-wrapper-box">
              <svg class="custom-svg-chart" viewBox="0 0 1000 280" width="100%" height="240">
                <defs>
                  <linearGradient id="finalGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#3b82f6" />
                    <stop offset="100%" stop-color="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="failedGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#ef4444" />
                    <stop offset="100%" stop-color="#f87171" />
                  </linearGradient>
                </defs>
                <!-- Y Axis solid line -->
                <line x1="70" y1="30" x2="70" y2="250" stroke="var(--text-secondary)" stroke-width="1.5" />
                
                <!-- Y Axis ticks (pointing left) -->
                <line v-for="grid in yGridLines" :key="'yt-'+grid.label" x1="64" :y1="grid.y" x2="70" :y2="grid.y" stroke="var(--text-secondary)" stroke-width="1.5" />

                <!-- Y Axis Labels -->
                <text v-for="grid in yGridLines" :key="'yl-'+grid.label" x="55" :y="grid.y + 4" class="axis-text text-right">{{ grid.label }}</text>
                
                <!-- X Axis solid line -->
                <line x1="70" y1="250" x2="970" y2="250" stroke="var(--text-secondary)" stroke-width="1.5" />

                <!-- X Axis ticks (pointing down, matching column boundaries) -->
                <line v-for="c in 14" :key="'xt-'+c" :x1="70 + (c - 1) * (900 / 13)" y1="250" :x2="70 + (c - 1) * (900 / 13)" y2="256" stroke="var(--text-secondary)" stroke-width="1.5" />

                <!-- X Axis Month Labels -->
                <text v-for="m in 13" :key="'xl-month-'+m" :x="getXColumnCenter(m)" y="272" class="axis-text text-center">{{ m <= 12 ? 'T' + m : 'Tổng' }}</text>

                <!-- Bars -->
                <g v-for="m in 13" :key="'bars-'+m">
                  <!-- Bar: Số lần final -->
                  <rect 
                    :x="getXColumnCenter(m) - barConfig.width - barConfig.gap / 2"
                    :y="getBarY(getBarVal(m, 0))"
                    :width="barConfig.width"
                    :height="getBarHeight(getBarVal(m, 0))"
                    class="bar-rect bar-final"
                    fill="url(#finalGrad)"
                    @mouseenter="showTooltip($event, 'Số lần final', m, getBarVal(m, 0))"
                    @mouseleave="hideTooltip"
                  />
                  <!-- Bar: Số lần không đạt -->
                  <rect 
                    :x="getXColumnCenter(m) + barConfig.gap / 2"
                    :y="getBarY(getBarVal(m, 1))"
                    :width="barConfig.width"
                    :height="getBarHeight(getBarVal(m, 1))"
                    class="bar-rect bar-failed"
                    fill="url(#failedGrad)"
                    @mouseenter="showTooltip($event, 'Số lần không đạt', m, getBarVal(m, 1))"
                    @mouseleave="hideTooltip"
                  />
                </g>
              </svg>

              <!-- Chart Legend -->
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-square-dash fill-final-dash"></span>
                  <span>Số lần final</span>
                </div>
                <div class="legend-item">
                  <span class="legend-square-dash fill-failed-dash"></span>
                  <span>Số lần không đạt</span>
                </div>
            </div>
          </div>

          <!-- Tooltip Element -->
          <div v-if="tooltip.visible" class="chart-tooltip" :style="tooltip.style">
            <div class="tooltip-title">{{ tooltip.month }}</div>
            <div class="tooltip-content">
              <strong>{{ tooltip.label }}:</strong> <span class="text-highlight">{{ tooltip.value }} lần</span>
            </div>
          </div>
          </div>
        </div>

        <!-- Card 3: Compact Summary Table (separated from chart) -->
        <div class="table-card card-box">
          <div class="table-title-container">
            <h4>Bảng Tóm Tắt Số Liệu Theo Tháng</h4>
            <span class="table-subtitle">Tổng hợp nhanh số lần final, số lần không đạt và tỷ lệ % qua từng tháng</span>
          </div>

          <div class="responsive-table-wrapper">
            <table class="dashboard-compact-table" style="table-layout: fixed; width: 100%; min-width: 900px;">
              <thead>
                <tr>
                  <th style="width: 7.0%; border: 1px solid var(--border-color); font-size: 11px; font-weight: bold; text-align: center; height: 28px; background: none;"></th>
                  <th v-for="m in 12" :key="'d-th-'+m" style="width: 6.923%; border: 1px solid var(--border-color); font-size: 11px; font-weight: bold; text-align: center; background: none;">T{{ m }}</th>
                  <th style="width: 6.923%; border: 1px solid var(--border-color); font-size: 11px; font-weight: bold; text-align: center; background: none;">Tổng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="cell-label" style="width: 7.0%; font-size: 12px; text-align: left; padding: 8px 10px; border: 1px solid var(--border-color);">
                    <span class="legend-square-dash fill-final-dash"></span>
                    <span style="vertical-align: middle;">Số lần final</span>
                  </td>
                  <td v-for="m in 12" :key="'d-td1-'+m" style="width: 6.923%; border: 1px solid var(--border-color); font-size: 12px; text-align: center; padding: 8px 4px;">{{ getBarVal(m, 0) }}</td>
                  <td class="fw-bold" style="width: 6.923%; border: 1px solid var(--border-color); font-size: 12px; text-align: center; padding: 8px 4px;">{{ totalFinal }}</td>
                </tr>
                <tr>
                  <td class="cell-label" style="font-size: 12px; text-align: left; padding: 8px 10px; border: 1px solid var(--border-color);">
                    <span class="legend-square-dash fill-failed-dash"></span>
                    <span style="vertical-align: middle;">Số lần không đạt</span>
                  </td>
                  <td v-for="m in 12" :key="'d-td2-'+m" style="border: 1px solid var(--border-color); font-size: 12px; text-align: center; padding: 8px 4px;">{{ getBarVal(m, 1) }}</td>
                  <td class="fw-bold" style="border: 1px solid var(--border-color); font-size: 12px; text-align: center; padding: 8px 4px;">{{ totalFailed }}</td>
                </tr>
                <tr>
                  <td class="cell-label" style="font-size: 12px; text-align: left; padding: 8px 10px; border: 1px solid var(--border-color);">
                    <span class="legend-square-dash fill-passed-rate-dash"></span>
                    <span style="vertical-align: middle;">% Đạt</span>
                  </td>
                  <td v-for="m in 12" :key="'d-td3-'+m" style="border: 1px solid var(--border-color); font-size: 12px; text-align: center; padding: 8px 4px;">{{ getPassedRateForMonth(m) }}%</td>
                  <td class="fw-bold" style="border: 1px solid var(--border-color); font-size: 12px; text-align: center; padding: 8px 4px;">{{ totalPassedRate }}%</td>
                </tr>
                <tr>
                  <td class="cell-label" style="font-size: 12px; text-align: left; padding: 8px 10px; border: 1px solid var(--border-color);">
                    <span class="legend-square-dash fill-failed-rate-dash"></span>
                    <span style="vertical-align: middle;">% Không đạt</span>
                  </td>
                  <td v-for="m in 12" :key="'d-td4-'+m" style="border: 1px solid var(--border-color); font-size: 12px; text-align: center; padding: 8px 4px;">{{ getFailedRateForMonth(m) }}%</td>
                  <td class="fw-bold" style="border: 1px solid var(--border-color); font-size: 12px; text-align: center; padding: 8px 4px;">{{ totalFailedRate }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </main>

    <!-- Print / Official A4 Document View -->
    <div v-else-if="viewMode === 'print-preview'" class="a4-document-container animate-scale-in">
      <div class="a4-paper-sheet paper-portrait-sheet">
        <!-- Header text on portrait print page -->
        <header class="print-paper-header">
          <div class="print-company-name">
            <strong>CÔNG TY CỔ PHẦN TEX-GIANG</strong><br />
            <span>Bộ phận: QLCL</span>
          </div>
          <div class="print-report-main-title">{{ finalReportData.title }}</div>
        </header>

        <hr class="print-header-divider" />

        <!-- Table 1 (Main Table) -->
        <table class="print-data-table print-final-main-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 8%;">Tháng</th>
              <th rowspan="2" style="width: 14%;">Số lần final</th>
              <th rowspan="2" style="width: 14%;">Số lần đạt</th>
              <th rowspan="2" style="width: 14%;">Số lần không đạt</th>
              <th colspan="2" style="width: 24%;">% Tỷ lệ</th>
              <th rowspan="2">Lỗi bị tái chế</th>
            </tr>
            <tr>
              <th style="width: 12%;">% Đạt</th>
              <th style="width: 12%;">% Không đạt</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in finalReportData.rows" :key="'p-row-'+row.month">
              <td class="fw-bold">{{ row.month }}</td>
              <td>{{ row.final }}</td>
              <td>{{ row.passed }}</td>
              <td>{{ row.failed }}</td>
              <td>{{ getPassedRate(row) }}%</td>
              <td>{{ getFailedRate(row) }}%</td>
              <td class="text-left-align-print">{{ row.defects }}</td>
            </tr>
            <!-- Totals row -->
            <tr class="fw-bold">
              <td>Tổng</td>
              <td>{{ totalFinal }}</td>
              <td>{{ totalPassed }}</td>
              <td>{{ totalFailed }}</td>
              <td>{{ totalPassedRate }}%</td>
              <td>{{ totalFailedRate }}%</td>
              <td class="text-left-align-print"></td>
            </tr>
          </tbody>
        </table>

        <!-- SVG Bar Chart area on A4 page -->
        <div class="print-chart-block" style="margin-top: 15px; width: 100%; display: flex; flex-direction: column;">
          <!-- Unified Chart SVG -->
          <svg viewBox="0 0 1000 165" class="paper-svg-chart" style="width: 100%; display: block; overflow: visible;">
            <!-- Y Axis Labels -->
            <text v-for="grid in paperGridLines" :key="'pl-'+grid.label" x="170" :y="grid.y + 3.5" class="paper-axis-text text-right">{{ grid.label }}</text>

            <!-- Y Axis solid line -->
            <line x1="185" y1="15" x2="185" y2="145" stroke="#000" stroke-width="1.2" />

            <!-- Y Axis ticks (pointing left) -->
            <line v-for="grid in paperGridLines" :key="'pt-'+grid.label" x1="179" :y1="grid.y" x2="185" :y2="grid.y" stroke="#000" stroke-width="1.2" />

            <!-- X Axis solid line -->
            <line x1="185" y1="145" x2="1000" y2="145" stroke="#000" stroke-width="1.2" />

            <!-- X Axis ticks (pointing down, matching column borders) -->
            <line v-for="c in 14" :key="'pxt-'+c" :x1="185 + (c - 1) * 62.6923" y1="145" :x2="185 + (c - 1) * 62.6923" y2="151" stroke="#000" stroke-width="1.2" />

            <!-- X Axis Month Labels -->
            <text 
              v-for="m in 13" 
              :key="'pxl-'+m" 
              :x="185 + (m - 1) * 62.6923 + 62.6923 / 2" 
              y="160" 
              class="paper-axis-text text-center"
            >
              {{ m <= 12 ? 'T' + m : 'Tổng' }}
            </text>

            <!-- Bars (Double series for final & failed) -->
            <g v-for="m in 13" :key="'pb-'+m">
              <!-- Bar: Số lần final -->
              <rect 
                :x="185 + (m - 1) * 62.6923 + 62.6923 / 2 - 14" 
                :y="getPaperBarY(getBarVal(m, 0))" 
                width="14" 
                :height="getPaperBarHeight(getBarVal(m, 0))" 
                fill="#404040" 
                stroke="#000" 
                stroke-width="1" 
              />
              <!-- Bar: Số lần không đạt -->
              <rect 
                :x="185 + (m - 1) * 62.6923 + 62.6923 / 2" 
                :y="getPaperBarY(getBarVal(m, 1))" 
                width="14" 
                :height="getPaperBarHeight(getBarVal(m, 1))" 
                fill="#d2d2d2" 
                stroke="#000" 
                stroke-width="1" 
              />
            </g>
          </svg>

          <!-- Table 2 (Mini Grid directly below chart) -->
          <table class="print-data-table print-compact-table" style="margin-top: -1.2px; table-layout: fixed; width: 100%;">
            <thead>
              <tr>
                <th style="width: 18.5%; border: 0.8px solid #000; font-family: 'Times New Roman', Times, serif; font-size: 9px; font-weight: bold; text-align: center; height: 18px; background: none;"></th>
                <th v-for="m in 12" :key="'p-th-'+m" style="width: 6.269%; border: 0.8px solid #000; font-family: 'Times New Roman', Times, serif; font-size: 9px; font-weight: bold; text-align: center; background: none;">T{{ m }}</th>
                <th style="width: 6.269%; border: 0.8px solid #000; font-family: 'Times New Roman', Times, serif; font-size: 9px; font-weight: bold; text-align: center; background: none;">Tổng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="cell-label" style="width: 18.5%; font-family: 'Times New Roman', Times, serif; font-size: 9px; text-align: left; padding: 4px 6px;">
                  <span class="legend-square fill-dark" style="margin-right: 4px; vertical-align: middle; margin-top: -2px;"></span>
                  <span style="vertical-align: middle;">Số lần final</span>
                </td>
                <td v-for="m in 12" :key="'p-td1-'+m" style="width: 6.269%;">{{ getBarVal(m, 0) }}</td>
                <td class="fw-bold" style="width: 6.269%;">{{ totalFinal }}</td>
              </tr>
              <tr>
                <td class="cell-label" style="font-family: 'Times New Roman', Times, serif; font-size: 9px; text-align: left; padding: 4px 6px;">
                  <span class="legend-square fill-light" style="margin-right: 4px; vertical-align: middle; margin-top: -2px;"></span>
                  <span style="vertical-align: middle;">Số lần không đạt</span>
                </td>
                <td v-for="m in 12" :key="'p-td2-'+m">{{ getBarVal(m, 1) }}</td>
                <td class="fw-bold">{{ totalFailed }}</td>
              </tr>
              <tr>
                <td class="cell-label" style="font-family: 'Times New Roman', Times, serif; font-size: 9px; text-align: left; padding: 4px 6px;">
                  <span class="legend-square fill-grey" style="margin-right: 4px; vertical-align: middle; margin-top: -2px;"></span>
                  <span style="vertical-align: middle;">% Đạt</span>
                </td>
                <td v-for="m in 12" :key="'p-td3-'+m">{{ getPassedRateForMonth(m) }}%</td>
                <td class="fw-bold">{{ totalPassedRate }}%</td>
              </tr>
              <tr>
                <td class="cell-label" style="font-family: 'Times New Roman', Times, serif; font-size: 9px; text-align: left; padding: 4px 6px;">
                  <span class="legend-square fill-black" style="margin-right: 4px; vertical-align: middle; margin-top: -2px;"></span>
                  <span style="vertical-align: middle;">% Không đạt</span>
                </td>
                <td v-for="m in 12" :key="'p-td4-'+m">{{ getFailedRateForMonth(m) }}%</td>
                <td class="fw-bold">{{ totalFailedRate }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Signing Signatures Footer -->
        <footer class="print-report-footer print-page4-footer">
          <div class="footer-sign-col">
            <span class="fw-bold">Giám đốc</span>
          </div>
          <div class="footer-sign-col text-right">
            <span>{{ finalReportData.date }}</span>
            <span class="fw-bold margin-top-xs block">Bộ phận QLCL</span>
          </div>
        </footer>
      </div>
      
      <!-- Back to top floating warning (Interactive in print-preview but hidden in printing) -->
      <div class="preview-mode-banner no-print">
        <p>💡 Đây là giao diện giả lập Trang 4 in A4 Portrait chính xác nhất. Bạn có thể nhấn <strong>In Báo Cáo</strong> để in trực tiếp hoặc lưu thành PDF.</p>
        <button class="btn-action" @click="setViewMode('dashboard')">Quay lại bảng điều khiển</button>
      </div>
    </div>
  </div>
</template>

<script>
import { exportFinalReport } from '@/utils/excelExport';

export default {
  name: 'FinalReport',
  props: {
    theme: {
      type: String,
      default: 'dark'
    },
    finalReportData: {
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
      viewMode: 'dashboard',
      
      // Inline editing variables
      editState: {
        rowIdx: null,
        key: null, // 'final', 'passed', 'failed', 'defects'
        value: null
      },

      // Tooltip variables
      tooltip: {
        visible: false,
        label: '',
        month: '',
        value: 0,
        style: {
          top: '0px',
          left: '0px'
        }
      },

      // Dashboard SVG settings
      chartConfig: {
        width: 1000,
        height: 300,
        paddingX: 70,
        paddingY: 30,
        graphHeight: 220,
        graphWidth: 890
      },

      barConfig: {
        width: 22,
        gap: 0
      }
    };
  },
  computed: {
    // Totals calculations
    totalFinal() {
      return this.finalReportData.rows.reduce((sum, row) => sum + row.final, 0);
    },
    totalPassed() {
      return this.finalReportData.rows.reduce((sum, row) => sum + row.passed, 0);
    },
    totalFailed() {
      return this.finalReportData.rows.reduce((sum, row) => sum + row.failed, 0);
    },
    totalPassedRate() {
      if (this.totalFinal === 0) return '0.00';
      return ((this.totalPassed / this.totalFinal) * 100).toFixed(2);
    },
    totalFailedRate() {
      if (this.totalFinal === 0) return '0.00';
      return ((this.totalFailed / this.totalFinal) * 100).toFixed(2);
    },
    // Y Grid lines for dashboard SVG (maxY = 250)
    yGridLines() {
      const lines = [];
      for (let i = 0; i <= 5; i++) {
        const val = i * 50; // 0, 50, 100, 150, 200, 250
        lines.push({ label: val, y: this.getBarY(val) });
      }
      return lines;
    },
    // Y Grid lines for paper view SVG (maxY = 250)
    paperGridLines() {
      const lines = [];
      for (let i = 0; i <= 5; i++) {
        const val = i * 50;
        lines.push({ label: val, y: 145 - (val * (130 / 250)) }); // 130px height baseline
      }
      return lines;
    }
  },
  methods: {
    exportExcel() {
      exportFinalReport(this.selectedYear, this.finalReportData, {
        final: this.totalFinal,
        passed: this.totalPassed,
        failed: this.totalFailed,
        passedRate: this.totalPassedRate,
        failedRate: this.totalFailedRate
      });
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

    // Row Rate calculations
    getPassedRate(row) {
      if (row.final === 0) return '0.00';
      return ((row.passed / row.final) * 100).toFixed(2);
    },
    getFailedRate(row) {
      if (row.final === 0) return '0.00';
      return ((row.failed / row.final) * 100).toFixed(2);
    },
    getPassedRateForMonth(mIdx) {
      const row = this.finalReportData.rows[mIdx - 1];
      return this.getPassedRate(row);
    },
    getFailedRateForMonth(mIdx) {
      const row = this.finalReportData.rows[mIdx - 1];
      return this.getFailedRate(row);
    },

    // Dashboard SVG math
    getXColumnCenter(mIdx) {
      const space = 900 / 13;
      return 70 + ((mIdx - 1) * space) + (space / 2);
    },
    getBarX(mIdx) {
      const center = this.getXColumnCenter(mIdx);
      return center - this.barConfig.width / 2;
    },
    getBarY(value) {
      const graphBottom = 250;
      const ratio = value / 250; // maxY = 250
      return graphBottom - (ratio * 220); // 220px height
    },
    getBarHeight(value) {
      const ratio = value / 250;
      return ratio * 220;
    },
    getBarVal(mIdx, seriesIdx) {
      if (mIdx <= 12) {
        const row = this.finalReportData.rows[mIdx - 1];
        return seriesIdx === 0 ? row.final : row.failed;
      } else {
        return seriesIdx === 0 ? this.totalFinal : this.totalFailed;
      }
    },

    // Print A4 Portrait SVG math
    getPaperBarY(value) {
      const ratio = value / 250;
      return 145 - (ratio * 130); // baseline Y is 145, plot height is 130
    },
    getPaperBarHeight(value) {
      const ratio = value / 250;
      return ratio * 130;
    },

    // Inline edit hooks
    isEditing(rowIdx, key) {
      return this.editState.rowIdx === rowIdx && this.editState.key === key;
    },
    startEdit(rowIdx, key, currentVal) {
      this.editState.rowIdx = rowIdx;
      this.editState.key = key;
      this.editState.value = currentVal;
      
      this.$nextTick(() => {
        const refName = `input-${rowIdx}-${key}`;
        const inputEl = this.$refs[refName];
        if (inputEl) {
          if (Array.isArray(inputEl)) {
            if (inputEl[0]) {
              inputEl[0].focus();
              inputEl[0].select();
            }
          } else {
            inputEl.focus();
            inputEl.select();
          }
        }
      });
    },
    saveEdit() {
      if (this.editState.rowIdx === null) return;
      
      let finalValue = this.editState.value;
      if (this.editState.key !== 'defects') {
        finalValue = parseInt(finalValue);
        if (isNaN(finalValue)) {
          finalValue = 0;
        }
        finalValue = Math.max(0, finalValue);
      }
      
      this.$emit('update-final-data', {
        monthIdx: this.editState.rowIdx,
        key: this.editState.key,
        value: finalValue
      });
      
      this.cancelEdit();
    },
    cancelEdit() {
      this.editState.rowIdx = null;
      this.editState.key = null;
      this.editState.value = null;
    },

    // Tooltip
    showTooltip(event, label, mIdx, val) {
      const chartContainer = event.target.closest('.chart-container');
      if (!chartContainer) return;
      
      const rect = chartContainer.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      this.tooltip.month = mIdx === 13 ? 'Tổng số cả năm' : 'Tháng ' + mIdx;
      this.tooltip.label = label;
      this.tooltip.value = val.toString();
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

/* Dashboard structures */
.dashboard-grid-layout {
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
  margin-bottom: 16px;
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

/* Dashboard Table formatting specific to Page 4 */
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
  padding: 12px 10px;
  text-align: right;
  border-bottom: 1px solid var(--border-color);
}

.dashboard-table th {
  background-color: rgba(0, 0, 0, 0.15);
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  font-size: 10.5px;
  text-align: center;
}

.dashboard-table td.row-label {
  text-align: left;
  font-weight: 600;
  padding-left: 16px;
  background-color: rgba(0, 0, 0, 0.05);
  width: 120px;
}

.dashboard-table td.cell-editable {
  cursor: pointer;
  position: relative;
  transition: background-color 0.15s ease;
  width: 12%;
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

.text-left-input {
  text-align: left;
  padding-left: 8px;
}

.text-left-align {
  text-align: left !important;
  padding-left: 16px !important;
}

.cell-calculated {
  font-weight: 700;
  background-color: rgba(79, 70, 229, 0.02);
  text-align: center;
}

.cell-text-desc {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.bg-highlight {
  background-color: rgba(0, 0, 0, 0.08);
}

.color-gray {
  color: var(--text-secondary);
}

/* Custom SVG Chart styles */
.chart-container {
  position: relative;
  width: 100%;
}

.chart-wrapper-box {
  background-color: var(--bg-primary);
  border-radius: 12px;
  padding: 16px 12px 20px 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0;
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

.custom-svg-chart {
  width: 100%;
  overflow: visible;
}

.dashboard-compact-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-primary);
}

.dashboard-compact-table th,
.dashboard-compact-table td {
  border: 1px solid var(--border-color);
  padding: 6px 4px;
  text-align: center;
  font-size: 11px;
  color: var(--text-primary);
}

.dashboard-compact-table th {
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
  font-weight: 600;
  height: 26px;
}

.app-container.light .dashboard-compact-table th {
  background-color: rgba(0, 0, 0, 0.03);
}

.dashboard-compact-table td.cell-label {
  text-align: left;
  padding-left: 8px;
  font-weight: 500;
  color: var(--text-secondary);
}

.dashboard-compact-table tr:hover td {
  background-color: rgba(79, 70, 229, 0.05);
}

.legend-square-dash {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
}

.fill-final-dash { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.fill-failed-dash { background: linear-gradient(135deg, #ef4444, #f87171); }
.fill-passed-rate-dash { background-color: #10b981; }
.fill-failed-rate-dash { background-color: #f59e0b; }

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

/* Bar elements */
.bar-rect {
  transition: height 0.4s ease, y 0.4s ease, opacity 0.2s;
  cursor: pointer;
  stroke-width: 0.8px;
  stroke: rgba(0, 0, 0, 0.15);
  rx: 2px;
}

.bar-rect:hover {
  opacity: 0.85;
}

.bar-final {
  fill: #4f46e5; /* Purple */
}

.bar-failed {
  fill: #f43f5e; /* Rose/Red */
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

.color-final { background-color: #4f46e5; }
.color-failed { background-color: #f43f5e; }

/* Tooltip on SVG Chart */
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

/* Margin helpers */
.margin-top-md { margin-top: 24px; }
.margin-top-sm { margin-top: 16px; }
.margin-top-xs { margin-top: 8px; }

/* A4 Print portrait view overrides */
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
  width: 210mm;
  min-height: 297mm;
  padding: 12mm 15mm;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  font-family: 'Times New Roman', Times, serif;
}

.print-paper-header {
  width: 100%;
}

.print-company-name {
  font-size: 11.5px;
  text-align: left;
  line-height: 1.4;
}

.print-report-main-title {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.3px;
  margin-top: 12px;
  margin-bottom: 6px;
}

.print-header-divider {
  border: 0.8px solid #000;
  margin-bottom: 14px;
  width: 100%;
}

/* Print Tables */
.print-data-table {
  width: 100%;
  border-collapse: collapse;
}

.print-final-main-table th,
.print-final-main-table td {
  border: 1px solid #000;
  font-size: 10px;
  padding: 5px 3px;
  text-align: center;
}

.print-final-main-table th {
  font-weight: bold;
}

.text-left-align-print {
  text-align: left !important;
  padding-left: 6px !important;
}

/* Chart block */
.print-chart-block {
  width: 100%;
}

.paper-svg-chart {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.paper-axis-text {
  font-family: 'Times New Roman', Times, serif;
  font-size: 10px;
  fill: #000;
}

/* W3C spec collapsed table under chart */
.print-compact-table th {
  background: none !important;
  color: #000 !important;
}

.print-compact-table td {
  border: 0.8px solid #000;
  font-size: 9px;
  padding: 3.5px 2px;
  text-align: center;
}

.print-compact-table td.cell-label {
  text-align: left;
  padding-left: 6px;
  font-weight: normal;
  border: 0.8px solid #000;
}

.legend-square {
  width: 8px;
  height: 8px;
  border: 0.8px solid #000;
  display: inline-block;
  flex-shrink: 0;
}

.fill-dark { background-color: #404040; }
.fill-light { background-color: #d2d2d2; }
.fill-grey { background-color: #8c8c8c; }
.fill-black { background-color: #000000; }

.fw-bold { font-weight: bold; }

/* Footers */
.print-report-footer.print-page4-footer {
  margin-top: auto;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.footer-sign-col {
  width: 45%;
  font-size: 11.5px;
}

.footer-sign-col span {
  display: block;
}

.block { display: block; }
.fw-bold { font-weight: bold; }
.text-right { text-anchor: end; text-align: right; }

/* Buttons & switches */
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
</style>
