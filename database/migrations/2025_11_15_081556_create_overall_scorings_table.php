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
        Schema::create('overall_scorings', function (Blueprint $table) {
            $table->id();

            $table->string('group_id');
            $table->foreign('group_id')->references('group_id')->on('score_judgings')->cascadeOnDelete();

            $table->unsignedBigInteger('contest_id');
            $table->foreign('contest_id')->references('contest_id')->on('score_judgings')->cascadeOnDelete();

            $table->unsignedBigInteger('judges_id');
            $table->foreign('judges_id')->references('judges_id')->on('judging_scores')->cascadeOnDelete();

            $table->morphs('participant');
            $table->string('round')->nullable();
            $table->string('criteria')->nullable();

            $table->decimal('rank', 10, 2)->nullable();
            $table->decimal('score', 10, 2)->nullable();

            $table->decimal('total_rank', 10, 2)->nullable();

            $table->decimal('total', 10, 2)->nullable();
            $table->decimal('total_points', 10, 2)->nullable();
            $table->decimal('final_rank', 10, 2)->nullable();

            $table->string('type');

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overall_scorings');
    }
};
