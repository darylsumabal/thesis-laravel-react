<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use App\Models\Contest;
use App\Models\ContestParticipantPoster;
use App\Models\Event;
use App\Models\Score;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UpcomingEventController extends Controller
{
    //store contest
    public function store(Request $request, $eventId)
    {
        try {

            $organizerId = auth()->id();

            $event = Event::findOrFail($eventId);

            $validated = $request->validate([
                'contest_name' => 'required|string|min:1',
                'contest_description' => 'required|string|min:1',
                'contest_organizer' => 'required|string|min:1',
                'contest_scoring_type' => 'required|string|min:1',
                'contest_date' => 'required|string|min:1',
                'contest_type' => 'required|string|min:1',
                'contest_gender_category' => 'required|string|min:1',
                'contest_venue' => 'required|string|min:1',
                'contest_poster' => 'required|image|mimes:png,jpg,jpeg,svg,jfif,webp|max:20480',
            ]);

            $genderMapping = [
                'Male Only' => 'male',
                'Female Only' => 'female',
                'Male & Female' => 'maleFemale',
                'Mixed' => 'mixed',
                'Team' => 'team',
            ];

            $genderCategory = $genderMapping[$validated['contest_gender_category']] ?? null;
            $poster = $request->file('contest_poster');
            $posterName = uniqid() . '-' . $poster->getClientOriginalName();
            $posterPath = 'poster/' . $posterName;

            $poster->storeAs('poster', $posterName, 'public');
            
            Contest::create([
                'organizer_id' => $organizerId,
                'contest_name' => $validated['contest_name'],
                'contest_description' => $validated['contest_description'],
                'contest_organizer' => $validated['contest_organizer'],
                'contest_scoring_type' => $validated['contest_scoring_type'],
                'contest_gender_category' => $genderCategory,
                'contest_date' => $validated['contest_date'],
                'contest_type' => $validated['contest_type'],
                'contest_venue' => $validated['contest_venue'],
                'contest_poster' => $posterPath,
                'event_id' => $event->id
            ]);

            return redirect()->back()->with(
                'success',
                'Contest created successfully!'
            );
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(
                $e->getMessage()
            );
        }
    }

    //store contest
    public function storePoster(Request $request, $contestId)
    {

        try {
            // Validate
            $request->validate([
                'poster' => 'required|image|mimes:jpeg,png,jpg,webp|max:2097152'
            ]);

            // Find contest and its existing poster record
            // $contest = Contest::findOrFail($contestId);
            $existingPoster = ContestParticipantPoster::where('contest_id', $contestId)->first();

            // If old poster exists, delete it from storage
            if ($existingPoster && Storage::disk('public')->exists($existingPoster->poster_url)) {
                Storage::disk('public')->delete($existingPoster->poster_url);
            }

            // Upload new file
            $poster = $request->file('poster');
            $posterName = uniqid() . '-' . $poster->getClientOriginalName();
            $posterPath = 'poster/' . $posterName;
            $poster->storeAs('poster', $posterName, 'public');

            // Update or create poster record
            ContestParticipantPoster::updateOrCreate(
                ['contest_id' => $contestId],
                ['poster_url' => $posterPath]
            );

            return redirect()->back()->with('success', 'Poster updated successfully!');
        } catch (\Exception $e) {

            return redirect()->back()->with('error',  $e->getMessage());
        }
    }
}
