<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestEdit implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /**
     * Create a new event instance.
     */

    public $contestId;
    public $groupId;
    public $judgeId;
    public $judgeName;
    public $action;
    public function __construct($contestId, $groupId, $judgeId, $judgeName, $action)
    {
        $this->contestId = $contestId;
        $this->groupId = $groupId;
        $this->judgeId = $judgeId;
        $this->judgeName = $judgeName;
        $this->action = $action;
    }

    public function broadcastWith(): array
    {
        return [
            'contestId' => $this->contestId,
            'groupId' => $this->groupId,
            'judgeId' => $this->judgeId,
            'judgeName' => $this->judgeName,
            'action' => $this->action,
            'timestamp' => now()->timestamp,
        ];
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('request-edit'),
        ];
    }
}
