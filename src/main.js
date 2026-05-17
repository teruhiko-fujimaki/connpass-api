import { fetchRecruitingEvents } from './connpass.js'
import { initMap, renderDots, clearDots } from './map.js'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const statusEl   = document.getElementById('status')
const statusText = document.getElementById('status-text')
const countBadge = document.getElementById('count-badge')
const errorBox   = document.getElementById('error-box')
const prefSelect = document.getElementById('pref-select')

let map = null
let loading = false

function setStatus(text) {
  statusText.textContent = text
  statusEl.classList.remove('hidden')
}

function hideStatus() {
  statusEl.classList.add('hidden')
}

function showError(msg) {
  errorBox.textContent = msg
  errorBox.style.display = 'block'
  hideStatus()
}

function clearError() {
  errorBox.style.display = 'none'
}

async function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return }
    const script = document.createElement('script')
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&language=ja&region=JP`
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Google Maps の読み込みに失敗しました'))
    document.head.appendChild(script)
  })
}

async function loadEvents(prefecture) {
  if (loading) return
  loading = true
  prefSelect.disabled = true
  clearError()

  try {
    const label = prefSelect.options[prefSelect.selectedIndex].text
    setStatus(`${label} のイベントを取得中...`)

    const events = await fetchRecruitingEvents((fetched) => {
      setStatus(`イベント取得中... ${fetched} 件`)
    }, prefecture)

    const mappable = events.filter(e => e.lat && e.lon)

    clearDots()
    setStatus('地図に描画中...')
    renderDots(map, mappable)

    countBadge.textContent = `募集中: ${mappable.length} 件`
    setStatus('読み込み完了')
    setTimeout(hideStatus, 2000)

  } catch (err) {
    console.error(err)
    showError('エラー: ' + err.message)
    countBadge.textContent = 'エラー'
  } finally {
    loading = false
    prefSelect.disabled = false
  }
}

async function main() {
  try {
    setStatus('Google Maps を読み込み中...')
    await loadGoogleMaps()

    setStatus('地図を初期化中...')
    map = initMap('map')

    await loadEvents('osaka')

    prefSelect.addEventListener('change', () => {
      loadEvents(prefSelect.value)
    })

  } catch (err) {
    console.error(err)
    showError('エラー: ' + err.message)
    countBadge.textContent = 'エラー'
  }
}

main()
