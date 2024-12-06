'use client'

import { useEffect, useRef } from 'react'

export default function SnowfallBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const snowflakes: Snowflake[] = []
    const snowflakeCount = 100

    class Snowflake {
      x: number
      y: number
      size: number
      speed: number
      angle: number
      spin: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speed = Math.random() * 1 + 0.5
        this.angle = Math.random() * Math.PI * 2
        this.spin = Math.random() * 0.2 - 0.1
      }

      update() {
        this.y += this.speed
        this.x += Math.sin(this.angle) * 0.5
        this.angle += this.spin

        if (this.y > canvas.height) {
          this.y = 0
          this.x = Math.random() * canvas.width
        }
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fill()
      }
    }

    function createSnowflakes() {
      for (let i = 0; i < snowflakeCount; i++) {
        snowflakes.push(new Snowflake())
      }
    }

    function animateSnowflakes() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      snowflakes.forEach((snowflake) => {
        snowflake.update()
        snowflake.draw()
      })
      requestAnimationFrame(animateSnowflakes)
    }

    createSnowflakes()
    animateSnowflakes()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" />
}

