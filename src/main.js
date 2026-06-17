import { createApp } from 'vue'
import App from './App.vue'

import ECharts from 'vue-echarts'
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkLineComponent,
  MarkPointComponent
} from "echarts/components";

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkLineComponent,
  MarkPointComponent
]);

// Suppress "ResizeObserver loop completed with undelivered notifications." error
// This is a common benign error when using vue-echarts autoresize
window.addEventListener('error', e => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' || e.message === 'ResizeObserver loop limit exceeded') {
    const resizeObserverErrDiv = document.getElementById(
      'webpack-dev-server-client-overlay-div'
    );
    const resizeObserverErr = document.getElementById(
      'webpack-dev-server-client-overlay'
    );
    if (resizeObserverErr) {
      resizeObserverErr.setAttribute('style', 'display: none');
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none');
    }
  }
});

const debounce = (callback, delay) => {
  let tid;
  return function(...args) {
    const ctx = this;
    tid && clearTimeout(tid);
    tid = setTimeout(() => {
      callback.apply(ctx, args);
    }, delay);
  };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 20);
    super(callback);
  }
};

const app = createApp(App)
app.component('v-chart', ECharts)
app.mount('#app')
