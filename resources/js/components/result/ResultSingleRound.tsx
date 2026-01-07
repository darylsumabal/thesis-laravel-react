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

const ResultSingleRound = ({
    contest,
    // topResult,
    criteria,
    sortedUniqueJudges,
}: ResultProps) => {
    const { resultSingleRound } = usePage().props;

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
                    <p className="font-serif text-2xl font-bold uppercase">FINAL RESULT</p>
                    <div className="w-full border-2 border-b-black" />

                    <div className="flex w-full flex-col">
                        {resultSingleRound?.map((i, index) => {
                            // const labels = contest?.contest.map((i) => {
                            //   const year = new Date(i.event.date).getFullYear();
                            //   return `${i.contest_name} ${year}`;
                            // });
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
                                            {criteria} {getPlacement(index, resultSingleRound.length)}
                                        </p>
                                        <p className="text-center" >Category</p>
                                    </div>

                                    <div className="flex w-full justify-between">
                                        {i.top_male?.participant?.participant_no.length > 0 && (
                                            <div className="flex w-full justify-evenly">
                                                <div>
                                                    <p className="font-bold uppercase">
                                                        Candidate No.
                                                        {i.top_male?.participant?.participant_no ?? '-'}
                                                    </p>
                                                    <p className="text-center">Male</p>
                                                </div>
                                            </div>
                                        )}
                                        {i.top_female?.participant?.participant_no?.length > 0 && (
                                            <div className="flex w-full justify-evenly">
                                                <div>
                                                    <p className="font-bold uppercase">
                                                        Candidate No.
                                                        {i.top_female?.participant?.participant_no ?? '-'}
                                                    </p>
                                                    <p className="text-center">Female</p>
                                                </div>
                                            </div>
                                        )}
                                        {i.participant?.participant?.participant_no?.length > 0 && (
                                            <div className="flex w-full justify-evenly">
                                                <div>
                                                    <p className="font-bold uppercase">
                                                        Candidate No.
                                                        {i.participant?.participant?.participant_no ?? '-'}
                                                    </p>
                                                    <p className="text-center">{i.participant?.participant.gender}</p>
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

export default ResultSingleRound;
