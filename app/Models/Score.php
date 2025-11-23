<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Score extends Model
{
    protected $fillable = [
        'organizer_id',
        'group_id',
        'contest_id'
    ];

    public function criteriaTest(): HasMany
    {
        return $this->hasMany(Criteria::class, 'group_id', 'group_id');
    }

    public function judges(): HasMany
    {
        return $this->hasMany(ContestJudges::class, 'group_id', 'group_id');
    }

    public function contest(): BelongsTo
    {
        return $this->belongsTo(Contest::class, 'contest_id', 'id');
    }
}
