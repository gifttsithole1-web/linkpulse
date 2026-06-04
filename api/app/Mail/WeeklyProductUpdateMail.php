<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WeeklyProductUpdateMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $headline,
        public string $body,
        public string $unsubscribeUrl
    ) {
    }

    public function build()
    {
        return $this
            ->subject($this->headline)
            ->view('emails.weekly-product-update');
    }
}

