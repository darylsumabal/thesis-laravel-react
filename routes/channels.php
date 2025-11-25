<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


Broadcast::channel('top-participants', function ($user) {

    logger()->info('Broadcast auth check', [
        'user_id' => $user->id,
    ]);
    return true;
});


Broadcast::channel('submit-score', function ($user) {

    logger()->info('Broadcast auth check', [
        'user_id' => $user->id,
    ]);
    return true;
});
