let infoWindow = null
const drawnMarkers = []

export function clearDots() {
  for (const m of drawnMarkers) m.setMap(null)
  drawnMarkers.length = 0
  infoWindow?.close()
}

export function initMap(containerId) {
  const map = new google.maps.Map(document.getElementById(containerId), {
    center: { lat: 34.7, lng: 135.5 },
    zoom: 10,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
  })

  infoWindow = new google.maps.InfoWindow()
  return map
}

/**
 * Draw one flag marker per event at the event's own lat/lon.
 */
export function renderDots(map, events) {
  const icon = makeFlagIcon()

  for (const event of events) {
    const lat = parseFloat(event.lat)
    const lng = parseFloat(event.lon)
    if (isNaN(lat) || isNaN(lng)) continue

    const marker = new google.maps.Marker({
      map,
      position: { lat, lng },
      icon,
      title: event.title,
    })

    drawnMarkers.push(marker)

    marker.addListener('click', () => {
      const area = extractArea(event.address || event.place || '')
      infoWindow.setContent(`
        <div style="font-size:13px;line-height:1.7;max-width:260px">
          <div style="font-weight:bold;margin-bottom:4px">${escHtml(event.title)}</div>
          <div style="color:#555;font-size:12px">${escHtml(area)}</div>
          ${event.url
            ? `<a href="${escHtml(event.url)}" target="_blank"
                  style="font-size:12px;color:#1a73e8">connpass で見る →</a>`
            : ''}
        </div>`)
      infoWindow.open(map, marker)
    })
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFlagIcon() {
  // SVG: vertical pole + triangular flag
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="32" viewBox="0 0 22 32">
      <!-- pole -->
      <line x1="5" y1="2" x2="5" y2="31" stroke="#555" stroke-width="2" stroke-linecap="round"/>
      <!-- flag -->
      <polygon points="5,2 21,9 5,16" fill="#E53935" opacity="0.9"/>
      <!-- base dot -->
      <circle cx="5" cy="31" r="2.5" fill="#555"/>
    </svg>`

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(22, 32),
    anchor: new google.maps.Point(5, 31),  // anchor at the base of the pole
  }
}

function extractArea(address) {
  if (!address) return '住所不明'
  const prefMatch = address.match(/^(.{2,4}?[都道府県])/)
  const pref = prefMatch ? prefMatch[1] : ''
  const rest = pref ? address.slice(pref.length) : address

  const cityWard = rest.match(/^([一-龥]{1,8}市[一-龥]{1,6}区)/)
  if (cityWard) return pref + cityWard[1]

  const ward = rest.match(/^([一-龥]{1,5}区)/)
  if (ward && ward[1].length <= 6) return pref + ward[1]

  const city = rest.match(/^([一-龥]{1,8}市)/)
  if (city) return pref + city[1]

  return pref || address.slice(0, 10)
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
