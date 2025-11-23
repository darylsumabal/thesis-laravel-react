import TableResultType from '../table/TableResultType';

const CriteriaSectionFinalResult = ({ criteriaName, genders, routeCardSr }: { criteriaName: string; genders: string[]; routeCardSr: boolean }) => {
    // 🧠 Function to render tables based on gender

    const renderTables = () => {
        if (genders.includes('maleFemale')) {
            // If genderCategory is maleFemale → render both Male & Female tables
            return (
                <div className="flex gap-8">
                    <div className="w-full">
                        <TableResultType criteriaName={criteriaName} gender="Male" routeCardSr={routeCardSr} />
                    </div>
                    <div className="w-full">
                        <TableResultType criteriaName={criteriaName} gender="Female" routeCardSr={routeCardSr} />
                    </div>
                </div>
            );
        }

        // Otherwise, render single gender
        const gender = genders[0]?.toLowerCase() ?? 'mixed';

        return (
            <div className="w-full">
                <TableResultType criteriaName={criteriaName} gender={gender} routeCardSr={routeCardSr} />
            </div>
        );
    };

    return (
        <div className="mx-auto">
            <div key={criteriaName} className="mb-12">
                <div>{renderTables()}</div>
            </div>
        </div>
    );
};

export default CriteriaSectionFinalResult;
