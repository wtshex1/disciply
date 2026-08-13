import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox'] })
const p = await b.newPage({ viewport: { width: 500, height: 950 } })
await p.goto('http://localhost:1420', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
const data = await p.evaluate(() => {
  const nav = document.querySelector('.bottom-nav')
  const nr = nav.getBoundingClientRect()
  const btns = [...nav.querySelectorAll('button')].map(btn => {
    const r = btn.getBoundingClientRect()
    const svg = btn.querySelector('svg').getBoundingClientRect()
    const span = btn.querySelector('span').getBoundingClientRect()
    return {
      btn: { x: r.x, w: r.width, cx: r.x + r.width / 2 },
      svgCx: svg.x + svg.width / 2,
      spanCx: span.x + span.width / 2,
      offX: Math.round((svg.x + svg.width / 2) - (r.x + r.width / 2)),
      btnCss: getComputedStyle(btn).padding, btnF: getComputedStyle(btn).flex
    }
  })
  return {
    nav: { x: nr.x, w: nr.width, cssPosition: getComputedStyle(nav).position, navJc: getComputedStyle(nav).justifyContent, navH: nr.height },
    btns
  }
})
console.log(JSON.stringify(data, null, 2))
await b.close()
