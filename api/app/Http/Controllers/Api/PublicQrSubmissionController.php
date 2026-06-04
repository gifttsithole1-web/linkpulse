<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\FeedbackSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicQrSubmissionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $secret = config('services.linkpulse.sync_secret');
        $headerSecret = $request->header('x-linkpulse-sync-secret');

        if (!$secret || !$headerSecret || !hash_equals($secret, $headerSecret)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'feedback' => ['required', 'string'],
            'firestore_id' => ['nullable', 'string', 'max:255'],
        ]);

        // If we already ingested this Firestore doc, return OK (idempotent).
        if (!empty($validated['firestore_id'])) {
            $existing = FeedbackSubmission::where('firestore_id', $validated['firestore_id'])->first();
            if ($existing) {
                return response()->json(['message' => 'Already synced']);
            }
        }

        $email = strtolower($validated['email']);
        $fullName = trim($validated['name'].' '.$validated['surname']);
        $phone = !empty($validated['phone_number'])
            ? $validated['phone_number']
            : 'N/A';

        $client = Client::firstOrCreate(
            ['email' => $email],
            [
                'name' => $fullName,
                'phone_number' => $phone,
                'account_type' => 'retail',
                'marketing_opt_in' => true,
                'source' => 'qr',
            ]
        );

        $client->name = $fullName;
        if (!empty($validated['phone_number']) && $client->phone_number === 'N/A') {
            $client->phone_number = $validated['phone_number'];
        }
        if (!$client->marketing_opt_in) {
            $client->marketing_opt_in = true;
        }
        if (empty($client->source)) {
            $client->source = 'qr';
        }
        $client->save();

        if (!$client->loyaltyAccount) {
            $client->loyaltyAccount()->create([
                'points_balance' => 0,
                'lifetime_points' => 0,
                'tier_level' => 'Bronze',
            ]);
        }

        FeedbackSubmission::create([
            'client_id' => $client->id,
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'email' => $email,
            'feedback' => $validated['feedback'],
            'firestore_id' => $validated['firestore_id'] ?? null,
            'source' => 'qr',
        ]);

        return response()->json([
            'message' => 'Synced',
            'client_id' => $client->id,
            'created' => $client->wasRecentlyCreated,
        ], 201);
    }
}

