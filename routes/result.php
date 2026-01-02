<?php

use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Criteria\CriteriaController;
use App\Http\Controllers\Judging\JudgingController;
use App\Http\Controllers\Result\ResultController;
use App\Http\Controllers\Result\ResultViewController;
use Illuminate\Support\Facades\Route;

Route::middleware('is_admin')->prefix('result')->group(function () {

    Route::get('/{contestId}/{groupId}/individual', [ResultViewController::class, 'indexJudgesFinished']);

    Route::get('/{contestId}/{groupId}/team', [ResultViewController::class, 'indexJudgesFinishedTeam']);

    Route::post('/multiple-round/individual/{contestId}/{groupId}/{resultType}', [ResultController::class, 'storeResultMultiple']);

    Route::post('/multiple-round/team/{contestId}/{groupId}/{resultType}', [ResultController::class, 'storeResultMultipleTeam']);

    Route::post('/single-round/individual/{contestId}/{groupId}/{resultType}', [ResultController::class, 'storeResultSingleRound']);

    Route::post('/single-round/team/{contestId}/{groupId}/{resultType}', [ResultController::class, 'storeResultSingleRoundTeam']);

    Route::post('/final/{contestId}/{groupId}/{resultType}', [ResultController::class, 'storeResultFinal']);

    Route::get('/', [CriteriaController::class, 'indexCriteriaTable'])->name('resultTable');
});
