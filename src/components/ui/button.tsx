"use client"

import React from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
  const variants: Record<string, string> = {
    default: 'bg-green-600 text-white hover:bg-green-700 px-4 py-2',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 px-3 py-2',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900 px-4 py-2',
  }

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  )
}