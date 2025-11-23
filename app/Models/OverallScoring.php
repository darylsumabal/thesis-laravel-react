<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class OverallScoring extends Model
{
    protected $fillable = [
        'group_id',
        'contest_id',
        'participant_id',
        'participant_type',
        'judges_id',
        'round',
        'criteria',
        'score',
        'rank',
        'total_rank',
        'total',
        'total_points',
        'final_rank',
        'type'
    ];

    public function scoreJudgingTest(): BelongsTo
    {
        return $this->belongsTo(ScoreJudging::class, 'score_judging_test_id', 'id');
    }

    public function participant(): MorphTo
    {
        return $this->morphTo();
    }


    // public function teamParticipant(): MorphTo
    // {
    //     return $this->morphTo();
    // }

    public function criteriaTests(): HasMany
    {
        return $this->hasMany(Criteria::class, 'contest_id', 'contest_id');
    }

    public function judges(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judges_id', 'id');
    }
}
