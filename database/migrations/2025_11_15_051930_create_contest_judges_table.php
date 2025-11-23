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
        Schema::create('contest_judges', function (Blueprint $table) {
            $table->id();
            $table->string('group_id');
            $table->index('group_id');
            $table->unsignedBigInteger('judge_id');
            $table->foreign('judge_id')->references('id')->on('users')->onDelete('cascade');
            $table->unsignedBigInteger('contest_id');
            $table->foreign('contest_id')->references('id')->on('contests')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::table('contest_judges', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contest_judges');
    }
};
