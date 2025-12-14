<?php

use App\Http\Controllers\Account\AccountController;
use Illuminate\Support\Facades\Route;

Route::prefix('accounts')->group(function () {
    Route::post('/', [AccountController::class, 'storeJudge']);
    Route::delete('/{id}', [AccountController::class, 'destroy']);
});


