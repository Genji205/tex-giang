<template>
  <div
    :class="[
      'app-container',
      theme,
      { 'sidebar-collapsed': sidebarCollapsed, 'is-print-mode': isPrintMode },
    ]"
  >
    <!-- Sidebar Navigation Drawer (Hidden in standard Print mode) -->
    <aside 
      class="app-sidebar no-print"
      @mouseenter="expandSidebar"
      @mouseleave="collapseSidebar"
    >
      <!-- Sidebar Brand Header -->
      <div class="sidebar-brand">
        <div class="brand-logo-wrapper">
          <svg viewBox="0 0 120 70" class="brand-logo-svg">
            <text
              x="12"
              y="44"
              font-family="'Times New Roman', Georgia, serif"
              font-weight="900"
              font-size="44"
              fill="currentColor"
            >
              T
            </text>
            <circle
              cx="56"
              cy="30"
              r="16.5"
              stroke="currentColor"
              stroke-width="1.8"
              fill="none"
            />
            <circle
              cx="56"
              cy="30"
              r="13.5"
              stroke="currentColor"
              stroke-width="1"
              fill="none"
            />
            <line
              x1="56"
              y1="30"
              x2="68"
              y2="30"
              stroke="currentColor"
              stroke-width="2"
            />
            <text
              x="45"
              y="41"
              font-family="'Times New Roman', Georgia, serif"
              font-weight="900"
              font-size="34"
              fill="currentColor"
            >
              G
            </text>
            <text
              x="82"
              y="44"
              font-family="'Times New Roman', Georgia, serif"
              font-weight="900"
              font-size="44"
              fill="currentColor"
            >
              I
            </text>

            <rect
              x="3"
              y="52"
              width="114"
              height="15"
              fill="none"
              stroke="currentColor"
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
              fill="currentColor"
            >
              TEX-GIANG
            </text>
          </svg>
        </div>
        <span class="brand-name">Tex-Giang QA</span>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">

        <ul class="nav-list">
          <li
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-item', { active: activeTab === tab.id }]"
            @click="selectTab(tab.id)"
            :title="tab.name"
          >
            <span class="nav-icon">{{ tab.icon }}</span>
            <span class="nav-text">{{ tab.name }}</span>
            <span v-if="tab.badge" class="nav-badge">{{ tab.badge }}</span>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer / Controls -->
      <div class="sidebar-footer">
        <!-- Theme Toggle -->
        <button
          class="footer-control-btn"
          @click="toggleTheme"
          title="Chuyển đổi Sáng / Tối"
        >
          <span class="control-icon">{{ theme === "dark" ? "☀️" : "🌙" }}</span>
          <span class="control-text">{{
            theme === "dark" ? "Chế độ Sáng" : "Chế độ Tối"
          }}</span>
        </button>



        <!-- Active User Profile Slot -->
        <div class="user-profile">
          <div class="user-avatar">QA</div>
          <div class="user-info">
            <span class="user-name">Phòng QA</span>
            <span class="user-role">Quản lý</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Component Render Area -->
    <main class="app-main">
      <header class="page-action-header no-print">
        <div class="page-title-badge">
          <span class="pulse-dot"></span>
          <h2>{{ pageTitle }}</h2>
        </div>
        
        <div class="page-actions">
          <!-- DB Status Indicator (Subtle) -->
          <div class="db-status-indicator subtle-status" :class="dbStatus" title="Trạng thái kết nối dữ liệu">
            <span class="status-dot"></span>
            <span class="status-text">
              {{
                dbStatus === "connected"
                  ? "Live DB"
                  : dbStatus === "loading"
                  ? "Đang kết nối..."
                  : "Offline"
              }}
            </span>
          </div>

          <!-- Year Selector -->
          <div class="header-year-selector" style="display: flex; align-items: center; margin-right: 15px;">
            <span style="margin-right: 8px; font-weight: 500; white-space: nowrap;">Năm báo cáo:</span>
            <div class="select-wrapper" style="position: relative; display: inline-block;">
              <select v-model.number="selectedYear" class="year-select" style="padding: 6px 30px 6px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); appearance: none; font-size: 14px; font-weight: 500; cursor: pointer; outline: none;">
                <option v-for="year in availableYears" :key="year" :value="year">
                  Năm {{ year }}
                </option>
              </select>
              <span class="select-arrow" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 10px; color: var(--text-secondary);">▼</span>
            </div>
          </div>

          <!-- Export All Action -->
          <button class="btn-action btn-excel-all" @click="triggerExportAll" title="Xuất toàn bộ 4 trang báo cáo ra 1 file Excel">
            <span class="icon">📚</span> Xuất Tất Cả
          </button>

          <!-- Export Excel Action -->
          <button class="btn-action btn-excel" @click="triggerExport" title="Xuất dữ liệu báo cáo ra file Excel">
            <span class="icon">📥</span> Xuất Excel
          </button>

          <!-- Print Action -->
          <button class="btn-action btn-print" @click="triggerPrint" title="In báo cáo này ra giấy hoặc PDF">
            <span class="icon">🖨️</span> In Báo Cáo
          </button>
        </div>
      </header>

      <component
        ref="activeChild"
        :is="activeComponent"
        v-bind="componentProps"
        @update-data="onUpdateData"
        @update-target-data="onUpdateTargetData"
        @update-final-data="onUpdateFinalData"
        @reset-data="onResetData"
        @view-mode-change="onViewModeChange"
        @update-year="onUpdateYear"
      />
    </main>
  </div>
