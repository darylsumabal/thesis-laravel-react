<?php

use App\Http\Controllers\Contest\ContestController;
use Illuminate\Support\Facades\Route;

Route::prefix('contest')->group(function () {

    Route::post('/{contestId}/{participantType}/upload', [ContestController::class, 'storeImportParticipant']);

    Route::delete('/participant/{contestId}/{id}', [ContestController::class, 'destroyParticipant']);

    Route::delete('/team-participant/{contestId}/{id}', [ContestController::class, 'destroyTeamParticipant']);

    Route::post('/archived/{contestId}', [ContestController::class, 'archivedContest']);

    Route::post('/archived/restore/{contestId}', [ContestController::class, 'archivedRestoreContest']);

    Route::delete('/{id}', [ContestController::class, 'destroy']);


    Route::post('/update/{contestId}', [ContestController::class, 'updateContest']);

    Route::post('/{contestId}/team/{participantId}', [ContestController::class, 'updateTeamParticipant']);

    Route::post('/{contestId}/update/participant/{participantId}', [ContestController::class, 'updateParticipant']);

    //un used
    Route::get('/', [ContestController::class, 'index']);

    Route::get('/organizer/archived/{organizerId}/event/{eventId}', [ContestController::class, 'indexArchivedContest']);


    //display the contest list in the table
    // Route::get('/organizer/{organizerId}/{contestId}', [ContestController::class, 'indexContest']);


    Route::get('/judge/{judgeId}/{contestId}', [ContestController::class, 'indexContestJudges']);

    Route::get('/judge/{judgeId}', [ContestController::class, 'indexContestJudges']);

    Route::get('/judges', [ContestController::class, 'indexJudges']);

    Route::get('/judges/category/{contestId}', [ContestController::class, 'indexCategoryJudges']);


    // Route::post('/{contestId}/organizer/{participantType}/upload', [ContestController::class, 'storeImportParticipant']);


    Route::get('/{contestId}/participant/{participantId}', [ContestController::class, 'indexParticipant']);

    Route::get('/{contestId}/team/participant/{participantId}', [ContestController::class, 'indexTeamParticipant']);
});
