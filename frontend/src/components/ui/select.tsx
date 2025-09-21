"use client"

import { Fragment } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  emptyMessage?: string
}

export default function Select({ value, onChange, options, placeholder = "Select", className, disabled, emptyMessage }: SelectProps) {
  const activeOption = options.find((option) => option.value === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className={cn("relative", className)}>
          <Listbox.Button
            className={
              cn(
                "group relative w-full cursor-pointer rounded-2xl card-enhanced2 px-4 py-3 text-left text-sm font-medium text-foreground shadow-lg shadow-black/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                disabled && "cursor-not-allowed opacity-60",
              )
            }
          >
            <span className="block truncate">
              {activeOption ? (
                <span className="flex items-center gap-2">
                  <span className="truncate">{activeOption.label}</span>
                  {activeOption.description && (
                    <span className="text-xs font-normal text-muted-foreground">{activeOption.description}</span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground transition group-hover:text-foreground">
              <ChevronUpDownIcon className="h-4 w-4" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-1.5 shadow-xl shadow-black/10 backdrop-blur-md focus:outline-none">
              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {emptyMessage || "No options available"}
                </div>
              )}

              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, disabled: optionDisabled }) =>
                    cn(
                      "relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      optionDisabled && "cursor-not-allowed opacity-50",
                      active && !optionDisabled ? "bg-primary/15 text-primary" : "text-foreground",
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex-1 truncate">
                        <span className={cn("truncate", selected ? "font-semibold" : "font-medium")}>{option.label}</span>
                        {option.description && (
                          <p className="text-xs text-muted-foreground/80">{option.description}</p>
                        )}
                      </div>
                      {selected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}

