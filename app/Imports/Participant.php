<?php

namespace App\Imports;

use App\Models\Participants;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class Participant implements ToCollection, ToModel, WithChunkReading
{
    private $current = 0;
    private $contestId;
    private $organizerId;
    public function __construct($contestId)
    {
        $this->contestId = $contestId;
    }

    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows) {}


    public function model(array $rows)
    {

        $this->current++;


        if ($this->current === 1) {
            return null;
        }

        // ✅ Skip empty or invalid rows
        if (
            empty($rows[0]) || // participant_no is required
            (count(array_filter($rows)) === 0) // entire row is empty
        ) {
            return null;
        }


        // 🔍 Check for duplicate participant number in this contest
        $existing = Participants::where('contest_id', $this->contestId)
            ->where('participant_no', $rows[0])->where('gender', $rows[5])
            ->first();

        if ($existing) {
            throw new \Exception("Some of participant number already exists in this contest.");
        }

        if ($this->current > 1) {
            Participants::create([
                // 'organizer_id' => $this->organizerId,
                'contest_id' => $this->contestId,
                'participant_no' => $rows[0],
                'first_name' => $rows[1],
                'last_name' => $rows[2],
                'description' => $rows[3],
                'age' => $rows[4],
                'gender' => $rows[5],
                'poster_url' => $this->uploadPoster($rows[6]),
            ]);
        }
    }

    public function chunkSize(): int
    {
        return 100;
    }

    public function uploadPoster($posterUrl)
    {
        // Check if a valid file path exists (you may add more validation)
        if (!empty($posterUrl) && file_exists($posterUrl)) {
            $posterName = uniqid() . '-' . basename($posterUrl); // Unique name for the file
            $posterPath = 'poster/' . $posterName;

            // Store the poster file in the 'public' disk
            Storage::disk('public')->putFileAs('poster', $posterUrl, $posterName);

            $posterPath = Storage::disk('cloudinary')
                ->put('poster', 'poster_url');

            // Return the stored poster path to save in the database
            return $posterPath;
        }

        // Return null if no file was provided
        return null;
    }
}
