// 開発時: Vite プロキシ (/api/connpass)
// 本番時: Lambda Function URL (VITE_CONNPASS_PROXY_URL で指定)
const PROXY_URL = import.meta.env.VITE_CONNPASS_PROXY_URL || '/api/connpass'
const PAGE_SIZE = 100
const MAX_PAGES = 20   // 最大 2000 件まで取得

/**
 * Fetch all currently-recruiting events from connpass API v2.
 * Uses open_status=open to get only events with open registration.
 * Paginates until a page returns fewer results than PAGE_SIZE.
 */
export async function fetchRecruitingEvents(onProgress, prefecture = '') {
  const allEvents = []
  let start = 1

  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      count: PAGE_SIZE,
      start,
      order: 2,              // order by start date ascending
      open_status: 'open',   // currently accepting registrations only
    })
    if (prefecture) params.set('prefecture', prefecture)

    const res = await fetch(`${PROXY_URL}?${params}`, {
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`connpass API ${res.status}: ${text.slice(0, 120)}`)
    }

    const data = await res.json()
    const events = data.events ?? []

    allEvents.push(...events)
    onProgress?.(allEvents.length, allEvents.length)

    // results_available in v2 always equals count — use returned count to detect last page
    if (events.length < PAGE_SIZE) break

    start += PAGE_SIZE
    await sleep(200)
  }

  return allEvents
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
