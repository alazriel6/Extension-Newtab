import { useEffect, useState } from 'react'
import { getDescription, getIcon } from '../components/Weather/weatherUtils'

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDay, setIsDay] = useState(true)
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('weather_location')
    return saved ? JSON.parse(saved) : null
  })

  // Fungsi bantu: pilih zona waktu berdasarkan longitude
const getTimeZoneFromLon = (lon) => {
  const offset = Math.round(lon / 15) // ex: lon -75 ≈ offset -5
  const tz = `Etc/GMT${offset >= 0 ? `-${offset}` : `+${Math.abs(offset)}`}`
  return tz
}


  const fetchWeather = async (lat, lon) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'WeatherApp/1.0 (example@email.com)' } }
      )
      const data = await res.json()
      const series = data.properties?.timeseries ?? []
      if (!series.length) throw new Error('No forecast data')

      // Cari data terdekat dari waktu sekarang
      const now = new Date()
      const closest = series.reduce((prev, curr) => {
        return Math.abs(new Date(curr.time) - now) <
          Math.abs(new Date(prev.time) - now)
          ? curr
          : prev
      })

      const details = closest.data.instant.details
      const code =
        closest.data.next_1_hours?.summary?.symbol_code || 'clearsky_day'

      // ===== Waktu lokal fix dengan Intl.DateTimeFormat =====
      const timeZone = getTimeZoneFromLon(lon)

      const localTimeStr = new Intl.DateTimeFormat('id-ID', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now)

      // Ambil jam lokal numerik (untuk deteksi siang/malam)
      const localHour = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: '2-digit',
          hour12: false,
        }).format(now),
        10
      )
      const localIsDay = localHour >= 6 && localHour < 18
      setIsDay(localIsDay)

      // ======================================================

      setWeather({
        temp: details.air_temperature,
        code,
        desc: getDescription(code),
        icon: getIcon(code, localIsDay),
        updated: now,
        localTime: localTimeStr,
      })
    } catch (err) {
      console.error(err)
      setError('Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const setAndSaveLocation = (loc) => {
    setLocation(loc)
    localStorage.setItem('weather_location', JSON.stringify(loc))
    fetchWeather(loc.lat, loc.lon)
  }

  useEffect(() => {
    if (!location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAndSaveLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            name: 'My Location',
          })
        },
        () => {
          // Default: Jakarta
          setAndSaveLocation({ lat: -6.2, lon: 106.8, name: 'Jakarta' })
        }
      )
    } else {
      fetchWeather(location.lat, location.lon)
    }

    // Auto-refresh tiap 30 menit
    const interval = setInterval(() => {
      if (location) fetchWeather(location.lat, location.lon)
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [location])

  return { weather, loading, error, isDay, location, setAndSaveLocation }
}
