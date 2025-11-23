<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContestJudges extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'judge_id',
        'contest_id',
    ];


    protected $dates = ['deleted_at'];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Contest::class, 'event_id');
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judge_id');
    }


    public function contest(): BelongsTo
    {
        return $this->belongsTo(Contest::class, 'contest_id');
    }
}
