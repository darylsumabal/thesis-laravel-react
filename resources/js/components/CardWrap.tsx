import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export type Field = {
    label: string;
    inputType: 'email' | 'file' | 'password' | 'text' | 'date' | 'combobox' | 'textarea' | 'number' | 'test';
};

type CardWrapProps = {
    title: string;
    info: string;
    children: ReactNode;
    fields?: Field[];
    className?: string;
};

const CardWrap = ({ title, info, children, className }: CardWrapProps) => {
    return (
        <Card className={cn('h-full rounded-none bg-[#fafafa]', className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{info}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
};

export default CardWrap;
