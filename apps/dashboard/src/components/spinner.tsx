import { cn } from '@repo/lib';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader } from 'lucide-react';
import * as React from 'react';

export const variants = {
  variant: {
    default: 'text-accent-foreground',
    primary: 'text-primary-foreground',
  },
  size: {
    default: 'size-8',
    sm: 'size-4',
    lg: 'size-12',
  },
};

const spinnerVariants = cva('grid place-items-center animate-spin', {
  variants,
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface SpinnerProps
  extends React.ButtonHTMLAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  className?: string;
}

export default function Spinner({
  className,
  variant,
  size,
  ...props
}: SpinnerProps) {
  return (
    <>
      <Loader
        aria-label='loading'
        aria-busy='true'
        className={cn(spinnerVariants({ className, variant, size }), className)}
        {...props}
      />
      <span className='sr-only'>Loading...</span>
    </>
  );
}
