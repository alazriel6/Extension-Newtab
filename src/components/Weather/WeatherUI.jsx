import { motion } from 'framer-motion'
import AnimatedWeatherIcon from './WeatherIcon'
import WeatherSky from './WeatherSky'
import WeatherGlow from './WeatherGlow'

export default function WeatherUI({
  weather,
  loading,
  error,
  isDay,
  location,
  input,
  setInput,
  handleSaveLocation,
}) {
  return (
    <div className="relative flex justify-center items-center min-h-[420px] overflow-hidden">
      <WeatherSky code={weather?.code} isDay={isDay} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-4 w-[320px] p-6 rounded-3xl text-white"
      >
        <div className="flex items-center gap-2 w-full ">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter city..."
            className="flex-1 px-3 py-2 text-sm bg-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-950 transition placeholder:text-white/90"
            style={{
              textShadow: `0 0 2px rgba(0,0,0,0.9),0 0 5px rgba(0,0,0,0.9),0 3px 5px rgba(0,0,0,0.9)`,
            }}
          />
          <button
            onClick={handleSaveLocation}
            className="px-3 py-2 rounded-xl bg-red-900 hover:bg-cyan-700 text-sm font-medium transition"
          >
            Save
          </button>
        </div>

        {loading && <p className="text-xs text-gray-200 animate-pulse">Loading weather...</p>}
        {error && <p className="text-xs text-red-300">{error}</p>}

        {weather && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative flex flex-col items-center text-center"
          >
            <WeatherGlow code={weather.code} isDay={isDay} />
            <AnimatedWeatherIcon code={weather.code} isDay={isDay} />

            {(() => {
              // --- Robust detection of "wet" weather (rain, shower, thunder, storm, drizzle)
              const wetCodesNumeric = new Set([
                // contoh kode umum — sesuaikan jika API-mu pakai angka lain
                176, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359, 386, 389,
                // tambahan kode populer dari berbagai API
                266, 263, 296, 302, 311, 314, 353, 356, 365, 374, 377, 386, 389
              ])

              // ambil code sebagai number bila bisa
              const rawCode = weather?.code
              const codeNum = typeof rawCode === 'number' ? rawCode : Number(rawCode)
              const codeIsWet = !Number.isNaN(codeNum) && wetCodesNumeric.has(codeNum)

              // cek deskripsi (beberapa API pakai .desc / .description / .condition.text)
              const rawDesc =
                (weather && (weather.desc || weather.description || weather.condition || weather.text)) || ''
              const desc = String(rawDesc).toLowerCase()

              // regex untuk menangkap rain / shower / thunder / storm / drizzle / sleet / hail
              const wetRegex = /\b(rain|shower|drizzle|thunder|storm|sleet|hail|showers)\b/i
              const descIsWet = wetRegex.test(desc)

              // final: wet jika kode cocok atau deskripsi cocok
              const isWet = codeIsWet || descIsWet

              // Tentukan warna: jika malam atau kondisi basah => putih, selainnya hitam
              const useWhiteText = (!isDay) || isWet

              const textColor = useWhiteText ? 'text-white' : 'text-black'
              const shadowColor = useWhiteText
                ? '0 0 2px rgba(0,0,0,0.9), 0 3px 5px rgba(0,0,0,0.9)'
                : '0 0 5px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.7), 0 3px 5px rgba(255,255,255,0.9)'

              // debugging quick-check (hapus/comment kalau sudah ok)
              // console.log({ rawCode, codeNum, codeIsWet, rawDesc, descIsWet, isWet, isDay, useWhiteText })

              return (
                <>
                  <div
                    className={`text-5xl font-bold mt-2 ${textColor}`}
                    style={{ textShadow: shadowColor }}
                  >
                    {Math.round(weather.temp)}°C
                  </div>
                  <p
                    className={`opacity-100  ${textColor}`}
                    style={{ textShadow: shadowColor }}
                  >
                    {weather.desc}
                  </p>
                  <p
                    className={`text-xs opacity-100  mt-1 ${textColor}`}
                    style={{ textShadow: shadowColor }}
                  >
                    Updated:{' '}
                    {weather.updated.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </p>

                  {location?.name && (
                    <div
                      className={`opacity-100  mt-2 flex flex-col items-center ${textColor}`}
                      style={{ textShadow: shadowColor }}
                    >
                      <span>{location.name}</span>
                      {weather?.localTime && (
                        <span
                          className="text-[11px] opacity-100 mt-1"
                          style={{ textShadow: shadowColor }}
                        >
                          Local time: {weather.localTime}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
