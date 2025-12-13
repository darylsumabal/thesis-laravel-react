<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        // return Inertia::render('Account/Index', []);
        $accounts = User::with('contest')
        ->where('accountType', 'JUDGE')
        ->paginate(10)
        ->withQueryString();

        // return response()->json(['account' => $account]);
        return Inertia::render('account/Index', [
            'account' => $accounts
        ]);
    }

    public function indexUser()
    {

        $account = User::select('id', 'name', 'email', 'accountType')
            ->get();
        return response()->json(['account' => $account]);
    }


    public function storeJudge(Request $request)
    {
        $validate = $request->validate(
            [
                'name' => 'string|required',
                'email' => 'string|email',
                'accountType' => 'string|required',
                'password' => [
                    'required',
                    'confirmed',
                    Password::min(6)
                ],
                'panelRole' => 'string|required',
                'contest_id' => 'nullable|string',
            ]
        );

        $judgeExist = User::where('email', $validate['email'])->exists();

        if ($judgeExist) {
            return back()->withErrors(
                'Account already exist!',
            );
        }

        User::create([
            'name' => $validate['name'],
            'email' => $validate['email'],
            'role' => $validate['panelRole'],
            'accountType' =>  $validate['accountType'],
            'password' => bcrypt($validate['password']),
            'contest_id' => $validate['contest_id'],
        ]);


        return redirect()->back()->with('success', 'Account created');
    }

    public function store(Request $request)
    {

        $validate = $request->validate([
            'name' => 'required|string|min:1',
            'email' => "required|string|email|min:1|unique:accounts,email",
            'accountType' => 'required|string|min:1',
            'password' => [
                'required',
                'confirmed',
                Password::min(6)
            ]
        ]);

        $user = User::create([
            'name' => $validate['name'],
            'email' => $validate['email'],
            'accountType' => $validate['accountType'],
            // 'role' => $validate['panelRole'],
            'password' => bcrypt($validate['password']),
        ]);

        return response()->json(['message' =>
        'Account created', 'account' => $user], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $account = User::findOrFail($id);
        return response()->json(['account' => $account]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $account = User::findOrFail($id);

        $validated = $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::min(6)
            ]
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $account->update($validated);

        return response()->json(['message' => 'Account update successfully'], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $account = User::findOrFail($id);
        $account->delete();
        return redirect()->back()->with('success', 'Account deleted successfully');
    }
}
