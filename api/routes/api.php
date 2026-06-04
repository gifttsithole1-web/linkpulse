<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CommunicationLogController;
use App\Http\Controllers\Api\LoyaltyAccountController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\FeedbackSubmissionController;
use App\Http\Controllers\Api\PublicQrSubmissionController;
use App\Http\Controllers\Api\SettingsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->group(function () {
    Route::apiResource('clients', ClientController::class);
    Route::get('loyalty-accounts', [LoyaltyAccountController::class, 'index']);
    Route::post('loyalty-accounts/{loyaltyAccount}/award-points', [LoyaltyAccountController::class, 'awardPoints']);
    Route::post('loyalty-accounts/{loyaltyAccount}/redeem-points', [LoyaltyAccountController::class, 'redeemPoints']);
    Route::get('communication-logs', [CommunicationLogController::class, 'index']);
    Route::post('communication-logs', [CommunicationLogController::class, 'store']);

    Route::get('feedback-submissions', [FeedbackSubmissionController::class, 'index']);
    Route::post('public/qr-submissions', [PublicQrSubmissionController::class, 'store']);

    Route::get('settings', [SettingsController::class, 'index']);
    Route::patch('settings', [SettingsController::class, 'update']);
    Route::post('automations/weekly-updates', [AutomationController::class, 'weeklyUpdates']);
});
