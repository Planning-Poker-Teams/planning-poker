module Update exposing (..)

import Globals exposing (planningPokerServerUrl)
import Model exposing (User, Task, Model, Page(..), Msg(..), State(..), HealthStatus(..), emptyTask)
import JsonCoding
    exposing
        ( decodePayload
        , requestStartEstimationEncoded
        , joinRoomEncoded
        , userEstimationEncoded
        , requestShowResultEncoded
        )
import WebSocket
import String exposing (isEmpty)
import Date exposing (now)


containsUser : List User -> User -> Bool
containsUser users user =
    (users
        |> List.filter (\u -> u.name == user.name)
        |> List.length
    )
        > 0


replaceUserInList : User -> List User -> List User
replaceUserInList userToReplace userList =
    List.map
        (\user ->
            if user.name == userToReplace.name then
                userToReplace
            else
                user
        )
        userList


resetEstimation : User -> User
resetEstimation user =
    { user | hasEstimated = False, estimation = Nothing }


sendPayload : Model -> String -> Cmd Msg
sendPayload model payload =
    WebSocket.send (planningPokerServerUrl model) payload


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetNewTaskName taskName ->
            ( { model | newTaskName = taskName }, Cmd.none )

        RequestJoinRoom user roomName ->
             ( model
             , sendPayload model <|
                 joinRoomEncoded user roomName
             )

        RequestStartEstimation task ->
            if String.isEmpty task.name then
                ( model, Cmd.none )
            else
                ( { model | newTaskName = "" }
                , sendPayload model <|
                    requestStartEstimationEncoded model.user task
                )

        TimerTick now ->
            let
                task =
                    Maybe.withDefault emptyTask model.currentTask

                start =
                    Date.toTime task.startDate
            in
                ( { model | elapsedTime = now - start }, Cmd.none )

        PerformEstimation estimate ->
            let
                user =
                    model.user

                task =
                    Maybe.withDefault emptyTask model.currentTask

                updatedUser =
                    { user
                        | hasEstimated = True
                        , estimation = Just estimate
                    }
            in
                ( { model | user = updatedUser }
                , sendPayload model <|
                    userEstimationEncoded updatedUser task
                )

        RequestShowResult ->
            ( model
            , sendPayload model <|
                requestShowResultEncoded model.user
            )

        SetRoomId newRoomId ->
            case model.roomJoined of
                True ->
                    -- logout when changing room while being logged in (browser back button)
                    ( { model
                        | roomJoined = False
                        , roomId = newRoomId
                        , activePage = LandingPage
                      }
                    , Cmd.none
                    )

                False ->
                    ( { model | roomId = newRoomId }, Cmd.none )

        SetUserName newName ->
            let
                user =
                    model.user

                updatedUser =
                    { user | name = newName }
            in
                ( { model | user = updatedUser }, Cmd.none )

        SetSpectator isSpectator ->
            let
                user =
                    model.user

                updatedUser =
                    { user | isSpectator = isSpectator }
            in
                ( { model | user = updatedUser }, Cmd.none )

        SetShowCats userWantsCats ->
            let
                user =
                    model.user

                updatedUser =
                    { user | showCats = userWantsCats }
            in
                ( { model | user = updatedUser }, Cmd.none )

        JoinRoom ->
            let
                formIsValid =
                    not (String.isEmpty model.roomId || String.isEmpty model.user.name)

                newPage =
                    if formIsValid then
                        PlanningPokerRoom
                    else
                        LandingPage

                updatedModel = 
                    { model
                    | roomJoined = formIsValid
                    , activePage = newPage
                    , users = []
                    }
            in
                if formIsValid then
                    update (RequestJoinRoom model.user model.roomId) updatedModel
                else
                    (updatedModel, Cmd.none)
                    

        LeaveRoom ->
            let
                user =
                    model.user

                updatedUser =
                    { user
                        | hasEstimated = False
                        , estimation = Nothing
                    }
            in
                ( { model
                    | roomJoined = False
                    , users = []
                    , currentEstimations = []
                    , elapsedTime = 0
                    , user = updatedUser
                    , currentTask = Nothing
                    , activePage = LandingPage
                    , uiState = Initial
                  }
                , Cmd.none
                )

        IncomingEvent payload ->
            let
                nextMessage =
                    decodePayload payload
            in
                update nextMessage model

        UnexpectedPayload message ->
            ( model, Cmd.none )

        UserJoined user ->
            let
                newUsers =
                    if containsUser model.users user then
                        replaceUserInList user model.users
                    else
                        user :: model.users
            in
                if user.name == model.user.name then
                    -- do not update current user
                    ( model, Cmd.none )
                else
                    ( { model | users = newUsers }, Cmd.none )

        UserLeft user ->
            let
                newUsers =
                    List.filter (\u -> u.name /= user.name) model.users
            in
                ( { model | users = newUsers }, Cmd.none )

        StartEstimation task ->
            let
                user =
                    model.user

                updatedUser =
                    { user | hasEstimated = False, estimation = Nothing }

                updatedUsers =
                    List.map resetEstimation model.users
            in
                ( { model
                    | uiState = Estimate
                    , currentTask = Just task
                    , user = updatedUser
                    , users = updatedUsers
                    , currentEstimations = []
                    , elapsedTime = 0
                  }
                , Cmd.none
                )

        UserHasEstimated user ->
            let
                updatedUsers =
                    replaceUserInList user model.users
            in
                if user.name == model.user.name then
                    ( model, Cmd.none )
                    -- ( { model | user = user }, Cmd.none )
                else
                    ( { model | users = updatedUsers }, Cmd.none )

        EstimationResult users ->
            ( { model
                | uiState = ShowResult
                , currentEstimations = users
              }
            , Cmd.none
            )
