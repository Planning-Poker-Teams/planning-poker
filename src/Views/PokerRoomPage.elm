module Views.PokerRoomPage exposing (planningPokerPageContent)

import Views.Task exposing (taskView)
import Views.Estimations exposing (estimationView)
import Views.Users exposing (usersView, logoutButton)
import Model exposing (Model, Msg)
import Html exposing (..)
import Html.Attributes exposing (..)

ccLogoSmall : Html Msg
ccLogoSmall =
    img [ src "/cc-logo-small.251dbbdd.png" ] []

planningPokerPageContent : Model -> Html Msg
planningPokerPageContent model =
    div [ class "flex flex-column full-height m0 p0 " ]
        [ header [ class "white mt0 p1 border-silver border-bottom bg-black mb1" ]
            [ h1 [ class "m0 h0-responsive mt0 mb0 bold" ] [ ccLogoSmall, text " Planning Poker" ]
            ]
        , main_ [ class "md-flex flex-auto container" ]
            [ section [ class "md-flex sm-col sm-col-2 flex-column" ]
                [ div [ class "flex-auto p1" ] [ usersView model ]
                , div [ class "p1" ] [ logoutButton model ]
                ]
            , section [ class "flex flex-auto flex-column sm-col sm-col-9" ]
                [ div [ class "" ] [ taskView model ]
                , div [ class "flex-auto p1" ] [ estimationView model ]
                ]
            ]
        , footer [] []
        ]