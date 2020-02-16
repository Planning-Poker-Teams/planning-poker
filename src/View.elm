module View exposing (view)

import Model exposing (User, Model, Task, Page(..), Msg(..), State(..))
import Html exposing (..)
import Html.Attributes exposing (..)
import Views.LandingPage exposing (landingPageContent)
import Views.PokerRoomPage exposing (planningPokerPageContent)

ccLogoImg : Html Msg
ccLogoImg =
    img [ src "/cc-logo-white.fe97ef50.png"
        , style [( "width", "30%" ), ("text-align", "center"), ("margin-bottom", "40px") ]] []
        

view : Model -> Html Msg
view model =
    case model.activePage of
        LandingPage ->
            div [ class "flex flex-column full-height m0 p0" ]
                [ header [ class "px3 py4 center white p3 border-silver border-bottom bg-black" ]
                    [ h1 [ class "m0 h0-responsive mt2 mb0 bold" ] [ 
                        ccLogoImg
                        , br [] []
                        , text "Planning Poker" ]
                    ]
                , main_
                    [ class "flex-auto" ]
                    [ section [ class "container" ]
                        [ div
                            [ class "sm-col sm-col-3 p1 m0" ]
                            [ text "" ]
                        , div
                            [ class "sm-col sm-col-6 mt3 mb3 px2 border-silver p2" ]
                            [ landingPageContent model ]
                        ]
                    ]
                , footer [ class "p2 mb1 pt3 center gray border-silver" ]
                    []
                ]

        PlanningPokerRoom ->
            planningPokerPageContent model
