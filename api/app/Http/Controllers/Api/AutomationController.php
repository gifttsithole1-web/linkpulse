<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendWeeklyProductUpdatesJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationController extends Controller
{
    public function weeklyUpdates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'headline' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
        ]);

        SendWeeklyProductUpdatesJob::dispatch(
            $validated['headline'],
            $validated['body']
        );

        return response()->json(['message' => 'Weekly update emails queued']);
    }
}
