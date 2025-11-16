
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
import { Input } from "./input"

type ComboboxProps = {
    options: { value: string; label: string }[];
    placeholder: string;
    searchPlaceholder: string;
    onSelect: (value: string) => void;
    value?: string;
    disabled?: boolean;
    id?: string;
}

export function Combobox({ options, placeholder, searchPlaceholder, onSelect, value, disabled = false, id }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  
  const handleSelect = (currentValue: string) => {
    const selectedOption = options.find(opt => opt.value.toLowerCase() === currentValue.toLowerCase());
    const finalValue = selectedOption ? selectedOption.value : currentValue;
    onSelect(finalValue);
    setOpen(false);
  };

  const displayValue = options.find(option => option.value === value)?.label || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
        >
            <span className="truncate">
                {value ? displayValue : placeholder}
            </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command filter={(value, search) => {
            const option = options.find(o => o.value === value);
            if (option?.label.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
        }}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            onValueChange={(search) => {
                // To allow custom values, we call onSelect when the input changes.
                // This is debounced in a real scenario, but for now it's direct.
                onSelect(search);
            }}
            />
          <CommandList>
            <CommandEmpty>
                <button
                    type="button"
                    className="w-full text-left p-2 text-sm"
                    onClick={() => {
                        // The value is already set by onValueChange, just close.
                        setOpen(false);
                    }}
                >
                    Gunakan nilai: &quot;{value}&quot;
                </button>
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    handleSelect(option.value);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
           </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
