<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


Broadcast::channel('top-participants', function () {
    return true;
});


Broadcast::channel('submit-score', function () {
    return true;
});


Broadcast::channel('request-edit', function () {
    return true;
});
