<?php

use App\Http\Controllers\Contest\ContestController;
use App\Http\Controllers\Event\AddEventController;
use App\Http\Controllers\Event\EventController;
use App\Http\Controllers\Event\UpcomingEventController;
use Illuminate\Support\Facades\Route;

Route::prefix('event')->group(function () {
    // Route::get('/', [UpcomingEventController::class, 'index']);

    // Route::get('/archived/{organizerId}', [UpcomingEventController::class, 'indexArchivedEvent']);

    // Route::get('/organizer/{organizerId}/{eventId}', [UpcomingEventController::class, 'indexOrganizer']);


    Route::get('/', [EventController::class, 'index']);

    //event list table
    Route::get('/event-list', [EventController::class, 'indexOrganizerTable']);

    //show the event selected in the table display the specif event and the contest Table list
    Route::get('/event-list/{eventId}', [EventController::class, 'show']);

    //store a contest in the specific selected event
    Route::post('/event-list/{eventid}', [
        UpcomingEventController::class,
        'store'
    ]);

    //selected contest from the table inside the event card
    Route::get('/event-list/{eventId}/contest/{contestId}/{contestType}', [ContestController::class, 'indexContest']);

    //store the team participant
    Route::post('/{contestId}/team-participant', [ContestController::class, 'storeTeamParticipant'])->name('contest.participant.store');

    //store the participant
    Route::post('/{contestId}/participant', [ContestController::class, 'storeParticipant']);


    Route::post('/update/{eventId}', [EventController::class, 'update']);


    //archived event
    Route::post('/archived/{eventId}', [EventController::class, 'archivedEvent']);

    //restore event
    Route::post('/archived/restore/{eventId}', [EventController::class, 'restoreArchivedEvent']);

    //delete event
    Route::delete('/{id}', [EventController::class, 'destroy']);



    Route::get('/judge/{judgeId}/{eventId}', [UpcomingEventController::class, 'indexJudges']);

    Route::get('/judge/{judgeId}', [UpcomingEventController::class, 'indexJudges']);

    Route::post('/', [AddEventController::class, 'store']);


    Route::post('/poster/{contestId}', [
        UpcomingEventController::class,
        'storePoster'
    ]);

    Route::get('/event-list/{eventId}/contest/{contestId}/poster', [
        UpcomingEventController::class,
        'poster'
    ]);
});
