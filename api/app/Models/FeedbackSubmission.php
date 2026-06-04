<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'name',
        'surname',
        'email',
        'feedback',
        'firestore_id',
        'source',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}

