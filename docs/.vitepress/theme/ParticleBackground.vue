<template>
  <canvas ref="canvas" class="hero-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let animId = null
let nodes = []
let mouse = { x: -999, y: -999 }
let targetMouse = { x: -999, y: -999 }
let heroEl = null
let homeEl = null

const CONFIG = {
  nodeCount: 55,
  nodeRadius: 2.8,
  connectDist: 160,
  mouseRadius: 200,
  mouseForce: 0.04,
  lineWidth: 0.6,
  lineOpacity: 0.22,
  nodeOpacity: 0.35,
  speed: 0.35,
  colorLight: '#4750af',
  colorDark: '#7c87f0',
}

function isDark() {
  return document.documentElement.classList.contains('dark')
}

function getColor() {
  return isDark() ? CONFIG.colorDark : CONFIG.colorLight
}

function createNodes(w, h) {
  const arr = []
  for (let i = 0; i < CONFIG.nodeCount; i++) {
    arr.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * CONFIG.speed,
      vy: (Math.random() - 0.5) * CONFIG.speed,
    })
  }
  return arr
}

function updateLayout() {
  if (!canvas.value || !heroEl || !homeEl) return
  const heroRect = heroEl.getBoundingClientRect()
  const homeRect = homeEl.getBoundingClientRect()
  const w = heroRect.width
  const h = heroRect.height
  const left = heroRect.left - homeRect.left
  const top = heroRect.top - homeRect.top
  if (w === 0 || h === 0) return

  const dpr = window.devicePixelRatio || 1
  canvas.value.width = w * dpr
  canvas.value.height = h * dpr
  canvas.value.style.width = w + 'px'
  canvas.value.style.height = h + 'px'
  canvas.value.style.left = left + 'px'
  canvas.value.style.top = top + 'px'
  ctx = canvas.value.getContext('2d')
  ctx.scale(dpr, dpr)

  if (nodes.length === 0) {
    nodes = createNodes(w, h)
  }
}

function onMouseMove(e) {
  if (!heroEl || !homeEl) return
  const heroRect = heroEl.getBoundingClientRect()
  targetMouse.x = e.clientX - heroRect.left
  targetMouse.y = e.clientY - heroRect.top
}

function onMouseLeave() {
  targetMouse.x = -999
  targetMouse.y = -999
}

function animate() {
  if (!ctx || !canvas.value || !heroEl) return
  const w = heroEl.getBoundingClientRect().width
  const h = heroEl.getBoundingClientRect().height
  const color = getColor()

  mouse.x += (targetMouse.x - mouse.x) * 0.08
  mouse.y += (targetMouse.y - mouse.y) * 0.08

  ctx.clearRect(0, 0, w, h)

  for (const n of nodes) {
    n.vx += (Math.random() - 0.5) * 0.04
    n.vy += (Math.random() - 0.5) * 0.04
    n.vx *= 0.98
    n.vy *= 0.98

    const dx = mouse.x - n.x
    const dy = mouse.y - n.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < CONFIG.mouseRadius && mouse.x > 0) {
      const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce
      n.vx += dx * force
      n.vy += dy * force
    }

    n.x += n.vx
    n.y += n.vy

    if (n.x < 0) { n.x = 0; n.vx *= -0.5 }
    if (n.x > w) { n.x = w; n.vx *= -0.5 }
    if (n.y < 0) { n.y = 0; n.vy *= -0.5 }
    if (n.y > h) { n.y = h; n.vy *= -0.5 }

    ctx.beginPath()
    ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.globalAlpha = CONFIG.nodeOpacity
    ctx.fill()
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CONFIG.connectDist) {
        const alpha = (1 - dist / CONFIG.connectDist) * CONFIG.lineOpacity
        ctx.beginPath()
        ctx.moveTo(nodes[i].x, nodes[i].y)
        ctx.lineTo(nodes[j].x, nodes[j].y)
        ctx.strokeStyle = color
        ctx.lineWidth = CONFIG.lineWidth
        ctx.globalAlpha = alpha
        ctx.stroke()
      }
    }
  }

  ctx.globalAlpha = 1
  animId = requestAnimationFrame(animate)
}

let resizeObserver = null

onMounted(() => {
  homeEl = canvas.value?.closest('.VPHome')
  heroEl = document.querySelector('.VPHero')
  if (!heroEl || !homeEl) return

  updateLayout()

  resizeObserver = new ResizeObserver(() => updateLayout())
  resizeObserver.observe(heroEl)
  resizeObserver.observe(homeEl)

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('resize', updateLayout)

  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', updateLayout)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseleave', onMouseLeave)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>
