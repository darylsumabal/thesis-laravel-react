<?php

use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Criteria\CriteriaController;
use App\Http\Controllers\Judging\JudgingController;
use Illuminate\Support\Facades\Route;

Route::prefix('judging')->group(function () {

    Route::post('/', [JudgingController::class, 'storeJudge']);

    Route::delete('/{id}', [AccountController::class, 'destroy']);

    Route::middleware('is_judge')->group(function () {
        Route::post('/edit-score/{contestId}/{groupId}/{judgeId}', [JudgingController::class, 'updateFinishedUpdate'])->middleware('is_judge');

        Route::get('/contest-list', [CriteriaController::class, 'indexCriteriaTable'])->name('judgesTable')->middleware('is_judge');

        Route::post('/score/{judgeId}/{contestId}/{groupId}/{roundType}', [JudgingController::class, 'storeJudging'])->middleware('is_judge');

        Route::get('/criteria-list/{contestId}/{groupId}', [JudgingController::class, 'indexCriteria'])->middleware('is_judge');
    });
});
