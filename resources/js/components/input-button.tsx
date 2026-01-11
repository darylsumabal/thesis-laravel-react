// import { MinusIcon, PlusIcon } from 'lucide-react';
// import { Button, Group, Input, NumberField } from 'react-aria-components';

// const InputWithEndButton = ({ field, item, hasMatch, pendingSubmitScore }) => {
//     return (
//         <NumberField
//             // value={field.value === undefined ? null : field.value}
//             value={field.value ?? 0}
//             onChange={(val) => {
//                 const value = val ?? 0;
//                 // For buttons: enforce min/max
//                 const clamped = Math.max(0, Math.min(value, item.score));
//                 field.onChange(clamped);
//             }}
//             onBlur={field.onBlur}
//             name={field.name}
//             isRequired
//             minValue={0}
//             maxValue={item.score}
//             isDisabled={hasMatch || pendingSubmitScore}
//             className="w-full space-y-2"
//         >
//             <Group className="dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm">
//                 <Input
//                     value={field.value ?? 0} // typed input controlled
//                     onChange={(e) => {
//                         const typed = e.target.value;

//                         // // Ignore empty string, allow user to type
//                         // if (typed === '') {
//                         //     field.onChange(0);
//                         //     return;
//                         // }

//                         // // Only accept numbers <= max
//                         // const value = Number(typed);
//                         // if (isNaN(value)) return;
//                         // if (value > item.score) return;

//                         // field.onChange(value);

//                         // 🚫 Prevent empty value (backspace zero)
//                         if (typed === '') {
//                             field.onChange(0);
//                             return;
//                         }

//                         const value = Number(typed);

//                         // Ignore non-numbers
//                         if (Number.isNaN(value)) return;

//                         // Enforce max
//                         if (value > item.score) return;

//                         field.onChange(value);
//                     }}
//                     className="w-full grow px-3 py-2 text-center outline-none"
//                 />
//                 <Button
//                     slot="decrement"
//                     className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                     <MinusIcon className="size-4" />
//                     <span className="sr-only">Decrement</span>
//                 </Button>

//                 <Button
//                     slot="increment"
//                     className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                     <PlusIcon className="size-4" />
//                     <span className="sr-only">Increment</span>
//                 </Button>
//             </Group>
//         </NumberField>
//     );
// };

// export default InputWithEndButton;

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Button, Group, Input, NumberField } from 'react-aria-components';

const InputWithEndButton = ({ field, item, hasMatch, pendingSubmitScore }) => {
    return (
        // <NumberField
        //     value={field.value ?? 0}
        //     onChange={(val) => {
        //         // react-aria sends number | null
        //         if (val == null) {
        //             field.onChange(0);
        //             return;
        //         }

        //         const clamped = Math.max(0, Math.min(val, item.score));
        //         field.onChange(clamped);
        //     }}
        //     minValue={0}
        //     maxValue={item.score}
        //     isDisabled={hasMatch || pendingSubmitScore}
        //     className="w-full space-y-2"
        // >
        //     <Group className="dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm">
        //         <Input
        //             value={field.value ?? 0}
        //             onChange={(e) => {
        //                 const typed = e.target.value;

        //                 // 🚫 Do not allow empty
        //                 if (typed === '') {
        //                     field.onChange(0);
        //                     return;
        //                 }

        //                 // Allow digits only
        //                 if (!/^\d+$/.test(typed)) return;

        //                 const value = Number(typed);

        //                 if (value > item.score) return;

        //                 field.onChange(value);
        //             }}
        //             onKeyDown={(e) => {
        //                 // Optional hard block: Backspace on 0
        //                 if (e.key === 'Backspace' && field.value === 0) {
        //                     e.preventDefault();
        //                 }
        //             }}
        //             // className="w-full grow px-3 py-2 text-center outline-none"
        //             className='selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none'
        //         />

        //          <Button
        //             slot="decrement"
        //             className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        //         >
        //             <MinusIcon className="size-4" />
        //             <span className="sr-only">Decrement</span>
        //         </Button>

        //         <Button
        //             slot="increment"
        //             className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-md border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        //         >
        //             <PlusIcon className="size-4" />
        //             <span className="sr-only">Increment</span>
        //         </Button>
        //     </Group>
        // </NumberField>
        <NumberField
            value={field.value ?? 0}
            onChange={(val) => {
                // react-aria sends number | null
                if (val == null) {
                    field.onChange(0);
                    return;
                }

                const clamped = Math.max(0, Math.min(val, item.score));
                field.onChange(clamped);
            }}
            minValue={0}
            maxValue={item.score}
            isDisabled={hasMatch || pendingSubmitScore}
            className="w-full space-y-2"
        >
            <Group className="dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm">
                <Input
                    className="selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none"
                    value={field.value ?? 0}
                    onChange={(e) => {
                        const typed = e.target.value;

                        // 🚫 Do not allow empty
                        if (typed === '') {
                            field.onChange(0);
                            return;
                        }

                        // Allow digits only
                        if (!/^\d+$/.test(typed)) return;

                        const value = Number(typed);

                        if (value > item.score) return;

                        field.onChange(value);
                    }}
                    onKeyDown={(e) => {
                        // Optional hard block: Backspace on 0
                        if (e.key === 'Backspace' && field.value === 0) {
                            e.preventDefault();
                        }
                    }}
                />
                <div className="flex h-[calc(100%+2px)] flex-col">
                    <Button
                        slot="increment"
                        className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex h-1/2 w-8 flex-1 items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronUpIcon className="size-3" strokeWidth={5} />
                        <span className="sr-only">Increment</span>
                    </Button>
                    <Button
                        slot="decrement"
                        className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px -mt-px flex h-1/2 w-8 flex-1 items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronDownIcon className="size-3" strokeWidth={5} />
                        <span className="sr-only">Decrement</span>
                    </Button>
                </div>
            </Group>
        </NumberField>
    );
};

export default InputWithEndButton;
