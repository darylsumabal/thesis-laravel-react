<?php

use App\Http\Controllers\Criteria\CriteriaController;
use Illuminate\Support\Facades\Route;

Route::middleware('is_admin')->prefix('criteria')->group(function () {

  Route::get('/criteria-list', [CriteriaController::class, 'indexCriteriaTable']);

  Route::get('/criteria-list/{contestId}/{groupId}', [CriteriaController::class, 'indexCriteria']);

  Route::post('/criteria-add/{contestId}/{groupId}', [CriteriaController::class, 'storeAddCriteria']);

  //display in creating criteria view
  Route::get('/create/{contestId}/{contestType}/{roundType}', [CriteriaController::class, 'indexCreateCriteria']);

  //create the criteria
  Route::post('/create/{contestId}', [CriteriaController::class, 'store']);


  //update qualified
  Route::post('/update/qualified/{contestId}/{groupId}', [CriteriaController::class, 'updateQualified']);

  //update round percentage for multiple round prelim n final
  Route::post('/update/percentage/{contestId}/{groupId}', [CriteriaController::class, 'updateRoundPercentage']);

  //update criteria
  Route::post('/update/{contestId}/{groupId}', [CriteriaController::class, 'updateCriteria']);


  Route::post('/add-judges/{contestId}/{groupId}', [CriteriaController::class, 'storeJudge']);

  Route::delete('/delete-judges/{judgeId}/{contestId}/{groupId}', [CriteriaController::class, 'deleteJudgesCriteria']);


  Route::delete('/{id}/scores', [CriteriaController::class, 'destroy']);

  //delete criteria
  Route::delete('/{contestId}/{groupId}', [CriteriaController::class, 'destroyCriteria']);


  Route::post('/{id}/scores/archived', [CriteriaController::class, 'archivedCriteria']);

  Route::post('/{id}/scores/archived/restore', [CriteriaController::class, 'restoreArchivedCriteria']);
});
