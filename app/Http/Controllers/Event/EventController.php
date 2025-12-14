<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use App\Models\Contest;
use App\Models\ContestParticipantPoster;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventController extends Controller
{

    public function indexOrganizerTable()
    {
        $organizerId = auth()->id();

        // Base query
        $baseQuery = Event::where('organizer_id', $organizerId);

        // Active events
        $eventQuery = clone $baseQuery;
        // if ($eventId) {
        //     $eventQuery->where('id', $eventId);
        // }

        $events = $eventQuery
        ->where('is_archived', 0)
        ->paginate(10)
        ->withQueryString();

        // If empty, still return Inertia — avoid early JSON return
        // (better for consistency)
        $archivedEvents = (clone $baseQuery)
            ->where('is_archived', 1)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('event/IndexTable', [
            'event' => $events,
            'archiveEvent' => $archivedEvents,
            'organizerId' => $organizerId
        ]);
    }

    public function show($eventId)
    {

        $organizerId = auth()->id();
        $query = Event::where('organizer_id', $organizerId);

        if ($eventId) {
            $query->where('id', $eventId);
        }

        $event = $query->get();

        $queryContest = Contest::where('organizer_id', $organizerId)->where('event_id', $eventId)->where('is_archived', 0)->with('event');

        $contest = $queryContest->paginate(10)->withQueryString();

        $archivedContest =  Contest::where('organizer_id', $organizerId)->where('event_id', $eventId)->where('is_archived', 1)->with('event');

        $archived = $archivedContest->paginate(10)->withQueryString();

        return Inertia::render('event/IndexCard', [
            'event' => $event,
            'eventId' => $eventId,
            'contest' => $contest,
            'archiveContest' => $archived,
        ]);
    }


    public function archivedEvent($eventId)
    {
        Event::where('id', $eventId)->update([
            'is_archived' => 1,
        ]);
        return redirect()->back()->with('success', 'Event archived successfully');
    }

    public function restoreArchivedEvent($eventId)
    {
        Event::where('id', $eventId)->update([
            'is_archived' => 0,
        ]);

        return redirect()->back()->with('success', 'Event restored successfully');
    }

    public function destroy($id)
    {

        $event = Event::findOrFail($id);
        $imagePath = $event->poster;

        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        $event->delete();


        return redirect()->back()->with('success', 'Event deleted successfully');
    }


    public function update(Request $request, $eventId)
    {
        try {
            // ✅ Validate request data
            $validated = $request->validate([
                'name' => 'required|string|min:1',
                'description' => 'required|string|min:1',
                'date' => 'required|date',
                'organizer' => 'required|string|min:1',
                'venue' => 'required|string|min:1',
                'address' => 'required|string|min:1',
                'poster' => 'nullable|image|mimes:png,jpg,jpeg,jfif|max:20480'
            ]);

            // ✅ Find the event
            $event = Event::findOrFail($eventId);

            // ✅ Handle poster upload
            if ($request->hasFile('poster')) {
                $poster = $request->file('poster');
                $posterName = uniqid() . '-' . $poster->getClientOriginalName();
                $posterPath = 'poster/' . $posterName;

                // store in storage/app/public/poster/
                $poster->storeAs('poster', $posterName, 'public');

                // ✅ Delete old poster if exists
                if ($event->poster && Storage::disk('public')->exists($event->poster)) {
                    Storage::disk('public')->delete($event->poster);
                }

                // ✅ Update new poster path
                $validated['poster'] = $posterPath;
            }

            // ✅ Update the event
            $event->update([
                'name' => $validated['name'] ?? $event->name,
                'description' => $validated['description'] ?? $event->description,
                'date' => $validated['date'] ?? $event->date,
                'organizer' => $validated['organizer'] ?? $event->organizer,
                'address' => $validated['address'] ?? $event->address,
                'venue' => $validated['venue'] ?? $event->venue,
                'poster' => $validated['poster'] ?? $event->poster,
            ]);

            return redirect()->back()->with('success', 'Event updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('message', $e->getMessage());
        }
    }
}
