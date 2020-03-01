```
   _____  _                   _                _____      _
   |  __ \| |                 (_)              |  __ \    | |
   | |__) | | __ _ _ __  _ __  _ _ __   __ _   | |__) |__ | | _____ _ __
   |  ___/| |/ _` | '_ \| '_ \| | '_ \ / _` |  |  ___/ _ \| |/ / _ \ '__|
   | |    | | (_| | | | | | | | | | | | (_| |  | |  | (_) |   <  __/ |
   |_|    |_|\__,_|_| |_|_| |_|_|_| |_|\__, |  |_|   \___/|_|\_\___|_|
                                        __/ |
                                       |___/
```

# Introduction

Planning Poker is a real-time application to help perform estimation sessions in agile teams working together remotely.

Join a room:
`npx wscat -c "wss://g5ktyisvyf.execute-api.eu-central-1.amazonaws.com/dev?name=Test&room=MyRoom&isSpectator=false"`

## Events

### `onConnect`, `onDisconnect`

Insert or remove user from `connections` table.

The new user receives a separate `userJoined` event for all other users in the current room. Also if an estimation is already running, the user receives the task (`startEstimation`) and information which users have already voted (`userHasEstimated`).

### `startEstimation`

### `estimate`

### `showResult`

# Architecture

```
                   API Gateway            Lambda               DynamoDB
                   (Websocket)
 ┌──────┐            ┌────┐            ┌───────────┐       ┌───────────────┐
 │Client│◀────┐      │    │            │           │   ┌──▶│ Participants  │
 └──────┘     │      │    │            │           │   │   └───────────────┘
 ┌──────┐   Messages │    │ Invocation │           │   │   ┌───────────────┐
 │Client│◀────┼─────▶│    │◀──────────▶│handleEvent│◀──┼──▶│     Rooms     │
 └──────┘     │      │    │            │           │   │   └───────────────┘
 ┌──────┐     │      │    │            │           │   │   ┌───────────────┐
 │ ...  │◀────┘      │    │            │           │   └──▶│  Estimations  │
 └──────┘            └────┘            └───────────┘       └───────────────┘
```

## Data model

Query use cases:

```typescript
// read queries:
fetchParticipant(connectionId: string): Promise<Participant?>
fetchRoom(roomName: string): Promise<Room?>
fetchEstimation(roomName: string, taskName: string): Promise<Estimation?>

// mutations:
enterRoom(participant: Participant) // creates new entry in Participants table
startNewEstimation(participant: Participant, taskName: string)
submitEstimation(participant: Participant, taskName: string, value: string)
```

### Participants

_Fetch user information by connectionId._

| Attribute    | Type                   | Description              |
| :----------- | :--------------------- | :----------------------- |
| connectionId | Partition Key (String) | ID of the connected user |
| roomName     | Attribute (String)     | Room name                |
| name         | Attribute (String)     | Name                     |
| isSpectator  | Attribute (Boolean)    | Is user a spectator?     |

### Rooms

_Fetch room details (list of all connectionIds, current task)._

| Attribute       | Type                   | Description                              |
| :-------------- | :--------------------- | :--------------------------------------- |
| roomName        | Partition Key (String) | Room name                                |
| participants    | List (String)          | `connectionId`s of all members in a room |
| currentTaskName | Attribute (String)     | Current task                             |

Modify list by appending/removing items using a [SET operation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.SET.UpdatingListElements)

### Estimations

_Retrieve all estimations by room and task._

| Attribute | Type                   | Description                             |
| :-------- | :--------------------- | :-------------------------------------- |
| roomName  | Partition Key (String) | Room name                               |
| taskName  | Sort Key (String)      | Task name                               |
| estimates | List (String)          | All estimates (`connectionId_estimate`) |

Update using SET operation.
