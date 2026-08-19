'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

interface SparklineChartProps {
  data: { date: string; value: number }[]
  color?: string
  height?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border px-3.5 py-2 rounded-sm shadow-md text-xs space-y-0.5 pointer-events-none">
        <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[8px]">{payload[0].payload.date}</p>
        <p className="text-foreground font-extrabold text-sm">€{Number(payload[0].value).toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export function SparklineChart({ data, color = 'currentColor', height = 180 }: SparklineChartProps) {
  return (
    <div style={{ width: '100%', height }} className="relative select-none text-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
          />
          {/* Main Line & Gradient Area */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#chartGradient)"
            dot={{ r: 0 }}
            activeDot={{ r: 4, strokeWidth: 1.5, stroke: 'var(--background)', fill: 'var(--foreground)' }}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
