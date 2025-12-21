<?php

use App\Http\Controllers\Account\AccountController;
use Illuminate\Support\Facades\Route;

Route::prefix('account')->group(function () {
    Route::post('/', [AccountController::class, 'storeJudge']);
    Route::post('/{judgeId}', [AccountController::class, 'update']);
    Route::get('/', [AccountController::class, 'index'])->name('account.index');
    Route::delete('/{id}', [AccountController::class, 'destroy']);
});
