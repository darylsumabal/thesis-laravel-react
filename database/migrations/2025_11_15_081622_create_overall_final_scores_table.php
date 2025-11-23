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
        Schema::create('overall_final_scores', function (Blueprint $table) {
            $table->id();

            $table->string('group_id');
            $table->foreign('group_id')->references('group_id')->on('score_judgings')->cascadeOnDelete();
            $table->unsignedBigInteger('judges_id')->nullable();
            $table->foreign('judges_id')->references('judges_id')->on('judging_scores')->cascadeOnDelete();
            $table->unsignedBigInteger('contest_id');
            $table->foreign('contest_id')->references('contest_id')->on('score_judgings')->cascadeOnDelete();

            $table->morphs('participant');
            $table->string('criteria')->nullable();
            $table->decimal('score', 10, 2)->nullable();
            $table->decimal('round_score', 10, 2)->nullable();
            $table->decimal('total', 10, 2)->nullable();

            $table->decimal('final_rank', 10, 2)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overall_final_scores');
    }
};
