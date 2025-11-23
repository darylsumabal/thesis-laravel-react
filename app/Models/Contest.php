<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contest extends Model
{
    protected $fillable = [
        'organizer_id',
        'contest_name',
        'contest_description',
        'contest_organizer',
        'contest_scoring_type',
        'contest_gender_category',
        'contest_date',
        'contest_type',
        'contest_venue',
        'contest_poster',
        'event_id'
    ];


    /**
     * Define a relationship where a contest belongs to an event.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participants::class, 'contest_id');
    }

    public function teamParticipants(): HasMany
    {
        return $this->hasMany(TeamParticipants::class, 'contest_id');
    }


    public function contest(): HasMany
    {
        return $this->hasMany(ContestJudges::class, 'contest_id');
    }
}
