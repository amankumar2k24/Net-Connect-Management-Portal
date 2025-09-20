"use client"

import { Fragment } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function Select({ value, onChange, options, placeholder = "Select", className, disabled }: SelectProps) {
  const activeOption = options.find((option) => option.value === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className={cn("relative", className)}>
          <Listbox.Button
            className={cn(
              "group relative w-full cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <span className="block truncate">
              {activeOption ? activeOption.label : <span className="text-muted-foreground">{placeholder}</span>}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              <ChevronUpDownIcon className="h-4 w-4" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            show={open}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-border/80 bg-card p-1 shadow-xl ring-1 ring-border/60 focus:outline-none"
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    cn(
                      "relative flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition",
                      active ? "bg-primary/10 text-primary" : "text-foreground",
                    )
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span className={cn("truncate", selected ? "font-semibold" : "font-medium")}>{option.label}</span>
                      {selected ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : null}
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

