<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class OverallFinalScore extends Model
{
    protected $fillable = [
        'group_id',
        'contest_id',
        'judges_id',
        'participant_type',
        'participant_id',
        'criteria',
        'score',
        'round_score',
        'total',
        'final_rank'
    ];


    public function participant(): MorphTo
    {
        return $this->morphTo();
    }
}
