<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = Setting::query()->pluck('value', 'key');

        return response()->json([
            'default_margin_coefficient' => (float) ($rows['default_margin_coefficient'] ?? 0.1),
            'weekly_updates_enabled' => filter_var(
                $rows['weekly_updates_enabled'] ?? true,
                FILTER_VALIDATE_BOOLEAN
            ),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'default_margin_coefficient' => ['sometimes', 'numeric', 'min:0'],
            'weekly_updates_enabled' => ['sometimes', 'boolean'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? 'true' : 'false') : (string) $value]
            );
        }

        return $this->index();
    }
}
