import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectOptionType {
  label: string
  value: string
}

export interface SelectProps {
  className?: string
  value?: string
  onValueChange?: (value: string) => void
  onChange?: (value: string) => void
  placeholder?: string
  children?: React.ReactNode
  options?: SelectOptionType[]
  variant?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, value, onValueChange, onChange, placeholder, children, options, variant, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value
      onValueChange?.(newValue)
      onChange?.(newValue)
    }

    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={value}
        onChange={handleChange}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

// SelectOption component for better structure
export interface SelectOptionProps {
  value: string
  children: React.ReactNode
}

const SelectOption: React.FC<SelectOptionProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>
}

// Type alias for backward compatibility
export type SelectOption = SelectOptionType

export { Select, SelectOption }
export default Select