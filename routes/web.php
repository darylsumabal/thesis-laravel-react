<?php

use App\Http\Controllers\Account\AccountController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    require __DIR__ . '/account.php';
    require __DIR__ . '/event.php';
    require __DIR__ . '/judging.php';
    require __DIR__ . '/contest.php';
    require __DIR__ . '/criteria.php';
    require __DIR__ . '/result.php';
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
