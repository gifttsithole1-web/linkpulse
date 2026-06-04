<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeedbackSubmission;
use Illuminate\Http\JsonResponse;

class FeedbackSubmissionController extends Controller
{
    public function index(): JsonResponse
    {
        $submissions = FeedbackSubmission::with('client')
            ->latest()
            ->paginate(25);

        return response()->json($submissions);
    }
}
