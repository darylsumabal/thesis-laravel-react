import { Contest } from '@/api/contest';
import { format } from 'date-fns';
const ResultHeader = ({ contest }: { contest: Contest }) => {
    return (
        <div className="flex flex-col gap-14">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img className="h-14" src='/asset/bisu.png'alt="bisu logo" />
                    <div className="leading-tight">
                        <p className="text-[0.917rem]">Republic of Philippines</p>
                        <p className="text-[1rem] font-bold uppercase">Bohol Island State University</p>
                        <p className="text-[0.833rem]">Magsija, Balilihan, 6342, Bohol, Philippines</p>
                        <p className="font-times text-[0.833rem]">Balance | Integrity | Stewardship | Uprightness</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <img className="h-14" src='/asset/bagong.png' alt="" />
                    <img className="h-14" src='/asset/certified.jpg' alt="" />
                </div>
            </div>
            {contest.contest?.map((i) => (
                <div key={i.id} className="flex flex-col items-center justify-center gap-4">
                    <img src={`storage/${i.contest_poster}`} alt="" className="h-36 w-36 rounded-sm" />
                    <div className="text-center">
                        <p className="font-serif text-2xl font-bold">{i.event.name}</p>
                        <div className="flex items-center justify-center gap-1">
                            <p className="text-sm font-medium"> {i.contest_date ? format(new Date(i.contest_date), 'MMMM d, yyyy') : ''}</p>
                            <p className="text-sm font-medium">|</p>
                            <p className="cap text-sm font-medium">{i.contest_venue}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ResultHeader;
