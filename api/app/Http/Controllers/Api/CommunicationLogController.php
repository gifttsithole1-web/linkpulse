<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommunicationLogRequest;
use App\Models\CommunicationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunicationLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = CommunicationLog::query()
            ->with('client:id,name,email,company_name,account_type')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('channel'), fn ($query) => $query->where('channel', $request->string('channel')))
            ->when($request->filled('client_id'), fn ($query) => $query->where('client_id', $request->integer('client_id')))
            ->latest('created_at')
            ->paginate(50);

        return response()->json($logs);
    }

    public function store(StoreCommunicationLogRequest $request): JsonResponse
    {
        $log = CommunicationLog::create($request->validated());

        return response()->json($log, 201);
    }
}
