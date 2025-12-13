<?php

use App\Http\Controllers\Account\AccountController;
use Illuminate\Support\Facades\Route;

Route::prefix('accounts')->group(function () {
    // Route::get('/', [AccountController::class, 'indexUser']);

    Route::post('/', [AccountController::class, 'storeJudge']);

    Route::put('/{id}', [AccountController::class, 'update']);
    Route::delete('/{id}', [AccountController::class, 'destroy']);
});



    // Route::get('/judge', [AccountController::class, 'fetchJudges']);

    // Route::post('/', [AccountController::class, 'store']);