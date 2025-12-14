<?php

namespace App\Http\Controllers\Contest;

use App\Http\Controllers\Controller;
use App\Imports\Participant;
use App\Imports\TeamParticipant;
use App\Models\Contest;
use App\Models\Participants;
use App\Models\TeamParticipants;
use App\Traits\HasParticipants;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\ContestParticipantPoster;
use Inertia\Inertia;

class ContestController extends Controller
{

    use HasParticipants;


    public function indexContest($eventId, $contestId)
    {
        $organizerId = auth()->id();

        $contest = Contest::where('organizer_id', $organizerId)->where('id', $contestId)->where('event_id', $eventId)->with('event')->get();

        $queryContestType = Contest::where('organizer_id', $organizerId)->where('id', $contestId)->where('event_id', $eventId)->value('contest_type');

        $poster = ContestParticipantPoster::where('contest_id', $contestId)->value('poster_url');

        return Inertia::render('contest/card/IndexCard', [
            'contest' => $contest,
            'contestType' => $queryContestType,
            'participants' => $this->getParticipantsByContest($contestId),
            'poster' => $poster ?? "",
            'storeParticipantUrl' => route('contest.participant.store', ['contestId' => $contestId]),
        ]);
    }


    public function archivedContest($contestId)
    {
        Contest::where('id', $contestId)->update([
            'is_archived' => 1,
        ]);

        return redirect()->back()->with('success', 'Contest archived successfully');
    }

    public function archivedRestoreContest($contestId)
    {
        Contest::where('id', $contestId)->update([
            'is_archived' => 0,
        ]);

        return redirect()->back()->with('success', 'Contest archived restore successfully');
    }

    public function destroyParticipant($contestId, string $id)
    {
        $participant = Participants::where('contest_id', $contestId)->where('id', $id)->firstOrFail();


        $imagePath = $participant->poster_url;

        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        $participant->delete();
        return redirect()->back()->with('success', 'Participant deleted successfully');
    }

    public function destroyTeamParticipant($contestId, string $id)
    {
        $participant = TeamParticipants::where('contest_id', $contestId)->where('id', $id)->firstOrFail();

        $imagePath = $participant->poster_url;

        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        $participant->delete();
        return redirect()->back()->with('success', 'Participant deleted successfully');
    }

