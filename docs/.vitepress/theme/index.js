import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import ParticleBackground from './ParticleBackground.vue'
import FunctionGraph from './FunctionGraph.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('FunctionGraph', FunctionGraph)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => h(ParticleBackground),
    })
  },
}
