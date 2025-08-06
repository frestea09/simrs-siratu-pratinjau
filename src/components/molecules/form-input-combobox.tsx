
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "../ui/label"

type ComboboxItem = {
    value: string;
    label: string;
}

type FormInputComboboxProps = {
  id: string
  label: string
  placeholder: string
  searchPlaceholder: string
  notFoundMessage: string
  items: ComboboxItem[]
  containerClassName?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function FormInputCombobox({ 
    id, 
    label, 
    placeholder,
    searchPlaceholder,
    notFoundMessage,
    items, 
    containerClassName = "grid grid-cols-1 md:grid-cols-form-label gap-x-4 gap-y-2 items-center", 
    value, 
    onValueChange 
}: FormInputComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={containerClassName}>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? items.find((item) => item.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
                <CommandEmpty>{notFoundMessage}</CommandEmpty>
                <CommandGroup>
                {items.map((item) => (
                    <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                        onValueChange?.(currentValue === value ? "" : currentValue)
                        setOpen(false)
                    }}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {item.label}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
