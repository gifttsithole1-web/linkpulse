<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'points_balance',
        'tier_level',
        'lifetime_points',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
