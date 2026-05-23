
import { cn } from '@/lib/utils'; 
type SkeletonProps = {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
};

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  animate = true,
}: SkeletonProps) {
  const baseStyle = 'bg-gray-200';
  const animation = animate ? 'animate-pulse' : '';

  const variants: Record<string, string> = {
    text: 'h-4 w-full rounded',         // chiều cao dòng, width mặc định full
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  // Với variant text, mặc định chiều cao 1rem, nếu không truyền height
  if (variant === 'text' && !height) style.height = '1rem';

  return (
    <div
      className={cn(baseStyle, animation, variants[variant], className)}
      style={style}
    />
  );
}