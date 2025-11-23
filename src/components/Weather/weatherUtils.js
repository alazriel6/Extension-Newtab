export function getGlowColor(symbol, isDay) {
  const gradients = {
    snow: 'rgba(224,247,255,0.4), rgba(128,223,255,0.2)',
    rain: 'rgba(108,183,255,0.4), rgba(63,155,255,0.2)',
    thunder: 'rgba(255,230,109,0.5), rgba(255,175,64,0.2)',
    cloudy: 'rgba(179,229,252,0.4), rgba(144,202,249,0.2)',
  }
  const base = Object.entries(gradients).find(([k]) => symbol.includes(k))
  if (base) return `radial-gradient(circle, ${base[1]}, transparent)`

  return isDay
    ? 'radial-gradient(circle, rgba(255,241,118,0.5), rgba(255,202,40,0.2), transparent)'
    : 'radial-gradient(circle, rgba(166,120,255,0.5), rgba(93,63,211,0.2), transparent)'
}

export function getDescription(symbol) {
  const desc = {
    clearsky: 'Clear sky',
    fair: 'Fair',
    partlycloudy: 'Partly cloudy',
    cloudy: 'Cloudy',
    rainshowers: 'Rain showers',
    rain: 'Rain',
    snow: 'Snow',
    fog: 'Fog',
    thunder: 'Thunderstorm',
  }
  return Object.entries(desc).find(([k]) => symbol.includes(k))?.[1] || 'Unknown'
}

export function getIcon(symbol, isDay) {
  const map = {
    clearsky: 'clearsky',
    fair: 'fair',
    partlycloudy: 'partlycloudy',
    cloudy: 'cloudy',
    rainshowers: 'rainshowers',
    rain: 'rain',
  }

  const key = Object.keys(map).find((k) => symbol.includes(k))
  if (key) return `/weather-icon/${map[key]}_${isDay ? 'day' : 'night'}.png`

  if (symbol.includes('snow')) return '/weather-icon/snow.png'
  if (symbol.includes('fog')) return '/weather-icon/fog.png'
  if (symbol.includes('thunder')) return '/weather-icon/thunder.png'
  return '/weather-icon/default.png'
}
