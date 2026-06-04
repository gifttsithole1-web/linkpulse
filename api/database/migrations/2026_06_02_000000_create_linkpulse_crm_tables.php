<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("DO $$ BEGIN CREATE TYPE client_relation_type AS ENUM ('retail', 'corporate'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;");
            DB::statement("DO $$ BEGIN CREATE TYPE message_channel_type AS ENUM ('email', 'sms', 'whatsapp'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;");
            DB::statement("DO $$ BEGIN CREATE TYPE dispatch_status_type AS ENUM ('pending', 'queued', 'sent', 'delivered', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;");
        }

        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('email')->unique();
            $table->string('phone_number', 50);
            $table->enum('account_type', ['retail', 'corporate'])->default('retail');
            $table->json('brand_specs')->nullable();
            $table->json('it_infrastructure')->nullable();
            $table->timestamps();
        });

        Schema::create('loyalty_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->integer('points_balance')->default(0);
            $table->string('tier_level', 50)->default('Bronze');
            $table->integer('lifetime_points')->default(0);
            $table->timestamps();
            $table->check('points_balance >= 0');
        });

        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->enum('channel', ['email', 'sms', 'whatsapp']);
            $table->string('recipient_address');
            $table->text('message_body');
            $table->enum('status', ['pending', 'queued', 'sent', 'delivered', 'failed'])->default('pending');
            $table->string('provider_message_id')->nullable();
            $table->text('error_telemetry')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index('status');
            $table->index('client_id');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->index('account_type');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_logs');
        Schema::dropIfExists('loyalty_accounts');
        Schema::dropIfExists('clients');

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS dispatch_status_type;');
            DB::statement('DROP TYPE IF EXISTS message_channel_type;');
            DB::statement('DROP TYPE IF EXISTS client_relation_type;');
        }
    }
};
