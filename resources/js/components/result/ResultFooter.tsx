import { JudgesGroup } from '@/api/result';
import { usePage } from '@inertiajs/react';

export type AUTH = {
    auth: {
        user: {
            name: string;
            role: string;
        };
    };
};

const ResultFooter = ({ sortedUniqueJudges }: { sortedUniqueJudges: JudgesGroup[] }) => {
    const { auth } = usePage<AUTH>().props;
    return (
        // grid w-full grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]
        <div className="mt-20 w-full p-2 uppercase">
            <div className="flex flex-row flex-wrap items-center justify-center gap-10">
                {sortedUniqueJudges?.map((i) => (
                    <div className="w-72 text-center" key={i.id}>
                        <div>{i.judges.name}</div>
                        <hr className="h-[2px] bg-slate-950" />
                        <div className="text-xs">
                            {i.judges?.role} {i.judges.judge_number}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-10">
                <div className="w-72 text-center">
                    <div>{auth.user.name}</div>
                    <hr className="h-[2px] bg-slate-950" />
                    <div className="text-xs">Tabulator</div>
                </div>
            </div>
        </div>
    );
};

export default ResultFooter;
