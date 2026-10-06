import { defineConfig, withBase } from 'vitepress'
import { set_sidebar } from './utils/auto_sidebar.js'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
  title: '初中学习助手',
  description: '体系化备战浙江中考 · 八门学科 · 考点地图 · 真题套路',
  lang: 'zh-CN',
  base: '/junior-high-study/',

  head: [
    ['link', { rel: 'icon', href: withBase('/favicon.svg') }],
  ],

  themeConfig: {
    nav: [
      { text: '数学', link: '/math/', activeMatch: '/math/' },
      { text: '物理', link: '/physics/', activeMatch: '/physics/' },
      { text: '化学', link: '/chemistry/', activeMatch: '/chemistry/' },
      { text: '语文', link: '/chinese/', activeMatch: '/chinese/' },
      { text: '英语', link: '/english/', activeMatch: '/english/' },
      { text: '历史', link: '/history/', activeMatch: '/history/' },
      { text: '生物', link: '/biology/', activeMatch: '/biology/' },
      { text: '地理', link: '/geography/', activeMatch: '/geography/' },
    ],

    sidebar: {
      '/math/':      set_sidebar('math'),
      '/physics/':   set_sidebar('physics'),
      '/chemistry/': set_sidebar('chemistry'),
      '/chinese/':   set_sidebar('chinese'),
      '/english/':   set_sidebar('english'),
      '/history/':   set_sidebar('history'),
      '/biology/':   set_sidebar('biology'),
      '/geography/': set_sidebar('geography'),
    },

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除',
            backButtonTitle: '返回',
            noResultsText: '无结果',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    docFooter: { prev: '上一章', next: '下一章' },

    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'medium' } },
  },

  ignoreDeadLinks: true,

  markdown: {
    lineNumbers: false,
    theme: { light: 'github-light', dark: 'github-dark' },
    config: (md) => {
      // 数学公式渲染：支持 $...$（行内）与 $$...$$（块级）
      md.use(mathjax3)
    },
  },
})
