import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  emptyText?: string;
}

export const SearchableSelect = React.forwardRef<HTMLButtonElement, Props>(({
  options,
  value,
  onChange,
  placeholder = "Select...",
  emptyText = "No results found.",
}, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between glass border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <span className={cn("truncate", !value && "text-white/60")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-emerald-950 border-white/20 text-white" align="start">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search..." className="text-white" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={(currentValue) => {
                    const match = options.find(
                      (o) => o.toLowerCase() === currentValue.toLowerCase()
                    );
                    onChange(match ?? opt);
                    setOpen(false);
                  }}
                  className="text-white aria-selected:bg-white/10 aria-selected:text-white"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
SearchableSelect.displayName = "SearchableSelect";
