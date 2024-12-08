'use client'

import { useEffect, useRef } from 'react'
import { Card } from "@/components/ui/card"

interface CashBalanceGaugeProps {
  current: number
  projected: number
  minimum: number
}

export function CashBalanceGauge({ current, projected, minimum }: CashBalanceGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size based on container
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.width = canvas.offsetWidth
    canvas.height = 200

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const centerX = canvas.width / 2
    const centerY = canvas.height - 40
    const radius = Math.min(centerX, centerY) - 20

    // Draw gauge background
    const startAngle = Math.PI
    const endAngle = 2 * Math.PI
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.lineWidth = 20
    ctx.strokeStyle = '#e5e7eb'
    ctx.stroke()

    // Calculate percentages
    const maxValue = Math.max(current, projected, minimum * 2)
    const currentPercent = (current / maxValue) * Math.PI + Math.PI
    const projectedPercent = (projected / maxValue) * Math.PI + Math.PI
    const minimumPercent = (minimum / maxValue) * Math.PI + Math.PI

    // Draw minimum line first (red)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, minimumPercent)
    ctx.lineWidth = 20
    ctx.strokeStyle = '#f87171'
    ctx.stroke()

    // Draw current balance over minimum (green)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, currentPercent)
    ctx.lineWidth = 20
    ctx.strokeStyle = '#4ade80'
    ctx.stroke()

    // Draw projected line on top (blue)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 25, startAngle, projectedPercent)
    ctx.lineWidth = 10
    ctx.strokeStyle = '#60a5fa'
    ctx.stroke()

    // Add minimum marker
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, minimumPercent - 0.1, minimumPercent + 0.1)
    ctx.lineWidth = 25
    ctx.strokeStyle = '#f87171'
    ctx.stroke()

    // Add labels with better positioning
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'

    // Current balance
    ctx.font = '14px Inter'
    ctx.fillText('Current', centerX, centerY - 60)
    ctx.font = 'bold 20px Inter'
    ctx.fillText(`$${current.toLocaleString()}`, centerX, centerY - 35)

    // Projected balance
    ctx.font = '14px Inter'
    ctx.fillText('Projected', centerX - radius + 60, centerY + 40)
    ctx.font = 'bold 16px Inter'
    ctx.fillText(`$${projected.toLocaleString()}`, centerX - radius + 60, centerY + 60)

    // Minimum required
    ctx.font = '14px Inter'
    ctx.fillText('Minimum', centerX + radius - 60, centerY + 40)
    ctx.font = 'bold 16px Inter'
    ctx.fillText(`$${minimum.toLocaleString()}`, centerX + radius - 60, centerY + 60)

  }, [current, projected, minimum])

  return (
    <div className="flex gap-8">
      <div className="flex-1 h-[200px] flex items-center justify-center">
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      <div className="w-[200px] space-y-4 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
            <span className="text-sm">Current Balance: ${current.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
            <span className="text-sm">Projected Balance: ${projected.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
            <span className="text-sm">Minimum Required: ${minimum.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            The gauge shows your current cash position (green) relative to your minimum required balance (red). 
            The blue line indicates your projected balance based on forecasted cash flows.
          </p>
        </div>
      </div>
    </div>
  )
} 