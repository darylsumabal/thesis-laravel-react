<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = User::with('contest')
            ->where('accountType', 'JUDGE')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('account/Index', [
            'account' => $accounts,
        ]);
    }


    public function update(Request $request, $judgeId)
    {
        try {
            // ✅ Validate request data
            $validated = $request->validate([
                'name' => 'string|nullable',
                'panelRole' => 'string|nullable',
                'judgeNumber' => 'string|nullable',
            ]);

            // ✅ Find the event
            $account = User::findOrFail($judgeId);

            // ✅ Update the event
            $account->update([
                'name' => $validated['name'] ?? $account->name,
                'role' => $validated['panelRole'] ?? $account->role,
                'judge_number' => $validated['judgeNumber'] ?? $account->judge_number,

            ]);

            return redirect()->back()->with('success', 'Account updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('message', $e->getMessage());
        }
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
