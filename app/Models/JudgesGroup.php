<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class JudgesGroup extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contest_id',
        'group_id',
        'judges_id',
        'round',
        'criteria',
        'is_finished',
        'can_edit'
    ];

    protected $dates = ['deleted_at'];

    public function Judges(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'judges_id');
    }

    // In JudgesGroup.php
    public function judge()
    {
        return $this->belongsTo(User::class, 'judges_id');
    }
}
