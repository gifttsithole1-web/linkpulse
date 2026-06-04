<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 20), 500);
        $clients = Client::with('loyaltyAccount')->latest()->paginate($perPage);

        return response()->json($clients);
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = Client::create($request->validated());

        $client->loyaltyAccount()->create([
            'points_balance' => 0,
            'lifetime_points' => 0,
            'tier_level' => 'Bronze',
        ]);

        return response()->json($client->load('loyaltyAccount'), 201);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json($client->load([
            'loyaltyAccount',
            'communicationLogs' => fn ($query) => $query->latest('created_at'),
            'feedbackSubmissions' => fn ($query) => $query->latest(),
        ]));
    }

    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $client->update($request->validated());

        return response()->json($client->fresh()->load('loyaltyAccount'));
    }

    public function destroy(Client $client): JsonResponse
    {
        $client->delete();

        return response()->json(['message' => 'Client deleted']);
    }
}
