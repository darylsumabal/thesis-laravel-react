<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AddEventController extends Controller
{
    public function store(Request $request)
    {
        $organizerId = auth()->id();
        $validate = $request->validate([
            'name' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'date' => 'required|date',
            'organizer' => 'required|string|min:1',
            'venue' => 'required|string|min:1',
            'address' => 'required|string|min:1',
            'poster' => 'nullable|image|mimes:png,jpg,jpeg,jfif|max:20480'
        ]);

        $poster = $request->file('poster');
        $posterName = uniqid() . '-' . $poster->getClientOriginalName();
        $posterPath = 'poster/' . $posterName;

        $poster->storeAs('poster', $posterName, 'public');


        Event::create([
            'organizer_id' => $organizerId,
            'name' => $validate['name'],
            'description' => $validate['description'],
            'date' => $validate['date'],
            'organizer' => $validate['organizer'],
            'address' => $validate['address'],
            'venue' => $validate['venue'],
            'poster' => $posterPath
        ]);

        return redirect()->back()->with('success', 'Event created successfully');
    }

   
}
