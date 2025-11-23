<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'model',
        'model_id',
        'action',
        'changes',
        'ip_address',
    ];
    protected $casts = [
        'changes' => 'array',
    ];
}
