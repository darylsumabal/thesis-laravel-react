import { JudgesGroup } from '@/api/result';
import { usePage } from '@inertiajs/react';

const ResultFooter = ({ sortedUniqueJudges }: { sortedUniqueJudges: JudgesGroup[] }) => {
    const { auth } = usePage().props;
    return (
        <div className="mt-20 p-2">
            <div className="grid grid-cols-2 items-center justify-center gap-10">
                {sortedUniqueJudges?.map((i, index) => (
                    <div className="w-72 text-center" key={i.id}>
                        <div>{i.judges.name}</div>
                        <hr className="h-[2px] bg-slate-950" />
                        <div className="text-xs">
                            {i.judges?.role}
                            {index !== sortedUniqueJudges.length - 1 && ` ${index + 1}`}
                        </div>
                    </div>
                ))}
            </div>
            {/* <div
        className={`grid items-center gap-10 justify-center ${
          sortedUniqueJudges?.length === 1
            ? "grid-cols-1 place-items-center"
            : "grid-cols-2"
        }`}
      >
        {sortedUniqueJudges?.map((i, index) => (
          <div className="w-72 text-center" key={i.id}>
            <div>{i.judges.name}</div>
            <hr className="bg-slate-950 h-[2px]" />
            <div className="text-xs">
              {i.judges?.role}
              {index !== sortedUniqueJudges.length - 1 && ` ${index + 1}`}
            </div>
          </div>
        ))}
      </div> */}

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
