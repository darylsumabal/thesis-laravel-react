<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class TopParticipantsUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public $contestId;
    public $groupId;

    public function __construct($contestId, $groupId)
    {
        $this->contestId = $contestId;
        $this->groupId = $groupId;
    }

    public function broadcastWith(): array
    {
        return [
            'contestId' => $this->contestId,
            'groupId' => $this->groupId,
            'timestamp' => now()->timestamp,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('top-participants'),
        ];
    }
}
