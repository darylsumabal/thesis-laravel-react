import TableResultTest from "../table/TableResultTest";


const CriteriaSection = ({ criteriaName, genders }: { criteriaName: string; genders: string[] }) => {

    // 🧠 Decide what to render based on the gender category
    const renderTables = () => {
        if (genders.includes('maleFemale')) {
            // If genderCategory is maleFemale → render both Male & Female tables
            return (
                <div className="flex flex-col gap-8 xl:flex-row">
                    <TableResultTest criteriaName={criteriaName} gender="Male" />
                    <TableResultTest criteriaName={criteriaName} gender="Female" />
                </div>
            );
        }

        // Otherwise, render a single table for the first gender
        const gender = genders[0]?.toLowerCase() ?? 'mixed';

        return (
            <div className="w-full">
                <TableResultTest criteriaName={criteriaName} gender={gender} />
            </div>
        );
    };

    return (
        <div className="mx-auto">
            <div key={criteriaName} className="mb-12">
                <h2 className="mb-4 rounded-md bg-[#45226b] p-4 text-center text-3xl font-bold text-white uppercase">{criteriaName}</h2>
                <div>{renderTables()}</div>
            </div>
        </div>
    );
};

export default CriteriaSection;
