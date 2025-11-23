import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type ComboboxData = {
  value: string;
  label: string;
};

type ComboboxProps = {
  onSelect?: (value: string) => void;
  values: string;
  data: ComboboxData[];
  submit?: boolean;
};

const ActionCombobox = ({ onSelect, values, data, submit }: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(values);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    onSelect?.(currentValue);
  };

  useEffect(() => {
    setValue("");
  }, [submit]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {/* {value
            ? data.find((items) => items.value === value)?.label
            : data[0]?.label} */}
          {value && value !== ""
            ? data.find((item) => item.label === value)?.label
            : "Select"}

          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        side="bottom"
        align="start"
        style={{ pointerEvents: "auto" }}
      >
        <Command>
          <CommandList>
            <CommandEmpty>No Item found.</CommandEmpty>
            <CommandGroup>
              {data?.map((item) => (
                <CommandItem
                  key={item.label}
                  value={item.label}
                  onSelect={() => handleSelect(item.value)}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ActionCombobox;
