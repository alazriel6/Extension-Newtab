import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { getIcon } from './weatherUtils'

export default function AnimatedWeatherIcon({ code, isDay }) {
  const iconPath = getIcon(code, isDay)
  const [displayIcon, setDisplayIcon] = useState(iconPath)

  useEffect(() => {
    if (iconPath !== displayIcon) {
      const timeout = setTimeout(() => setDisplayIcon(iconPath), 300)
      return () => clearTimeout(timeout)
    }
  }, [iconPath, displayIcon])

  return (
    <motion.div
      className="relative flex justify-center items-center"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.img
        src={displayIcon}
        alt={code}
        className="h-30 object-contain drop-shadow-lg select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
