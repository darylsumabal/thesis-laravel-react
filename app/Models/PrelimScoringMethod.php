<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PrelimScoringMethod extends Model
{
    protected $fillable = [
        'group_id',
        'contest_id',
        'preliminary_method',
        'contest_name',
        'weight'
    ];

    public function contest(): BelongsTo
    {
        return $this->belongsTo(Contest::class, 'contest_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(Score::class, 'group_id');
    }
}
