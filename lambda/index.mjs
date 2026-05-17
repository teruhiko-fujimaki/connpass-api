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

  // CORS headers are handled by Lambda Function URL configuration
  return {
    statusCode: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }
}
