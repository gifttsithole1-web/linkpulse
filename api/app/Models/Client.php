<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company_name',
        'email',
        'phone_number',
        'account_type',
        'brand_specs',
        'it_infrastructure',
        'marketing_opt_in',
        'source',
        'pipeline_stage',
    ];

    protected $casts = [
        'brand_specs' => 'array',
        'it_infrastructure' => 'array',
    ];

    public function loyaltyAccount(): HasOne
    {
        return $this->hasOne(LoyaltyAccount::class);
    }

    public function communicationLogs(): HasMany
    {
        return $this->hasMany(CommunicationLog::class);
    }

    public function feedbackSubmissions(): HasMany
    {
        return $this->hasMany(FeedbackSubmission::class);
    }
}
