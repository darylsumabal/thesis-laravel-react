<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class JudgingScore extends Model
{
    protected $fillable = [
        'contest_id',
        'round',
        'criteria',
        'evaluation_criteria',
        'score',
        'group_id',
        'judges_id',
        'participant_id',
        'participant_type',
    ];

    public function participant(): MorphTo
    {
        return $this->morphTo();
    }

    public function judges(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judges_id', 'id');
    }

    public function criteria(): BelongsTo
    {
        return $this->belongsTo(Criteria::class, 'judges_id', 'id');
    }

    protected static function booted()
    {
        // 🔹 When a record is created
        // static::created(function ($model) {
        //     ActivityLog::create([
        //         'user_id'    => auth()->id(),
        //         'model'      => get_class($model),
        //         'model_id'   => $model->id,
        //         'action'     => 'created',
        //         'changes'    => $model->getAttributes(),
        //         'ip_address' => request()->ip(),
        //     ]);
        // });

        // 🔹 When a record is updated
        static::updated(function ($model) {
            ActivityLog::create([
                'user_id'    => auth()->id(),
                'model'      => get_class($model),
                'model_id'   => $model->id,
                'action'     => 'updated',
                'changes'    => [
                    'before' => array_intersect_key($model->getOriginal(), $model->getChanges()), // only the fields that changed
                    'after'  => $model->getChanges(),
                ],
                'ip_address' => request()->ip(),
            ]);
        });

    }
}
