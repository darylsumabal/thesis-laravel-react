import { Contest } from '@/api/contest';
import { JudgesGroup } from '@/api/result';
import { usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '../ui/button';
import ResultFooter from './ResultFooter';
import ResultHeader from './ResultHeader';

type ResultProps = {
    contest: Contest;
    // topResult: MajorAward[];
    criteria: string;
    sortedUniqueJudges: JudgesGroup[];
};

const ResultsTeamSingleRound = ({
    contest,
    // topResult,
    criteria,
    sortedUniqueJudges,
}: ResultProps) => {
    const { resultSingleRound } = usePage().props;
    const result = resultSingleRound.filter((item) => item.top_male.criteria === criteria);

    const sectionRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({ contentRef: sectionRef });

    return (
        <>
            <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                PRINT
            </Button>
            <div ref={sectionRef}>
                <ResultHeader contest={contest ?? { contest: [], message: '' }} />
                <div className="mt-10 flex w-full flex-col items-center justify-center gap-2">
                    <div className="w-full border-2 border-b-black" />
                    <div className="text-center font-serif text-2xl font-bold uppercase">
                        <p>FINAL RESULT</p>
                        <p>{criteria}</p>
                    </div>
                    <div className="w-full border-2 border-b-black" />

                    <div className="flex w-full flex-col">
                        {result
                            ?.slice()
                            .reverse()
                            .map((i, index) => {
                                const year = new Date(contest.event.date).getFullYear();
                                const labels = `${criteria} ${year}`;

                                const getPlacement = (index: number, length: number) => {
                                    const position = length - index - 1;

                                    if (position === 0) return '';

                                    const suffix = (n: number) => {
                                        if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
                                        if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
                                        if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
                                        return `${n}th`;
                                    };

                                    return `${suffix(position)} Runner Up`;
                                };

                                return (
                                    <div key={index} className="mt-4 flex w-full flex-col items-center justify-center gap-4">
                                        <div className="mt-4 mb-10">
                                            <p className="text-lg font-bold uppercase">
                                                {labels} {getPlacement(index, result.length)}
                                            </p>
                                            <p className="text-center">Category</p>
                                        </div>

                                        <div className="flex w-full justify-between">
                                            {i.top_male?.participant?.team_participant_no.length > 0 && (
                                                <div className="flex w-full justify-evenly">
                                                    <div>
                                                        <p className="font-bold uppercase">
                                                            Team No.
                                                            {i.top_male?.participant?.team_participant_no ?? '-'}
                                                        </p>

                                                        <p className="text-center"> {i.top_male?.participant?.team_name ?? '-'} </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full border-2 border-dashed border-b-black" />
                                    </div>
                                );
                            })}
                    </div>

                    <div className="w-full">
                        <ResultFooter sortedUniqueJudges={sortedUniqueJudges} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResultsTeamSingleRound;
