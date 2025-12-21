<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contests', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('organizer_id');
            $table->foreign('organizer_id')->references('id')->on('users')->cascadeOnDelete();

            $table->string('contest_name');
            $table->string('contest_description');
            $table->string('contest_organizer');
            $table->string('contest_scoring_type');
            $table->string('contest_date');
            $table->string('contest_type');
            $table->string('contest_gender_category')->nullable();
            $table->string('contest_venue');
            $table->string('contest_poster');
            $table->unsignedBigInteger('event_id');
            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Schema::dropIfExists('contests');
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('contests');
        Schema::enableForeignKeyConstraints();
    }
};