    public function storeImportParticipant(Request $request, $contestId,  $participantType = 'participant')
    {
        try {

            $contest = Contest::where('id', $contestId)->firstOrFail();

            if ($participantType === 'participant') {
                Excel::import(new Participant($contest->id), $request->file('excel_file'));
            } else {
                Excel::import(new TeamParticipant($contest->id), $request->file('excel_file'));
            }

            return redirect()->back()->with('success', 'Participant imported');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function storeParticipant(Request $request, $contestId)
    {
        try {
            $contest = Contest::findOrFail($contestId);

            $validated = $request->validate([
                'participant_no' => 'required|string|min:1',
                'first_name' => 'required|string|min:1',
                'last_name' => 'required|string|min:1',
                'description' => 'string|nullable',
                'age' => 'string|nullable',
                'gender' => 'required|string|min:1',
                'poster_url' => 'nullable'
            ]);

            // Check if participant already exists
            $existingParticipant = Participants::where('contest_id', $contest->id)
                ->where('participant_no', $validated['participant_no'])
                ->where('gender', $validated['gender'])
                ->first();

            if ($existingParticipant) {
                return redirect()->back()->withErrors('A participant with this number already exists in this contest.');
            }

            // Handle file upload
            $posterPath = null;
            if ($request->hasFile('poster_url')) {
                $poster = $request->file('poster_url');
                $posterName = uniqid() . '-' . $poster->getClientOriginalName();
                $posterPath = 'poster/' . $posterName;
                $poster->storeAs('poster', $posterName, 'public');
            }

            // Create participant
            Participants::create([
                'contest_id' => $contest->id,
                'participant_no' => $validated['participant_no'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'description' => $validated['description'],
                'age' => $validated['age'],
                'gender' => $validated['gender'],
                'poster_url' => $posterPath,
            ]);

            return redirect()->back()->with([
                'success' => 'Participant created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateParticipant(Request $request, $contestId, $participantId)
    {

        try {
            // ✅ Ensure contest exists
            $contest = Contest::where('id', $contestId)->firstOrFail();

            // ✅ Ensure participant exists
            $participant = Participants::where('contest_id', $contest->id)
                ->where('id', $participantId)
                ->firstOrFail();

            $validated = $request->validate([
                'participant_no' => 'required|string|min:1',
                'first_name' => 'required|string|min:1',
                'last_name' => 'required|string|min:1',
                'description' => 'string|nullable',
                'age' => 'string|nullable',
                'gender' => 'required|string|min:1',
                'poster_url' => 'nullable'
            ]);

            // ✅ Check if team_participant_no is already used by another team
            $existingParticipant = Participants::where('contest_id', $contest->id)
                ->where('participant_no', $validated['participant_no'])
                ->where('gender', $validated['gender'])
                ->first();

            if ($existingParticipant) {
                return redirect()->back()->withErrors('A participant with this number already exists in this contest.');
            }

            // ✅ Handle poster upload
            $posterPath = $participant->poster_url; // keep old poster by default
            if ($request->hasFile('poster_url')) {
                $poster = $request->file('poster_url');
                $posterName = uniqid() . '-' . $poster->getClientOriginalName();
                $posterPath = 'poster/' . $posterName;
                $poster->storeAs('poster', $posterName, 'public');

                // delete old poster if exists
                if ($participant->poster_url && Storage::disk('public')->exists($participant->poster_url)) {
                    Storage::disk('public')->delete($participant->poster_url);
                }
            }

            // ✅ Update participant
            $participant->update([
                'participant_no' => $validated['participant_no'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'description' => $validated['description'],
                'age' => $validated['age'],
                'gender' => $validated['gender'],
                'poster_url' => $posterPath,
            ]);

            return redirect()->back()->with('success', 'Participant updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function storeTeamParticipant(Request $request, $contestId)
    {
        try {
            $contest = Contest::where('id', $contestId)->firstOrFail();
            $validated = $request->validate([
                'team_participant_no' => 'required|string|min:1',
                'team_name' => 'required|string|min:1',
                'team_description' => 'string|nullable',
                'team_captain' => 'string|nullable',
                'poster_url' => 'nullable'
            ]);

            // ✅ Check if team_participant_no already exists in this contest
            $existingParticipant = TeamParticipants::where('contest_id', $contest->id)
                ->where('team_participant_no', $validated['team_participant_no'])
                ->first();

            if ($existingParticipant) {
                return redirect()->back()->withErrors('A team with this participant number already exists in this contest.');
            }

            // ✅ Handle poster upload
            $posterPath = null;
            if ($request->hasFile('poster_url')) {
                $poster = $request->file('poster_url');
                $posterName = uniqid() . '-' . $poster->getClientOriginalName();
                $posterPath = 'poster/' . $posterName;
                $poster->storeAs('poster', $posterName, 'public');
            }

            // ✅ Create new participant
            TeamParticipants::create([
                'contest_id' => $contest->id,
                'team_participant_no' => $validated['team_participant_no'],
                'team_name' => $validated['team_name'],
                'team_description' => $validated['team_description'],
                'team_captain' => $validated['team_captain'],
                'poster_url' => $posterPath,
            ]);

            return redirect()->back()->with('success', 'Team Participant added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }


    public function updateTeamParticipant(Request $request, $contestId, $participantId)
    {
        try {
            // ✅ Ensure contest exists
            $contest = Contest::where('id', $contestId)->firstOrFail();

            // ✅ Ensure participant exists
            $participant = TeamParticipants::where('contest_id', $contest->id)
                ->where('id', $participantId)
                ->firstOrFail();

            $validated = $request->validate([
                'team_participant_no' => 'required|string|min:1',
                'team_name' => 'required|string|min:1',
                'team_description' => 'string|nullable',
                'team_captain' => 'string|nullable',
                'poster_url' => 'nullable'
            ]);

            // ✅ Check if team_participant_no is already used by another team
            $existingParticipant = TeamParticipants::where('contest_id', $contest->id)
                ->where('team_participant_no', $validated['team_participant_no'])
                ->first();

            if ($existingParticipant) {
                return redirect()->back()->withErrors('A team with this participant number already exists in this contest.');
            }

            // ✅ Handle poster upload
            $posterPath = $participant->poster_url; // keep old poster by default
            if ($request->hasFile('poster_url')) {
                $poster = $request->file('poster_url');
                $posterName = uniqid() . '-' . $poster->getClientOriginalName();
                $posterPath = 'poster/' . $posterName;
                $poster->storeAs('poster', $posterName, 'public');

                // delete old poster if exists
                if ($participant->poster_url && Storage::disk('public')->exists($participant->poster_url)) {
                    Storage::disk('public')->delete($participant->poster_url);
                }
            }

            // ✅ Update participant
            $participant->update([
                'team_participant_no' => $validated['team_participant_no'],
                'team_name' => $validated['team_name'],
                'team_description' => $validated['team_description'],
                'team_captain' => $validated['team_captain'],
                'poster_url' => $posterPath,
            ]);


            return redirect()->back()->with('success', 'Team participant updated successfully.');
        } catch (\Exception $e) {

            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function updateContest(Request $request, $contestId)
    {
        try {
            $contest = Contest::findOrFail($contestId);

            $validated = $request->validate([
                'contest_name' => 'required|string|min:1',
                'contest_description' => 'required|string|min:1',
                'contest_organizer' => 'required|string|min:1',
                'contest_date' => 'required|string|min:1',
                'contest_venue' => 'required|string|min:1',
                'contest_poster' => 'nullable|image|mimes:png,jpg,jpeg,svg,jfif,webp|max:20480',
            ]);

            if ($request->hasFile('contest_poster')) {
                $poster = $request->file('contest_poster');
                $posterName = uniqid() . '-' . $poster->getClientOriginalName();
                $posterPath = 'poster/' . $posterName;

                // store in storage/app/public/poster/
                $poster->storeAs('poster', $posterName, 'public');

                // ✅ Delete old poster if exists
                if ($contest->poster && Storage::disk('public')->exists($contest->poster)) {
                    Storage::disk('public')->delete($contest->poster);
                }

                // ✅ Update new poster path
                $validated['contest_poster'] = $posterPath;
            }
            $contest->update([
                'contest_name' => $validated['contest_name'] ?? $contest->contest_name,
                'contest_description' => $validated['contest_description'] ?? $contest->contest_description,
                'contest_organizer' => $validated['contest_organizer'] ?? $contest->contest_organizer,
                'contest_date' => $validated['contest_date'] ?? $contest->contest_date,
                'contest_venue' => $validated['contest_venue'] ?? $contest->contest_venue,
                'contest_poster' => $validated['contest_poster'] ?? $contest->contest_poster,
            ]);

            return redirect()->back()->with('success', 'Contest updated successfully');
        } catch (\Exception $e) {

            return redirect()->back()->with('success', $e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        $contest = Contest::findOrFail($id);
        $imagePath = $contest->contest_poster;

        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
        $contest->delete();

        return redirect()->back()->with('success', 'Contest deleted successfully');
    }
}
