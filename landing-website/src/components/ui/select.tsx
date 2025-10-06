import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps {
    className?: string
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    children?: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, value, onValueChange, placeholder, children, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    className
                )}
                ref={ref}
                value={value}
                onChange={(e) => onValueChange?.(e.target.value)}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {children}
            </select>
        )
    }
)
Select.displayName = "Select"

export { Select }