</template>

<script>
import QualityReport from "./components/QualityReport.vue";
import ComparisonReport from "./components/ComparisonReport.vue";
import TargetTracking from "./components/TargetTracking.vue";
import FinalReport from "./components/FinalReport.vue";
import PagePlaceholder from "./components/PagePlaceholder.vue";
import axios from "axios";
import { exportAllReports } from "@/utils/excelExport";

export default {
  name: "App",
  components: {
    QualityReport,
    ComparisonReport,
    TargetTracking,
    FinalReport,
    PagePlaceholder,
  },
  data() {
    return {
      theme: "light",
      sidebarCollapsed: true,
      activeTab: 1,
      isPrintMode: false,
      selectedYear: 2025,
      availableYears: [
        2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030,
      ],
      tabs: [
        { id: 1, name: "Số Liệu", icon: "📊" },
        { id: 2, name: "So Sánh", icon: "📈" },
        { id: 3, name: "Mục Tiêu", icon: "🎯" },
        { id: 4, name: "Kết Quả", icon: "📋" },
      ],
      dataStore: {},
      dbStatus: "offline",
    };
  },
  created() {
    this.initBaselineDataStore();
    this.loadAllData();
  },
  computed: {
    activeComponent() {
      switch (this.activeTab) {
        case 1:
          return "QualityReport";
        case 2:
          return "ComparisonReport";
        case 3:
          return "TargetTracking";
        case 4:
          return "FinalReport";
        default:
          return "PagePlaceholder";
      }
    },
    pageTitle() {
      switch (this.activeTab) {
        case 1:
          return `Báo Cáo Chất Lượng XNTH ${this.selectedYear}`;
        case 2:
          return `Biểu Đồ So Sánh ${this.selectedYear - 1} - ${this.selectedYear}`;
        case 3:
          return `Theo Dõi Mục Tiêu Chất Lượng ${this.selectedYear}`;
        case 4:
          return `Kết Quả Final ${this.selectedYear} - XN Chợ Gạo`;
        default:
          return '';
      }
    },
    componentProps() {
      const prevYearData = this.getYearData(this.selectedYear - 1);
      const activeYearData = this.getYearData(this.selectedYear);

      if (this.activeTab === 1 || this.activeTab === 2) {
        return {
          theme: this.theme,
          data2024: prevYearData.quality,
          data2025: activeYearData.quality,
          selectedYear: this.selectedYear,
          availableYears: this.availableYears,
        };
      } else if (this.activeTab === 3) {
        return {
          theme: this.theme,
          targetTrackingData: activeYearData.targetTracking,
          selectedYear: this.selectedYear,
          availableYears: this.availableYears,
        };
      } else if (this.activeTab === 4) {
        return {
          theme: this.theme,
          finalReportData: activeYearData.finalReport,
          selectedYear: this.selectedYear,
          availableYears: this.availableYears,
        };
      } else {
        return { pageNumber: this.activeTab };
      }
    },
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    expandSidebar() {
      this.sidebarCollapsed = false;
    },
    collapseSidebar() {
      this.sidebarCollapsed = true;
    },
    selectTab(tabId) {
      this.activeTab = tabId;
      this.isPrintMode = false;
    },
    onViewModeChange(mode) {
      this.isPrintMode = mode === "print-preview";
    },
    onUpdateYear(year) {
      this.selectedYear = year;
    },
    triggerExport() {
      if (
        this.$refs.activeChild &&
        typeof this.$refs.activeChild.exportExcel === "function"
      ) {
        this.$refs.activeChild.exportExcel();
      } else {
        alert("Tính năng Xuất Excel chưa được hỗ trợ cho trang này.");
      }
    },
    triggerExportAll() {
      const prevYearData = this.getYearData(this.selectedYear - 1);
      const activeYearData = this.getYearData(this.selectedYear);
      
      const finalReportData = activeYearData.finalReport;
      const totalFinal = finalReportData.rows.reduce((sum, r) => sum + r.final, 0);
      const totalPassed = finalReportData.rows.reduce((sum, r) => sum + r.passed, 0);
      const totalFailed = finalReportData.rows.reduce((sum, r) => sum + r.failed, 0);
      const totalPassedRate = totalFinal === 0 ? '0.00' : ((totalPassed / totalFinal) * 100).toFixed(2);
      const totalFailedRate = totalFinal === 0 ? '0.00' : ((totalFailed / totalFinal) * 100).toFixed(2);
      
      const totals = {
        final: totalFinal,
        passed: totalPassed,
        failed: totalFailed,
        passedRate: totalPassedRate,
        failedRate: totalFailedRate
      };

      exportAllReports(
        this.selectedYear,
        prevYearData.quality,
        activeYearData.quality,
        activeYearData.targetTracking,
        finalReportData,
        totals
      );
    },
    triggerPrint() {
      window.print();
    },
    // Page 1 & 2 Sync
    onUpdateData({ year, rowIdx, monthIdx, value }) {
      const targetYear =
        year === 2024 ? this.selectedYear - 1 : this.selectedYear;
      const targetTable = this.getYearData(targetYear).quality;
      targetTable.rows[rowIdx].months.splice(monthIdx, 1, value);
    },
    // Page 3 Sync
    onUpdateTargetData({ metricIdx, rowKey, monthIdx, value }) {
      const activeYearData = this.getYearData(this.selectedYear);
      const metric = activeYearData.targetTracking.metrics[metricIdx];
      metric[rowKey].splice(monthIdx, 1, value);

      // Persist to localStorage if editing targets
      if (rowKey === "target") {
        const key = `target_tracking_targets_${this.selectedYear}_${metric.id}`;
        localStorage.setItem(key, JSON.stringify(metric.target));
      }
    },
    // Page 4 Sync
    onUpdateFinalData({ monthIdx, key, value }) {
      const activeYearData = this.getYearData(this.selectedYear);
      const row = activeYearData.finalReport.rows[monthIdx];

      if (key === "defects") {
        row.defects = value;
      } else {
        row[key] = value;
        // Auto-rebalance counts: final = passed + failed
        if (key === "final") {
          row.passed = value - row.failed;
        } else if (key === "passed") {
          row.failed = row.final - value;
        } else if (key === "failed") {
          row.passed = row.final - value;
        }
      }
    },
    async loadAllData() {
      this.dbStatus = "loading";
      const currentYear = this.selectedYear;
      const prevYear = currentYear - 1;

      try {
        await Promise.all([
          this.fetchYearDataFromDb(currentYear),
          this.fetchYearDataFromDb(prevYear),
        ]);
        this.dbStatus = "connected";
      } catch (err) {
        console.error(
          "Failed to load database data, falling back to mock.",
          err
        );
        this.dbStatus = "offline";
        this.ensureFallbackData(currentYear);
        this.ensureFallbackData(prevYear);
      }
      this.applyPersistedTargets(currentYear);
      this.applyPersistedTargets(prevYear);
    },
    async fetchYearDataFromDb(year) {
      const responseQuality = await axios.get(
        `http://localhost:5000/api/reports/quality?year=${year}`
      );
      const responseTarget = await axios.get(
        `http://localhost:5000/api/reports/target-tracking?year=${year}`
      );
      const responseFinal = await axios.get(
        `http://localhost:5000/api/reports/final-qa?year=${year}`
      );

      if (
        responseQuality.data.status === "success" &&
        responseTarget.data.status === "success" &&
        responseFinal.data.status === "success"
      ) {
        this.dataStore[year] = {
          quality: responseQuality.data.data,
          targetTracking: responseTarget.data.data,
          finalReport: responseFinal.data.data,
        };
      } else {
        throw new Error("API returned unsuccessful status");
      }
    },
    ensureFallbackData(year) {
      if (!this.dataStore[year]) {
        this.dataStore[year] = {
          quality: this.generateQualityData(year),
          targetTracking: this.generateTargetTrackingData(year),
          finalReport: this.generateFinalReportData(year),
        };
      }
    },

    // Handles restorations
    onResetData() {
      const currentYear = this.selectedYear;
      const prevYear = currentYear - 1;

      const clearKeysForYear = (year) => {
        const data = this.dataStore[year];
        if (data && data.targetTracking) {
          data.targetTracking.metrics.forEach((metric) => {
            localStorage.removeItem(
              `target_tracking_targets_${year}_${metric.id}`
            );
          });
        }
      };

      clearKeysForYear(currentYear);
      clearKeysForYear(prevYear);

      this.dataStore = {};
      this.initBaselineDataStore();
      this.selectedYear = 2025;
      this.loadAllData();
    },

    // Lazy data caching/generators
    getYearData(year) {
      if (!this.dataStore[year]) {
        this.dataStore[year] = {
          quality: this.generateQualityData(year),
          targetTracking: this.generateTargetTrackingData(year),
          finalReport: this.generateFinalReportData(year),
        };
        this.applyPersistedTargets(year);
      }
      return this.dataStore[year];
    },
    applyPersistedTargets(year) {
      if (this.dataStore[year] && this.dataStore[year].targetTracking) {
        this.dataStore[year].targetTracking.metrics.forEach((metric) => {
          const key = `target_tracking_targets_${year}_${metric.id}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            try {
              metric.target = JSON.parse(saved);
            } catch (e) {
              console.error("Error parsing saved targets", e);
            }
          }
        });
      }
    },

    initBaselineDataStore() {
      this.dataStore = {
        2024: {
          quality: {
            title: "TỔNG KẾT TỶ LỆ HÀNG HƯ TRUNG BÌNH NĂM 2024 XNTH 2",
            col1Header: "XN 3",
            rows: [
              {
                label: "Trước ủi 2024",
                months: [
                  0.0, 0.0, 0.0, 12.63, 13.57, 9.48, 12.57, 11.89, 12.48, 10.14,
                  11.96, 9.11,
                ],
              },
              {
                label: "Sau ủi 2024",
                months: [
                  0.0, 0.0, 0.0, 28.38, 14.22, 10.02, 14.39, 11.95, 13.62, 7.43,
                  11.23, 9.15,
                ],
              },
            ],
          },
          targetTracking: this.generateTargetTrackingData(2024),
          finalReport: this.generateFinalReportData(2024),
        },
        2025: {
          quality: {
            title: "TỔNG KẾT TỶ LỆ HÀNG HƯ TRUNG BÌNH NĂM 2025 XNTH 2",
            col1Header: "XN 3",
            rows: [
              {
                label: "Trước ủi 2025",
                months: [
                  11.15, 12.33, 11.25, 9.46, 8.22, 10.64, 7.9, 8.13, 9.49,
                  11.35, 9.89, 8.36,
                ],
              },
              {
                label: "Sau ủi 2025",
                months: [
                  13.82, 12.5, 11.56, 7.68, 8.71, 9.76, 7.79, 8.21, 9.39, 11.31,
                  9.39, 8.0,
                ],
              },
            ],
          },
          targetTracking: {
            title: "THEO DÕI MỤC TIÊU CHẤT LƯỢNG 2025",
            subtitle: "MỤC TIÊU - KẾT QUẢ XNCG 2025",
            metrics: [
              {
                id: "before-iron",
                name: "Mục tiêu tỉ lệ SPKPH trước ủi",
                maxY: 50,
                yGridSteps: 5,
                target: [
                  5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0,
                ],
                actual: [
                  7.0, 7.6, 7.4, 7.3, 7.3, 7.8, 7.0, 7.0, 6.7, 7.5, 7.7, 7.6,
                ],
              },
              {
                id: "after-iron",
                name: "Mục tiêu tỉ lệ SPKPH sau ủi",
                maxY: 20,
                yGridSteps: 4,
                target: [
                  2.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0,
                ],
                actual: [
                  6.3, 5.7, 5.2, 4.9, 5.3, 5.4, 6.0, 5.2, 5.0, 4.7, 5.1, 4.7,
                ],
              },
              {
                id: "final-defect",
                name: "Mục tiêu tỉ lệ SPKPH final",
                maxY: 50,
                yGridSteps: 5,
                target: [
                  0.0, 3.0, 3.0, 3.0, 3.0, 3.0, 0.0, 3.0, 0.0, 0.0, 3.0, 0.0,
                ],
                actual: [
                  3.4, 13.0, 4.0, 4.3, 5.6, 0.0, 5.0, 0.0, 0.0, 9.1, 0.0, 0.0,
                ],
              },
              {
                id: "on-time-delivery",
                name: "Mục tiêu giao hàng đúng tiến độ",
                maxY: 200,
                yGridSteps: 4,
                target: [
                  100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0,
                  100.0, 100.0, 100.0,
                ],
                actual: [
                  100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0,
                  100.0, 100.0, 100.0,
                ],
              },
              {
                id: "customer-complaints",
                name: "Mục tiêu khiếu nại của khách hàng",
                maxY: 4,
                yGridSteps: 2,
                target: [
                  0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                ],
                actual: [
                  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                ],
              },
            ],
          },
          finalReport: {
            title: "BÁO CÁO KẾT QUẢ FINAL NĂM 2025 XN-CHỢ GẠO",
            company: "CÔNG TY CỔ PHẦN TEX-GIANG",
            department: "Bộ phận: QLCL",
            date: "Ngày 27 tháng 12 Năm 2025",
            rows: [
              {
                month: "T1",
                final: 29,
                passed: 28,
                failed: 1,
                defects: "Cầm nhãn",
              },
              {
                month: "T2",
                final: 30,
                passed: 26,
                failed: 4,
                defects: "Cầm nhãn + khuy đứt chỉ",
              },
              {
                month: "T3",
                final: 25,
                passed: 24,
                failed: 1,
                defects: "Dây treo cổ sau xì + đứt chỉ",
              },
              {
                month: "T4",
                final: 23,
                passed: 22,
                failed: 1,
                defects: "cầm nhãn + đứt chỉ",
              },
              {
                month: "T5",
                final: 18,
                passed: 17,
                failed: 1,
                defects: "Tape ngực xéo + đứt chỉ",
              },
              { month: "T6", final: 20, passed: 20, failed: 0, defects: "" },
              {
                month: "T7",
                final: 20,
                passed: 19,
                failed: 1,
                defects: "Đứt chỉ + cầm nhãn + rách",
              },
              { month: "T8", final: 19, passed: 19, failed: 0, defects: "" },
              { month: "T9", final: 16, passed: 16, failed: 0, defects: "" },
              {
                month: "T10",
                final: 11,
                passed: 10,
                failed: 1,
                defects: "vành nón giựt, cầm nhãn",
              },
              { month: "T11", final: 4, passed: 4, failed: 0, defects: "" },
              { month: "T12", final: 4, passed: 4, failed: 0, defects: "" },
            ],
          },
        },
      };
    },

    generateQualityData(year) {
      const seed = (year % 10) + 1;
      const baseTruoc = 9.0 + seed * 0.4;
      const baseSau = baseTruoc - 0.5 + seed * 0.2;

      const truocMonths = [];
      const sauMonths = [];
      for (let m = 0; m < 12; m++) {
        const swing =
          Math.sin((m / 11) * Math.PI * 2) * 2.5 +
          Math.cos((m / 11) * Math.PI) * 1.2;
        const noise = ((year * (m + 1)) % 100) / 100 - 0.5;

        let tVal = Math.max(2.0, baseTruoc + swing + noise);
        let sVal = Math.max(1.5, baseSau + swing * 0.9 + noise * 0.8);

        truocMonths.push(parseFloat(tVal.toFixed(2)));
        sauMonths.push(parseFloat(sVal.toFixed(2)));
      }

      return {
        title: `TỔNG KẾT TỶ LỆ HÀNG HƯ TRUNG BÌNH NĂM ${year} XNTH 2`,
        col1Header: "XN 3",
        rows: [
          {
            label: `Trước ủi ${year}`,
            months: truocMonths,
          },
          {
            label: `Sau ủi ${year}`,
            months: sauMonths,
          },
        ],
      };
    },

    generateTargetTrackingData(year) {
      const beforeTarget = Array(12).fill(5.0);
      const beforeActual = [];
      const afterTarget = Array(12).fill(3.0);
      const afterActual = [];
      const finalTarget = [
        0.0, 3.0, 3.0, 3.0, 3.0, 3.0, 0.0, 3.0, 0.0, 0.0, 3.0, 0.0,
      ];
      const finalActual = [];
      const onTimeTarget = Array(12).fill(100.0);
      const onTimeActual = Array(12).fill(100.0);
      const complaintsTarget = Array(12).fill(0.1);
      const complaintsActual = [];

      for (let m = 0; m < 12; m++) {
        beforeActual.push(
          parseFloat((6.5 + ((year * (m + 3)) % 15) / 10).toFixed(1))
        );
        afterActual.push(
          parseFloat((4.5 + ((year * (m + 7)) % 15) / 10).toFixed(1))
        );
        finalActual.push(
          (year * (m + 11)) % 10 < 3
            ? 0.0
            : parseFloat((3.0 + ((year * (m + 5)) % 10)).toFixed(1))
        );
        complaintsActual.push((year * (m + 1)) % 20 === 0 ? 1.0 : 0.0);
      }

      return {
        title: `THEO DÕI MỤC TIÊU CHẤT LƯỢNG ${year}`,
        subtitle: `MỤC TIÊU - KẾT QUẢ XNCG ${year}`,
        metrics: [
          {
            id: "before-iron",
            name: "Mục tiêu tỉ lệ SPKPH trước ủi",
            maxY: 50,
            yGridSteps: 5,
            target: beforeTarget,
            actual: beforeActual,
          },
          {
            id: "after-iron",
            name: "Mục tiêu tỉ lệ SPKPH sau ủi",
            maxY: 20,
            yGridSteps: 4,
            target: afterTarget,
            actual: afterActual,
          },
          {
            id: "final-defect",
            name: "Mục tiêu tỉ lệ SPKPH final",
            maxY: 50,
            yGridSteps: 5,
            target: finalTarget,
            actual: finalActual,
          },
          {
            id: "on-time-delivery",
            name: "Mục tiêu giao hàng đúng tiến độ",
            maxY: 200,
            yGridSteps: 4,
            target: onTimeTarget,
            actual: onTimeActual,
          },
          {
            id: "customer-complaints",
            name: "Mục tiêu khiếu nại của khách hàng",
            maxY: 4,
            yGridSteps: 2,
            target: complaintsTarget,
            actual: complaintsActual,
          },
        ],
      };
    },

    generateFinalReportData(year) {
      const defectsPool = [
        "Cầm nhãn",
        "Cầm nhãn + khuy đứt chỉ",
        "Dây treo cổ sau xì + đứt chỉ",
        "cầm nhãn + đứt chỉ",
        "Tape ngực xéo + đứt chỉ",
        "Đứt chỉ + cầm nhãn + rách",
        "vành nón giựt, cầm nhãn",
        "Xéo nẹp + sút sườn",
        "Dơ bẩn mực dính",
        "Đứt chỉ móc xích nách",
      ];

      const rows = [];
      for (let m = 1; m <= 12; m++) {
        const finalVal = 5 + ((year * m + 13) % 31);
        let failedVal = (year * m) % 5;
        if (failedVal >= finalVal) failedVal = 0;
        const passedVal = finalVal - failedVal;
        const defects =
          failedVal > 0 ? defectsPool[(year * m) % defectsPool.length] : "";

        rows.push({
          month: `T${m}`,
          final: finalVal,
          passed: passedVal,
          failed: failedVal,
          defects: defects,
        });
      }

      return {
        title: `BÁO CÁO KẾT QUẢ FINAL NĂM ${year} XN-CHỢ GẠO`,
        company: "CÔNG TY CỔ PHẦN TEX-GIANG",
        department: "Bộ phận: QLCL",
        date: `Ngày 27 tháng 12 Năm ${year}`,
        rows: rows,
      };
    },
  },
  watch: {
    selectedYear() {
      this.loadAllData();
    },
  },
};
</script>

<style>
/* Reset & Global styles */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Inter", sans-serif;
  overflow-x: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Global design variables */
.app-container.dark {
  color-scheme: dark;

  /* Nền chính: Màu xanh đen sâu thẳm (Deep Space), làm nổi bật cực tốt màu Cyan và Lime */
  --bg-primary: #0a0f1d;

  /* Khối thẻ và Sidebar: Tông xanh xám đậm, tạo hiệu ứng phân lớp đổ bóng */
  --bg-secondary: #111827;
  --bg-card: #151f32;
  --sidebar-bg: #0d1321;

  /* Chữ: Màu trắng băng (Ice White) và xám xanh mờ để đồng bộ với biểu đồ */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;

  /* Đường viền: Tông lạnh mờ, giữ cho giao diện gọn gàng */
  --border-color: #1e293b;

  /* Điểm nhấn (Accent): Đồng bộ theo tông Acid Green sẵn có trong hệ thống của bạn */
  --accent-color: #ccff00;
  --accent-hover: #b3e600;

  /* Lưới biểu đồ: Sử dụng chính màu Cyan mờ để tạo cảm giác màn hình hiển thị rada (HUD) */
  --chart-grid: rgba(0, 240, 255, 0.04);

  /* Ô nhập liệu */
  --input-bg: #0b0f19;
  --input-border: #334155;

  /* Bóng đổ: Lan tỏa một chút ánh xanh dịu mắt */
  --shadow-color: rgba(0, 240, 255, 0.03);
  --sidebar-hover: rgba(0, 240, 255, 0.05);
}
.app-container.light {
  color-scheme: light;

  /* Nền chính: Màu xám trắng dịu, có một chút ánh xanh ngọc cực nhẹ để ăn nhập với biểu đồ */
  --bg-primary: #f5f8fa;

  /* Khối thẻ và Sidebar: Màu trắng tinh khôi để tạo độ tương phản rõ ràng */
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --sidebar-bg: #ffffff;

  /* Chữ: Màu xám than đậm (thay vì đen tuyền để đỡ gắt) và xám ghi cho chữ phụ */
  --text-primary: #1e293b;
  --text-secondary: #64748b;

  /* Đường viền: Xám mảnh, tạo cảm giác tinh tế, gọn gàng */
  --border-color: #e2e8f0;

  /* Điểm nhấn (Accent): Chuyển từ màu cam cũ sang màu Xanh Ngọc để đồng bộ với biểu đồ mới */
  --accent-color: #0ea5e9;
  --accent-hover: #0284c7;

  /* Lưới biểu đồ: Đường kẻ mờ màu xám để không làm rối mắt */
  --chart-grid: rgba(0, 0, 0, 0.04);

  /* Ô nhập liệu */
  --input-bg: #ffffff;
  --input-border: #cbd5e1;

  /* Bóng đổ: Đổ bóng mờ dịu dạng tinh thể nước */
  --shadow-color: rgba(14, 165, 233, 0.05);
  --sidebar-hover: rgba(14, 165, 233, 0.04);
}

/* Master Grid Structure */
.app-container {
  display: block;
  min-height: 100vh;
  color: var(--text-primary);
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: inherit;
}

/* Sidebar Drawer Style */
.app-sidebar {
  width: 260px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 10px var(--shadow-color);
  overflow-x: hidden;
}

.sidebar-brand {
  height: 80px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  overflow: hidden;
}

.brand-logo-wrapper {
  width: 44px;
  flex-shrink: 0;
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo-svg {
  width: 100%;
  height: auto;
}

.brand-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  letter-spacing: 0.5px;
  transition: opacity 0.2s ease;
}

.sidebar-nav {
  flex-grow: 1;
  padding: 24px 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 0px;
  border-left: 2px solid transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.nav-item:hover {
  background-color: var(--sidebar-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background-color: var(--sidebar-hover);
  border-left-color: var(--accent-color);
  color: var(--accent-color);
  box-shadow: none;
}

.app-container.light .nav-item.active {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.nav-icon {
  font-size: 18px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  min-width: 24px;
  max-width: 24px;
  height: 24px;
  min-height: 24px;
  max-height: 24px;
  line-height: 1;
  flex-shrink: 0;
  transition: none !important;
  transform: translateZ(0); /* Hardware acceleration to prevent sub-pixel rendering changes */
}

.nav-text {
  transition: opacity 0.2s ease;
}

.nav-badge {
  background-color: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 0px;
  margin-left: auto;
  text-transform: uppercase;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-control-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: none;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0px;
  transition: all 0.2s;
  white-space: nowrap;
}

.footer-control-btn:hover {
  background-color: var(--sidebar-hover);
  color: var(--text-primary);
}

.control-icon {
  font-size: 16px !important;
  width: 24px;
  min-width: 24px;
  max-width: 24px;
  height: 24px;
  min-height: 24px;
  max-height: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: none !important;
  transform: translateZ(0);
}

.control-text {
  transition: opacity 0.2s ease;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 10px;
  border-top: 1px solid var(--border-color);
  margin-top: 8px;
  overflow: hidden;
}

.user-avatar {
  width: 36px;
  min-width: 36px;
  max-width: 36px;
  height: 36px;
  min-height: 36px;
  max-height: 36px;
  background: linear-gradient(135deg, var(--accent-color), #ec4899);
  color: white;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  transition: none !important;
  transform: translateZ(0);
}

.user-info {
  display: flex;
  flex-direction: column;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.user-role {
  font-size: 10.5px;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* Main Area Container */
.app-main {
  flex-grow: 1;
  margin-left: 260px;
  min-height: 100vh;
  padding: 30px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--bg-primary);
}

/* Collapsed Sidebar Adjustments */
.app-container.sidebar-collapsed .app-sidebar {
  width: 70px;
}

.app-container.sidebar-collapsed .brand-name,
.app-container.sidebar-collapsed .nav-text,
.app-container.sidebar-collapsed .nav-badge,
.app-container.sidebar-collapsed .control-text {
  opacity: 0;
  pointer-events: none;
  width: 0;
  margin: 0;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
}

.app-container.sidebar-collapsed .user-info {
  opacity: 0;
  pointer-events: none;
  width: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
}

.app-container.sidebar-collapsed .app-main {
  margin-left: 70px;
}

/* Print Overrides in master container */
.app-container.is-print-mode .app-main {
  margin-left: 0 !important;
  padding: 0 !important;
  background-color: white !important;
}

/* Print/Screen layout rules for print-only */
@media screen {
  .print-only {
    position: absolute !important;
    left: -9999px !important;
    top: -9999px !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
  }
}

@media print {
  .print-only {
    position: static !important;
    visibility: visible !important;
    display: flex !important;
    height: auto !important;
    overflow: visible !important;
  }
}

/* Hide all headers, sidebar and preview mode banner in print */
@media print {
  .no-print {
    display: none !important;
  }
  .app-sidebar {
    display: none !important;
  }
  .app-main {
    margin-left: 0 !important;
    padding: 0 !important;
    background-color: white !important;
  }
}

/* Responsive adjustment for small screens */
@media (max-width: 992px) {
  .app-sidebar {
    width: 70px;
  }
  .brand-name,
  .nav-text,
  .nav-badge,
  .control-text,
  .user-info {
    display: none;
  }
  .app-main {
    margin-left: 70px;
    padding: 16px;
  }
  .collapse-toggle {
    display: none;
  }
}
.db-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 0px;
  font-size: 11px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}
.db-status-indicator.subtle-status {
  background: transparent !important;
  border: none !important;
  padding: 0;
  margin-top: 0;
  margin-right: 15px;
  font-weight: 500;
  color: var(--text-secondary) !important;
  height: 34px;
}
.db-status-indicator.subtle-status .status-text {
  opacity: 0.8;
}
.app-container.light .db-status-indicator {
  background-color: rgba(0, 0, 0, 0.02);
}
.db-status-indicator.connected {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}
.db-status-indicator.connected .status-dot {
  background-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}
.db-status-indicator.loading {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.2);
}
.db-status-indicator.loading .status-dot {
  background-color: #f59e0b;
  animation: status-blink 1s infinite alternate;
}
.db-status-indicator.offline {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}
.db-status-indicator.offline .status-dot {
  background-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
@keyframes status-blink {
  0% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.selector-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 8px;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.year-select {
  width: 100%;
  padding: 10px 32px 10px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: all 0.2s ease;
}

.year-select option {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.year-select:hover {
  border-color: var(--accent-color);
  background-color: var(--sidebar-hover);
}

.year-select:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  color: var(--text-secondary);
  pointer-events: none;
}

/* Common Header Styles */
.page-action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 24px 24px;
  padding-top: 24px;
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
  margin: 0;
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

.btn-action {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-action .icon {
  font-size: 15px;
}

.btn-excel {
  background-color: #10b981;
  color: white;
}

.btn-excel:hover {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}

.btn-excel-all {
  background-color: #6366f1; /* Indigo */
  color: white;
}

.btn-excel-all:hover {
  background-color: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}

.btn-print {
  background-color: #0ea5e9;
  color: white;
}

.btn-print:hover {
  background-color: #0284c7;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);
}
</style>
