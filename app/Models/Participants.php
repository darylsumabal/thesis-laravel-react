<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Participants extends Model
{
    protected $fillable = [
        'contest_id',
        'participant_no',
        'first_name',
        'last_name',
        'description',
        'age',
        'gender',
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
