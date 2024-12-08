'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Logo() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className='flex items-center justify-center mb-8'>
      <div className='flex items-center gap-4'>
        <motion.div
          className='relative w-120 h-100'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {!imageError ? (
            <Image
              src='/logo.png'
              alt='Plan My Day Logo'
              width={80}
              height={64}
              className='object-contain rounded-full'
              priority
              onError={() => setImageError(true)}
            />
          ) : (
            <div className='w-16 h-16 relative'>
              <div className='w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 shadow-lg'></div>

              <motion.div
                className='absolute -top-1 -right-1 w-8 h-8'
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <div className='w-2 h-2 bg-yellow-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'></div>
                <div className='w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-0'></div>
                <div className='w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45'></div>
                <div className='w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90'></div>
                <div className='w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-135'></div>
              </motion.div>
            </div>
          )}
        </motion.div>
        <h1 className='text-3xl font-extrabold text-blue-800 dark:text-white'>
          PLAN MY DAY
        </h1>
      </div>
    </div>
  )
}
