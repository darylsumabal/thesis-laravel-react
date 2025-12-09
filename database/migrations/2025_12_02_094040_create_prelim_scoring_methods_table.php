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
        Schema::create('prelim_scoring_methods', function (Blueprint $table) {
            $table->id();
            $table->string('group_id');
            $table->index('group_id');
            $table->unsignedBigInteger('contest_id');
            $table->foreign('contest_id')->references('id')->on('contests')->onDelete('cascade');
            $table->string('preliminary_method')->nullable();
            $table->string('contest_name')->nullable();
            $table->string('weight')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prelim_scoring_methods');
    }
};
