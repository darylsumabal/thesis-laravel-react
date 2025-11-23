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
        Schema::create('judging_scores', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('contest_id');
            $table->foreign('contest_id')->references('contest_id')->on('scores')->onDelete('cascade');

            $table->string('round')->nullable();
            $table->string('criteria');
            $table->string('evaluation_criteria');
            $table->integer('score');

            $table->string('group_id');
            $table->foreign('group_id')->references('group_id')->on('scores')->onDelete('cascade');

            $table->unsignedBigInteger('judges_id');
            $table->foreign('judges_id')->references('judge_id')->on('contest_judges')->onDelete('cascade');

            $table->morphs('participant');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('judging_scores');
    }
};
