<?php

namespace App\Traits;

use App\Models\Contest;
use App\Models\Participants;
use App\Models\TeamParticipants;
use Illuminate\Support\Collection;

trait HasParticipants
{
    public function getParticipantsByContest($contestId): Collection
    {
        $contestType = Contest::where('id', $contestId)->value('contest_type');

        if ($contestType === 'Team') {
            return TeamParticipants::where('contest_id', $contestId)->get();
        }

        if ($contestType === 'Individual') {
            return Participants::where('contest_id', $contestId)->get();
        }

        return collect();
    }
}
