import TableResultTestTeam from "../table/TableResultTestTeam";


const CriteriaSectionTeam = ({ criteriaName }: { criteriaName: string }) => {
    return (
        <div className="mx-auto">
            <div key={criteriaName} className="mb-12">
                <h2 className="mb-4 rounded-md bg-[#45226b] p-1 text-center text-3xl font-bold text-white">{criteriaName}</h2>
                <div>
                    <div className="gap-6">
                        <div className="w-full">
                            <TableResultTestTeam criteriaName={criteriaName} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CriteriaSectionTeam;
