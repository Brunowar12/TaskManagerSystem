'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Logo() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className='flex items-center justify-center mb-12 animate-fade-in-down'>
      <div className='flex items-center gap-4'>
        <div className='relative w-16 h-16 animate-shimmer'>
          {!imageError ? (
            <Image
              src='/logo.png'
              alt='Plan My Day Logo'
              width={100}
              height={100}
              className='object-contain transition-transform duration-300 hover:scale-110'
              priority
              onError={() => setImageError(true)}
            />
          ) : (
            <div className='w-16 h-16 relative'>
              {/* Circle placeholder */}
              <div className='w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 shadow-lg'></div>

              {/* Firework burst */}
              <div className='absolute -top-2 -right-2 w-8 h-8'>
                <div className='absolute w-full h-full animate-ping'>
                  <div className='w-2 h-2 bg-yellow-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'></div>
                  <div className='w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-0'></div>
                  <div className='w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45'></div>
                  <div className='w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90'></div>
                  <div className='w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-135'></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <h1 className='text-4xl font-extrabold text-blue-800 dark:text-white text-shadow animate-shimmer'>
          PLAN MY DAY
        </h1>
      </div>
    </div>
  )
}
