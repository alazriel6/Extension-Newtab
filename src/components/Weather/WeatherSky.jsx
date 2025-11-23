function Sky({ src, overlay, overlay2 }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl border-3 border-black/50 drop-shadow-lg">
      <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${src})` }} />
      {overlay && <Overlay src={overlay} />}
      {overlay2 && <Overlay src={overlay2} />}
    </div>
  )
}

function Overlay({ src }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'repeat',
        mixBlendMode: 'overlay',
        opacity: 0.6,
      }}
    />
  )
}

const DaySky = () => <Sky src="/weather-icon/Day_Sky.png" />
const NightSky = () => <Sky src="/weather-icon/Night_Sky1.png" />
const RainSky = () => <Sky src="/weather-icon/Rain_Sky.png" overlay="/weather-icon/rain_overlay2.gif" />
const ThunderSky = () => (
  <Sky
    src="/weather-icon/Thunder_Sky.jpg"
    overlay="/weather-icon/Thunder_overlay4.gif"
    overlay2="/weather-icon/rain_overlay1.gif"
  />
)

export default function WeatherSky({ code, isDay }) {
  if (!code) return isDay ? <DaySky /> : <NightSky />
  if (code.includes('rain')) return <RainSky />
  if (code.includes('thunder')) return <ThunderSky />
  return isDay ? <DaySky /> : <NightSky />
}
