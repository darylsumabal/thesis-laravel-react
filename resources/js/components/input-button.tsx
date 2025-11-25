import { MinusIcon, PlusIcon } from 'lucide-react';
import { Button, Group, Input, Label, NumberField } from 'react-aria-components';

const InputWithEndButton = ({ field, item, hasMatch, pendingSubmitScore }) => {
    return (
        <NumberField
            // value={field.value === undefined ? null : field.value}
            value={field.value ?? ''}
            onChange={(val) => {
                const value = val ?? 0;
                // For buttons: enforce min/max
                const clamped = Math.max(0, Math.min(value, item.score));
                field.onChange(clamped);
            }}
            onBlur={field.onBlur}
            name={field.name}
            isRequired
            minValue={0}
            maxValue={item.score}
            isDisabled={hasMatch || pendingSubmitScore}
            className="w-full space-y-2"
        >
            <Label />
            <Group className="dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm">
                <Input
                    value={field.value ?? ''} // typed input controlled
                    onChange={(e) => {
                        const typed = e.target.value;

                        // Ignore empty string, allow user to type
                        if (typed === '') {
                            field.onChange('');
                            return;
                        }

                        // Only accept numbers <= max
                        const value = Number(typed);
                        if (isNaN(value)) return;
                        if (value > item.score) return;

                        field.onChange(value);
                    }}
                    className="w-full grow px-3 py-2 text-center outline-none"
                />
                <Button
                    slot="decrement"
                    className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <MinusIcon className="size-4" />
                    <span className="sr-only">Decrement</span>
                </Button>

                <Button
                    slot="increment"
                    className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <PlusIcon className="size-4" />
                    <span className="sr-only">Increment</span>
                </Button>
            </Group>
        </NumberField>
    );
};

export default InputWithEndButton;
