import { PathMatch } from "react-router-dom";
import TableResultTypeTeam from "../table/TableResultTypeTeam";


const CriteriaSectionFinalResultTeam = ({
  criteriaName,
  routeCardSr,
}: {
  criteriaName: string;
  routeCardSr: boolean
}) => {
  return (
    <div className="mx-auto">
      <div key={criteriaName} className="mb-12">
        {/* <h2 className="text-3xl rounded-md bg-[#45226b] text-white font-bold text-center mb-4 p-1">
          {criteriaName}
        </h2> */}
        <div>
          <div className="gap-6">
            <div className="w-full">
              {/* <TableResultTestTeam criteriaName={criteriaName} />
               */}
              <TableResultTypeTeam
                // contest={contest ?? { contest: [], message: "" }}
                // scoringType={`${scoringType} based`}
                criteriaName={criteriaName}
                routeCardSr={routeCardSr}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriteriaSectionFinalResultTeam;
