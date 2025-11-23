import { Contest } from '@/api/contest';
import { JudgesGroup } from '@/api/result';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { MajorAward } from '../table/TableResultTest';
import { Button } from '../ui/button';
import ResultFooter from './ResultFooter';
import ResultHeader from './ResultHeader';

type ResultProps = {
    contest: Contest;
    topResult: MajorAward[];
    sortedUniqueJudges: JudgesGroup[];
    pointBasedFinal: boolean;
};

const Results = ({ contest, topResult, sortedUniqueJudges, pointBasedFinal }: ResultProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({ contentRef: sectionRef });
    // const result =  ;
    const result = pointBasedFinal ? topResult.slice().reverse() : topResult

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
                        {result?.map((i, index) => {
                            const year = new Date(contest.event.date).getFullYear();
                            const labels = `${contest.contest_name} ${year}`;

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
                                            {labels} {getPlacement(index, topResult.length)}
                                        </p>
                                        <p className="text-center">Category</p>
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

                    <div>
                        <ResultFooter sortedUniqueJudges={sortedUniqueJudges} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Results;
