<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ScoreJudging extends Model
{
    protected $fillable = [
        'group_id',
        'judges_id',
        'contest_id',
        'participant_id',
        'participant_type',
        'rank',
        'criteria',
        'round',
        'evaluation_criteria',
        'total',
        'total_score',
        'rank',
        'total_rank',
    ];

    // public function participant(): MorphTo
    // {
    //     return $this->morphTo();
    // }
    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participants::class, 'participant_id');
    }


    public function judges(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judges_id', 'id');
    }

    public function teamParticipant(): BelongsTo
    {
        return $this->belongsTo(TeamParticipants::class, 'participant_id');
    }

    // public function teamParticipant(): MorphTo
    // {
    //     return $this->morphTo();
    // }

    public function criteriaTest(): HasMany
    {
        return $this->hasMany(Criteria::class, 'group_id', 'group_id');
    }

    public function contest(): BelongsTo
    {
        return $this->belongsTo(Contest::class, 'contest_id', 'id');
    }
}
