<template>
  <div class="func-graph">
    <div class="plot">
      <svg viewBox="0 0 440 440" preserveAspectRatio="xMidYMid meet" role="img" :aria-label="expr">
        <defs>
          <clipPath :id="id">
            <rect :x="PAD" :y="PAD" :width="SIZE" :height="SIZE" />
          </clipPath>
          <marker :id="id + '-arrow'" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" class="arrow" />
          </marker>
        </defs>

        <!-- 网格 -->
        <g class="grid">
          <template v-for="t in ticks" :key="t">
            <line :x1="px(t)" :y1="py(YMIN)" :x2="px(t)" :y2="py(YMAX)" />
            <line :x1="px(XMIN)" :y1="py(t)" :x2="px(XMAX)" :y2="py(t)" />
          </template>
        </g>

        <!-- 坐标轴 -->
        <g class="axes">
          <line :x1="px(XMIN)" :y1="py(0)" :x2="px(XMAX) + 6" :y2="py(0)" :marker-end="'url(#' + id + '-arrow)'" />
          <line :x1="px(0)" :y1="py(YMAX) + 6" :x2="px(0)" :y2="py(YMIN)" :marker-end="'url(#' + id + '-arrow)'" />
        </g>

        <!-- 刻度数字 -->
        <g class="ticks">
          <template v-for="t in ticks" :key="'xt' + t">
            <text v-if="t !== 0" :x="px(t)" :y="py(0) + 4" text-anchor="middle" dominant-baseline="hanging">{{ t }}</text>
          </template>
          <template v-for="t in ticks" :key="'yt' + t">
            <text v-if="t !== 0" :x="px(0) - 4" :y="py(t)" text-anchor="end" dominant-baseline="middle">{{ t }}</text>
          </template>
        </g>

        <!-- 函数曲线 -->
        <path :d="curvePath" class="curve" fill="none" :clip-path="'url(#' + id + ')'" />

        <!-- 二次函数：对称轴 + 顶点 -->
        <g v-if="type === 'quadratic' && vertex" :clip-path="'url(#' + id + ')'">
          <line class="sym" :x1="px(vertex.h)" :y1="py(YMAX)" :x2="px(vertex.h)" :y2="py(YMIN)" />
          <circle class="vertex" :cx="px(vertex.h)" :cy="py(vertex.k)" r="4.5" />
        </g>

        <!-- 一次函数：截距点 -->
        <g v-if="type === 'linear'">
          <circle v-for="(pt, i) in intercepts" :key="i" class="pt" :cx="px(pt.x)" :cy="py(pt.y)" r="4" />
        </g>

        <!-- 轴名 -->
        <g class="axis-name">
          <text :x="px(XMAX) - 2" :y="py(0) - 8" text-anchor="end">x</text>
          <text :x="px(0) + 8" :y="py(YMAX) + 2" text-anchor="start">y</text>
        </g>
      </svg>
    </div>

    <div class="controls">
      <div class="slider" v-for="s in cfg.sliders" :key="s.key">
        <label class="slider-label">{{ s.label }}</label>
        <input type="range" :min="s.min" :max="s.max" :step="s.step" v-model.number="params[s.key]" />
        <code class="slider-val">{{ fmt(params[s.key]) }}</code>
      </div>
    </div>

    <div class="expr">{{ expr }}</div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  type: { type: String, required: true }, // 'linear' | 'inverse' | 'quadratic'
})

let uid = 0

const CONFIG = {
  linear: {
    sliders: [
      { key: 'k', label: '斜率 k', min: -4, max: 4, step: 0.1 },
      { key: 'b', label: '截距 b', min: -4, max: 4, step: 0.1 },
    ],
    defaults: { k: 1, b: 1 },
  },
  quadratic: {
    sliders: [
      { key: 'a', label: 'a', min: -2, max: 2, step: 0.1 },
      { key: 'b', label: 'b', min: -4, max: 4, step: 0.1 },
      { key: 'c', label: 'c', min: -4, max: 4, step: 0.1 },
    ],
    defaults: { a: 1, b: -2, c: -3 },
  },
  inverse: {
    sliders: [
      { key: 'k', label: '比例系数 k', min: -8, max: 8, step: 0.1 },
    ],
    defaults: { k: 2 },
  },
}

const cfg = CONFIG[props.type] || CONFIG.linear
const params = reactive({ ...cfg.defaults })
const id = 'fg-' + (++uid)

// 坐标系
const PAD = 40
const SIZE = 360
const XMIN = -6, XMAX = 6, YMIN = -6, YMAX = 6
const px = (x) => PAD + ((x - XMIN) / (XMAX - XMIN)) * SIZE
const py = (y) => PAD + ((YMAX - y) / (YMAX - YMIN)) * SIZE

const ticks = []
for (let i = XMIN; i <= XMAX; i++) ticks.push(i)

