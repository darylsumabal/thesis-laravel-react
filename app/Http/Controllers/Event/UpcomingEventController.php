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
    public function index()
    {
        $event = Event::where('is_archived', 0)->get();

        if ($event->isEmpty()) {
            return response()->json([
                'events' => [],
                'message' => 'No events are currently'
            ], 200);
        }

        return response()->json(['events' => $event], 200);
    }

    public function indexOrganizer($organizerId, $eventId = null)
    {

        $query = Event::where('organizer_id', $organizerId);

        if ($eventId) {
            $query->where('id', $eventId);
        }

        $event = $query->get();


        if ($event->isEmpty()) {
            return response()->json(['message' => 'No events are currently', 'events' => []], 200);
        }
        $start = microtime(true);

        $event = $query->get();

        $serverTime = (microtime(true) - $start) * 1000; // ms

        return response()->json(['events' => $event,    'query_time_ms' => $serverTime], 200);
    }

    public function indexOrganizerTable($organizerId, $eventId = null)
    {

        $query = Event::where('organizer_id', $organizerId)->where('is_archived', 0);

        if ($eventId) {
            $query->where('id', $eventId);
        }

        $event = $query->get();


        if ($event->isEmpty()) {
            return response()->json(['message' => 'No events are currently', 'events' => []], 200);
        }
        $start = microtime(true);

        $event = $query->get();

        $serverTime = (microtime(true) - $start) * 1000;
        return response()->json(['events' => $event, 'query_time_ms' => $serverTime], 200);
    }

    public function indexArchivedEvent($organizerId)
    {

        $query = Event::where('organizer_id', $organizerId)->where('is_archived', 1);

        $event = $query->get();

        if ($event->isEmpty()) {
            return response()->json(['message' => 'No events are currently', 'events' => []], 200);
        }

        return response()->json(['events' => $event], 200);
    }

    public function archivedEvent($eventId)
    {
        Event::where('id', $eventId)->update([
            'is_archived' => 1,
        ]);

        return response()->json(['message' => 'Archive successfully!']);
    }


    public function restoreArchivedEvent($eventId)
    {
        Event::where('id', $eventId)->update([
            'is_archived' => 0,
        ]);

        return response()->json(['message' => 'Archive restore successfully!']);
    }


    public function indexJudges($judgeId, $eventId = null)
    {
        $query = Score::with(['contest.event']);

        // Filter by judge ID
        $query->whereHas('judges', function ($query) use ($judgeId) {
            $query->where('judge_id', $judgeId);
        });

        // If an eventId is provided, filter by event ID as well
        if ($eventId) {
            $query->whereHas('contest.event', function ($query) use ($eventId) {
                $query->where('id', $eventId);
            });
        }

        $scores = $query->get();

        // Extract the unique events
        $events = $scores->pluck('contest.event')->unique('id')->values();

        // If no scores are found, return an empty response
        if ($scores->isEmpty()) {
            return response()->json(['message' => 'No events found for this judge', 'events' => []], 200);
        }

        return response()->json(['events' =>  $events], 200);
    }

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
            return redirect()->back()->with(
                'error',
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


    public function poster($contestId)
    {

        // if (!$poster || !file_exists(public_path($poster->poster))) {
        //     abort(404, 'Poster not found');
        // }


        // return response()->json([
        //     'url' => asset($poster->poster)
        // ]);
    }

    //destroy event or delete
    public function destroy($id)
    {

        $event = Event::findOrFail($id);
        $imagePath = $event->poster;

        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        $event->delete();
        return response()->json(['message' => 'Event deleted'], 200);
    }
}
