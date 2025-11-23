import { Timeline } from '@/components/ui/timeline';
import { useActivityLog } from '@/utils/tanstack/result';
import { useParams } from 'react-router-dom';

export function ActivityLog() {
    // const { group_id } = useParams();
    // const { activity } = useActivityLog(group_id ?? '');
    return (
        <div className="relative w-full overflow-clip">
            {/* <Timeline data={activity ?? []} /> */}
            Activity log
        </div>
    );
}
