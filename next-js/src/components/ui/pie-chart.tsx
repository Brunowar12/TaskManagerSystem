'use client'

import { useEffect, useRef } from 'react'

interface PieChartProps {
  data: Array<{
    value: number;
    color: string;
  }>;
  size?: number;
}

export function PieChart({ data, size = 128 }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Draw pie chart
    let startAngle = -Math.PI / 2 // Start from top
    data.forEach(({ value, color }) => {
      const sliceAngle = (2 * Math.PI * value) / total

      ctx.beginPath()
      ctx.moveTo(size / 2, size / 2)
      ctx.arc(size / 2, size / 2, size / 2, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = color
      ctx.fill()

      startAngle += sliceAngle
    })
  }, [data, size])

  return <canvas ref={canvasRef} width={size} height={size} />
}

