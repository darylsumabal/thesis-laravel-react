<?php

namespace App\Imports;

use App\Models\TeamParticipants;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class TeamParticipant implements ToCollection, ToModel, WithChunkReading
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


    public function model(array $row)
    {
        $this->current++;



        if ($this->current === 1) {
            return null;
        }

        // ✅ Skip empty or invalid rows
        if (
            empty($row[0]) || // participant_no is required
            (count(array_filter($row)) === 0) // entire row is empty
        ) {
            return null;
        }


        if ($this->current > 1) {
            TeamParticipants::create([
                // 'organizer_id' => $this->organizerId,
                'contest_id' => $this->contestId,
                'team_participant_no' => $row[0],
                'team_name' => $row[1],
                'team_description' => $row[2],
                'team_captain' => $row[3],
                'poster_url' => $this->uploadPoster($row[4]),
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

            // Return the stored poster path to save in the database
            return $posterPath;
        }

        // Return null if no file was provided
        return null;
    }
}
