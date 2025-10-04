import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'modal'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const baseClasses = "flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"

    const variantClasses = {
      default: "card-enhanced2 placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-primary/20 hover:border-input/50",
      modal: "bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 hover:border-gray-500"
    }

    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }