import React from 'react'
import { getGlowColor } from './weatherUtils'

export default function WeatherGlow({ code, isDay }) {
  return (
    <div
      className="absolute -z-10 w-32 h-32 md:w-40 md:h-40 rounded-full blur-2xl opacity-60"
      style={{
        background: getGlowColor(code, isDay),
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(40px)',
        mixBlendMode: 'soft-light',
      }}
    />
  )
}
