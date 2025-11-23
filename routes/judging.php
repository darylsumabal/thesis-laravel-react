<?php

use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Criteria\CriteriaController;
use App\Http\Controllers\Judging\JudgingController;
use Illuminate\Support\Facades\Route;

Route::prefix('judging')->group(function () {
    Route::get('/', [AccountController::class, 'indexUser']);


    Route::post('/', [JudgingController::class, 'storeJudge']);

    Route::post('/edit-score/{contestId}/{groupId}/{judgeId}', [JudgingController::class, 'updateFinishedUpdate']);

    Route::put('/{id}', [AccountController::class, 'update']);

    Route::delete('/{id}', [AccountController::class, 'destroy']);

    Route::get('/contest-list', [CriteriaController::class, 'indexCriteriaTable'])->name('judgesTable');

    Route::post('/score/{judgeId}/{contestId}/{groupId}/{roundType}', [JudgingController::class, 'storeJudging']);

    Route::get('/criteria-list/{contestId}/{groupId}', [JudgingController::class, 'indexCriteria']);
});
