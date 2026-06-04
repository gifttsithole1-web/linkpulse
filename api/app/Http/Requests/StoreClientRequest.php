<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:clients,email'],
            'phone_number' => ['required', 'string', 'max:50'],
            'account_type' => ['nullable', 'in:retail,corporate'],
            'brand_specs' => ['nullable', 'array'],
            'it_infrastructure' => ['nullable', 'array'],
        ];
    }
}
