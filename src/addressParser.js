/**
 * Japanese address → location label extraction.
 *
 * Priority:
 *   1. 市 + 区  (e.g. 横浜市中区)
 *   2. 〇〇区   (Tokyo special wards)
 *   3. 〇〇市
 *   4. 〇〇町/村 (short names only)
 */
export function extractLabel(address) {
  if (!address || typeof address !== 'string') return null

  const prefMatch = address.match(/^(.{2,4}?[都道府県])/)
  const pref = prefMatch ? prefMatch[1] : ''
  const rest = pref ? address.slice(pref.length) : address

  // 1. City + Ward  e.g. 横浜市中区
  const cityWardMatch = rest.match(/^([一-龥]{1,8}市[一-龥]{1,6}区)/)
  if (cityWardMatch) return cityWardMatch[1]

  // 2. Ward only  e.g. 渋谷区
  const wardMatch = rest.match(/^([一-龥]{1,5}区)/)
  if (wardMatch && wardMatch[1].length <= 6) return wardMatch[1]

  // 3. City  e.g. 大阪市
  const cityMatch = rest.match(/^([一-龥]{1,8}市)/)
  if (cityMatch) return cityMatch[1]

  // 4. Town / Village (short names only)
  const townMatch = rest.match(/^([一-龥]{1,5}[町村])/)
  if (townMatch) return townMatch[1]

  return null
}

/**
 * Aggregate events → Map<label, { count, lat, lng }>
 * Uses lat/lon provided directly by the connpass API response.
 */
export function aggregateByLocation(events) {
  const acc = new Map() // label → { count, latSum, lngSum }

  for (const event of events) {
    const address = event.address || event.place || ''
    const label = extractLabel(address)
    if (!label) continue

    const lat = parseFloat(event.lat)
    const lng = parseFloat(event.lon)
    if (isNaN(lat) || isNaN(lng)) continue

    if (acc.has(label)) {
      const entry = acc.get(label)
      entry.count++
      entry.latSum += lat
      entry.lngSum += lng
    } else {
      acc.set(label, { count: 1, latSum: lat, lngSum: lng })
    }
  }

  // Convert sums to averages
  const result = new Map()
  for (const [label, { count, latSum, lngSum }] of acc) {
    result.set(label, {
      count,
      lat: latSum / count,
      lng: lngSum / count,
    })
  }

  return result
}