function fmt(v) {
  return String(Math.round(v * 100) / 100)
}

function coeff(c, symbol) {
  if (c === 1) return symbol
  if (c === -1) return '−' + symbol
  return fmt(c) + symbol
}

function linearStr(k, b) {
  if (k === 0) return 'y = ' + fmt(b)
  let s = 'y = ' + coeff(k, 'x')
  if (b > 0) s += ' + ' + fmt(b)
  else if (b < 0) s += ' − ' + fmt(Math.abs(b))
  return s
}

function quadraticStr(a, b, c) {
  if (a === 0) return linearStr(b, c)
  let s = 'y = ' + coeff(a, 'x²')
  if (b > 0) s += ' + ' + (Math.abs(b) === 1 ? 'x' : fmt(b) + 'x')
  else if (b < 0) s += ' − ' + (Math.abs(b) === 1 ? 'x' : fmt(Math.abs(b)) + 'x')
  if (c > 0) s += ' + ' + fmt(c)
  else if (c < 0) s += ' − ' + fmt(Math.abs(c))
  return s
}

function inverseStr(k) {
  if (k === 1) return 'y = 1/x'
  if (k === -1) return 'y = −1/x'
  return 'y = ' + fmt(k) + '/x'
}

const expr = computed(() => {
  const p = params
  if (props.type === 'quadratic') return quadraticStr(p.a, p.b, p.c)
  if (props.type === 'inverse') return inverseStr(p.k)
  return linearStr(p.k, p.b)
})

const curvePath = computed(() => {
  const p = params
  if (props.type === 'quadratic') {
    const pts = []
    for (let x = XMIN; x <= XMAX + 1e-9; x += 0.05) {
      const y = p.a * x * x + p.b * x + p.c
      if (isFinite(y)) pts.push(px(x).toFixed(1) + ',' + py(y).toFixed(1))
    }
    return 'M ' + pts.join(' L ')
  }
  if (props.type === 'inverse') {
    const neg = [], pos = []
    for (let x = XMIN; x <= -0.04; x += 0.04) {
      const y = p.k / x
      if (isFinite(y)) neg.push(px(x).toFixed(1) + ',' + py(y).toFixed(1))
    }
    for (let x = 0.04; x <= XMAX; x += 0.04) {
      const y = p.k / x
      if (isFinite(y)) pos.push(px(x).toFixed(1) + ',' + py(y).toFixed(1))
    }
    return 'M ' + neg.join(' L ') + ' M ' + pos.join(' L ')
  }
  // linear
  const y1 = p.k * XMIN + p.b
  const y2 = p.k * XMAX + p.b
  return `M ${px(XMIN)} ${py(y1)} L ${px(XMAX)} ${py(y2)}`
})

const vertex = computed(() => {
  if (props.type !== 'quadratic') return null
  const { a, b, c } = params
  if (a === 0) return null
  const h = -b / (2 * a)
  const k = (4 * a * c - b * b) / (4 * a)
  return { h, k }
})

const intercepts = computed(() => {
  if (props.type !== 'linear') return []
  const { k, b } = params
  const arr = []
  if (Math.abs(b) <= YMAX) arr.push({ x: 0, y: b })
  if (k !== 0) {
    const x0 = -b / k
    if (Math.abs(x0) <= XMAX && x0 !== 0) arr.push({ x: x0, y: 0 })
  }
  return arr
})
</script>

<style scoped>
.func-graph {
  max-width: 560px;
  margin: 1rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
}
.plot {
  width: 100%;
}
.plot svg {
  width: 100%;
  height: auto;
  display: block;
}
.grid line {
  stroke: var(--vp-c-divider);
  stroke-width: 0.6;
}
.axes line {
  stroke: var(--vp-c-text-2);
  stroke-width: 1.4;
}
.arrow {
  fill: var(--vp-c-text-2);
}
.ticks text {
  font-size: 9px;
  fill: var(--vp-c-text-3);
}
.axis-name text {
  font-size: 13px;
  fill: var(--vp-c-text-2);
  font-style: italic;
}
.curve {
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.4;
  stroke-linecap: round;
}
.sym {
  stroke: var(--vp-c-brand-2);
  stroke-width: 1.2;
  stroke-dasharray: 4 4;
}
.vertex {
  fill: var(--vp-c-brand-1);
}
.pt {
  fill: var(--vp-c-brand-3);
}
.controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}
.slider {
  display: flex;
  align-items: center;
  gap: 10px;
}
.slider-label {
  width: 78px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  flex: none;
}
.slider input[type="range"] {
  flex: 1;
  accent-color: var(--vp-c-brand-1);
}
.slider-val {
  width: 40px;
  text-align: right;
  font-size: 13px;
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
}
.expr {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-align: center;
}
</style>
