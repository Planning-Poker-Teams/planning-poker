module Views.Estimations exposing (estimationView)

import Model exposing (User, Model, Task, Page(..), Msg(..), State(..), emptyTask)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Dict exposing (..)
import Dict.Extra exposing (groupBy)
import String


possibleEstimations : List String
possibleEstimations =
    [ "0", "1", "2", "3", "5", "8", "13", "20", "40", "100", "???" ]


estimationView : Model -> Html Msg
estimationView model =
    case model.uiState of
        Initial ->
            div [] [ h3 [ class "m0" ] [ text "Start estimating for a new task ⤴" ] ]

        Estimate ->
            let
                task =
                    Maybe.withDefault emptyTask model.currentTask

                buttons =
                    List.map
                        (\estimate ->
                            estimationButton estimate model
                        )
                        possibleEstimations

                estimationView =
                    div [ class "estimation-button-container" ] buttons

                spectatorView =
                    div [] [ h2 [] [ text "Estimation is running..." ] ]

                view =
                    if model.user.isSpectator then
                        spectatorView
                    else
                        estimationView
            in
                div []
                    [ view
                    ]

        ShowResult ->
            let
                task =
                    Maybe.withDefault emptyTask model.currentTask

                estimationGroups =
                    groupBy (\e -> Maybe.withDefault "" e.estimation) model.currentEstimations

                keys =
                    Dict.keys estimationGroups

                keysSortedDescending =
                    List.sortWith
                        (\a b ->
                            let
                                getVoteCount : String -> Int
                                getVoteCount key =
                                    List.length <| Maybe.withDefault [] <| Dict.get key estimationGroups
                            in
                                compare (getVoteCount b) (getVoteCount a)
                        )
                        keys

                rows =
                    List.map
                        (\key ->
                            let
                                votes =
                                    Maybe.withDefault [] (Dict.get key estimationGroups)

                                userNames =
                                    String.join ", " <| List.map (\user -> user.name) votes

                                userIcons =
                                    List.map (\u -> i [ class "fa fa-user" ] []) votes
                            in
                                tr []
                                    [ td [] [ text key ]
                                    , td [] userIcons
                                    , td [] [ text userNames ]
                                    ]
                        )
                        keysSortedDescending

                isConsensus =
                    Dict.size estimationGroups == 1

                consensusView =
                    case (isConsensus && model.user.showCats) of
                        True ->
                            div
                                [ class "cat-container" ]
                                [ img [ src "http://thecatapi.com/api/images/get?format=src&type=gif" ] []
                                ]

                        False ->
                            div [] [ text "" ]
            in
                div [ class "estimation-container" ]
                    [ table [ class "table-light overflow-hidden rounded" ]
                        [ thead [ class "bg-darken-1" ]
                            [ tr []
                                [ th [] [ text "Complexity" ]
                                , th [] [ text "Count" ]
                                , th [] [ text "Users" ]
                                ]
                            ]
                        , tbody [] rows
                        ]
                    , consensusView
                    ]


estimationButton : String -> Model -> Html Msg
estimationButton estimate model =
    let
        currentEstimation =
            Maybe.withDefault "" model.user.estimation

        buttonClass =
            if currentEstimation == estimate then
                "bg-green btn-primary"
            else
                "btn-outline"
    in
        button
            [ class ("btn " ++ buttonClass)
            , onClick (PerformEstimation estimate)
            ]
            [ text estimate ]
