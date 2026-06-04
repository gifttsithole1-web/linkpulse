<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyAccountController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            LoyaltyAccount::with('client')->latest()->paginate(25)
        );
    }

    public function awardPoints(Request $request, LoyaltyAccount $loyaltyAccount): JsonResponse
    {
        $validated = $request->validate([
            'transaction_amount' => ['required', 'numeric', 'min:0'],
            'margin_coefficient' => ['required', 'numeric', 'min:0'],
        ]);

        $points = (int) round($validated['transaction_amount'] * $validated['margin_coefficient']);

        $loyaltyAccount->increment('points_balance', $points);
        $loyaltyAccount->increment('lifetime_points', $points);

        return response()->json([
            'awarded_points' => $points,
            'account' => $loyaltyAccount->fresh()->load('client:id,name,email'),
        ]);
    }

    public function redeemPoints(Request $request, LoyaltyAccount $loyaltyAccount): JsonResponse
    {
        $validated = $request->validate([
            'points' => ['required', 'integer', 'min:1'],
            'reward_label' => ['nullable', 'string', 'max:255'],
        ]);

        if ($loyaltyAccount->points_balance < $validated['points']) {
            return response()->json(['message' => 'Insufficient points'], 422);
        }

        $loyaltyAccount->decrement('points_balance', $validated['points']);

        return response()->json([
            'redeemed_points' => $validated['points'],
            'reward_label' => $validated['reward_label'] ?? null,
            'account' => $loyaltyAccount->fresh()->load('client:id,name,email'),
        ]);
    }
}
