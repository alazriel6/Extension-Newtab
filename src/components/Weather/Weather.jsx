import React, { useState } from 'react'
import { useWeather } from '../../hooks/useWeather'
import WeatherUI from './WeatherUI'

export default function Weather() {
  const { weather, loading, error, isDay, location, setAndSaveLocation } = useWeather()
  const [input, setInput] = useState('')

  const handleSaveLocation = async () => {
    if (!input.trim()) return
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`
      const res = await fetch(url)
      const data = await res.json()
      if (!data.length) return alert('City not found')

      const { lat, lon, display_name } = data[0]
      setAndSaveLocation({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: display_name,
      })
      setInput('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <WeatherUI
      weather={weather}
      loading={loading}
      error={error}
      isDay={isDay}
      location={location}
      input={input}
      setInput={setInput}
      handleSaveLocation={handleSaveLocation}
    />
  )
}
