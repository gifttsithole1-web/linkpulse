<?php

namespace App\Jobs;

use App\Mail\WeeklyProductUpdateMail;
use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendWeeklyProductUpdatesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $headline = 'LinkPulse Weekly Updates',
        public string $body = "Here are this week's updates:\n\n- New CRM improvements\n- Faster proofing approvals\n- Better messaging insights"
    ) {
    }

    public function handle(): void
    {
        Client::query()
            ->where('marketing_opt_in', true)
            ->whereNotNull('email')
            ->chunkById(200, function ($clients) {
                foreach ($clients as $client) {
                    $unsubscribeUrl = url('/unsubscribe?email='.urlencode($client->email));
                    Mail::to($client->email)->queue(
                        new WeeklyProductUpdateMail(
                            headline: $this->headline,
                            body: $this->body,
                            unsubscribeUrl: $unsubscribeUrl
                        )
                    );
                }
            });
    }
}

