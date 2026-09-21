import { useState } from 'react'
import { cn } from '@/lib/cn'

interface AvatarProps {
  name: string
  src?: string
  size?: number
  className?: string
}

export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-gradient font-medium text-white',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  )
}
