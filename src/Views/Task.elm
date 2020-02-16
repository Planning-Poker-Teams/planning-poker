module Views.Task exposing (taskView)

import Model exposing (User, Model, Task, Page(..), Msg(..), State(..), emptyTask)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Date exposing (fromTime)
import Time exposing (inSeconds, inMinutes)


formatTimeComponent : Int -> String
formatTimeComponent number =
    if number < 10 then
        "0" ++ toString number
    else
        toString number


taskView : Model -> Html Msg
taskView model =
    let
        user =
            model.user

        task =
            Maybe.withDefault emptyTask model.currentTask

        minutes =
            rem (floor <| inMinutes model.elapsedTime) 60

        seconds =
            rem (floor <| inSeconds model.elapsedTime) 60

        elapsedTime =
            (formatTimeComponent minutes) ++ ":" ++ (formatTimeComponent seconds)

        startEstimationView =
            Html.form
                [ class "flex flex-center"
                , onSubmit <|
                    RequestStartEstimation <|
                        Task model.newTaskName (Date.fromTime 0)
                ]
                [ input
                    [ type_ "text"
                    , placeholder "Task name"
                    , class "flex-auto col-3 input m1"
                    , onInput SetNewTaskName
                    , value model.newTaskName
                    ]
                    []
                , button
                    [ class "btn btn-outline m1"
                    , type_ "submit"
                    ]
                    [ i [ class "fa fa-play mr1" ] []
                    , text "Start"
                    ]
                ]

        showResultView =
            div []
                [ button
                    [ class "btn btn-outline m1"
                    , onClick RequestShowResult
                    ]
                    [ i [ class "fa fa-eye mr1" ] []
                    , text "Show result"
                    ]
                ]

        estimatingView =
            div [ class "flex" ]
                [ h2 [ class "flex-auto m1 " ] [ text task.name ]
                , h2 [ class "m1" ] [ text elapsedTime, i [ class "fa fa-clock-o ml1" ] [] ]
                , showResultView
                ]
    in
        case model.uiState of
            Initial ->
                startEstimationView

            Estimate ->
                estimatingView

            ShowResult ->
                startEstimationView
