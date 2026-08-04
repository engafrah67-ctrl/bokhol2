import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { width: 100, height: 33 },
  md: { width: 140, height: 46 },
  lg: { width: 200, height: 66 },
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const { width, height } = SIZES[size]
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src="/logo.png"
        alt="FishMarketCap Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  )
}
