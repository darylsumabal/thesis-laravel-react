<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'organizer_id',
        'name',
        'description',
        'date',
        'organizer',
        'venue',
        'poster',
        'address'
    ];

    /**
     * Define a relationship where an event has many contests.
     */
    public function contests(): HasMany
    {
        return $this->hasMany(Contest::class, 'event_id');
    }

    public function judgesGroups()
    {
        return $this->hasMany(JudgesGroup::class);
    }

    // Assuming an event has many contest judges
    public function contestJudges()
    {
        return $this->hasMany(ContestJudges::class);
    }
}
