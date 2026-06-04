<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommunicationLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['required', 'exists:clients,id'],
            'channel' => ['required', 'in:email,sms,whatsapp'],
            'recipient_address' => ['required', 'string', 'max:255'],
            'message_body' => ['required', 'string'],
            'status' => ['nullable', 'in:pending,queued,sent,delivered,failed'],
            'provider_message_id' => ['nullable', 'string', 'max:255'],
            'error_telemetry' => ['nullable', 'string'],
            'sent_at' => ['nullable', 'date'],
        ];
    }
}
