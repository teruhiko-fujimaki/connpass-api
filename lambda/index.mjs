const TOKEN = process.env.CONNPASS_API_TOKEN

export const handler = async (event) => {
  const qs = event.rawQueryString || ''
  const url = `https://connpass.com/api/v2/events/${qs ? '?' + qs : ''}`

  const res = await fetch(url, {
    headers: {
      'X-API-Key': TOKEN,
      'Accept': 'application/json',
    },
  })

  const data = await res.json()

  return {
    statusCode: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  }
}
