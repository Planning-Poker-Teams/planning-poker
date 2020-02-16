module Model exposing (..)

import Time exposing (Time)
import Date exposing (Date)


type Page
    = LandingPage
    | PlanningPokerRoom


type State
    = Initial
    | Estimate
    | ShowResult


type HealthStatus
    = Healthy
    | Zombie


type alias User =
    { name : String
    , isSpectator : Bool
    , hasEstimated : Bool
    , showCats : Bool
    , estimation : Maybe String
    }


type alias Task =
    { name : String
    , startDate : Date
    }


type alias Model =
    { activePage : Page
    , uiState : State
    , roomId : String
    , newTaskName : String
    , roomJoined : Bool
    , input : String
    , messages : List String
    , user : User
    , users : List User
    , currentEstimations : List User
    , currentTask : Maybe Task
    , elapsedTime : Time
    }


init : ( Model, Cmd Msg )
init =
    ( Model
        LandingPage
        Initial
        ""
        ""
        False
        ""
        []
        emptyUser
        []
        []
        Nothing
        0
    , Cmd.none
    )


type Msg
    = SetUserName String
    | SetSpectator Bool
    | SetShowCats Bool
    | SetRoomId String
    | SetNewTaskName String
    | JoinRoom
    | LeaveRoom
    | TimerTick Time
    | SendRoomDataTick Time
    | IncomingEvent String
      -- IncomingEvent is being decoded and mapped to these:
    | UnexpectedPayload String
    | UserJoined User
    | UserLeft User
    | StartEstimation Task
    | UserHasEstimated User
    | EstimationResult (List User)
      -- Messages that trigger outgoing messages:
    | RequestJoinRoom User String
    | RequestStartEstimation Task
    | PerformEstimation String
    | RequestShowResult


emptyTask : Task
emptyTask =
    Task "" (Date.fromTime 0)


emptyUser : User
emptyUser =
    (User "" False False True Nothing)
