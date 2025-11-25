<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamParticipants extends Model
{
    protected $fillable = [
        'contest_id',
        'team_participant_no',
        'team_name',
        'team_description',
        'team_captain',
        'poster_url',
    ];

    public function contest(): BelongsTo
    {
        return $this->belongsTo(Contest::class, 'contest_id');
    }

    public function scoreJudgings()
    {
        return $this->hasMany(ScoreJudging::class, 'participant_id');
    }

    public function judges()
    {
        return $this->belongsTo(JudgingScore::class, 'judge_id');
    }
}
