<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client')->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('clients', 'email')->ignore($clientId)],
            'phone_number' => ['sometimes', 'required', 'string', 'max:50'],
            'account_type' => ['sometimes', 'in:retail,corporate'],
            'brand_specs' => ['nullable', 'array'],
            'it_infrastructure' => ['nullable', 'array'],
            'marketing_opt_in' => ['sometimes', 'boolean'],
            'pipeline_stage' => ['sometimes', 'in:lead,quote,won,production'],
        ];
    }
}
