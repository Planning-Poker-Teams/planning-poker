module Views.Users exposing (usersView, logoutButton)

import Model exposing (User, Model, Msg(..))
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


logoutButton : Model -> Html Msg
logoutButton model =
    let
        user =
            model.user
    in
        button
            [ class "btn btn-outline"
            , onClick LeaveRoom
            ]
            [ i [ class "fa fa-sign-out mr1" ] []
            , text "Leave room"
            ]


usersView : Model -> Html Msg
usersView model =
    let
        currentUser =
            model.user

        allUsers =
            currentUser :: model.users

        sortedUsers =
            List.sortBy .name allUsers

        viewUserWithHighlight =
            viewUser currentUser
    in
        div []
            [ h3 [ class "mt1" ] [ text "Users" ]
            , ul [ class "list-reset" ] (List.map viewUserWithHighlight sortedUsers)
            ]


viewUser : User -> User -> Html msg
viewUser currentUser user =
    let
        cssClass =
            if user.hasEstimated then
                "mr1 fa fa-check-circle-o green"
            else if user.isSpectator then
                "mr1 fa fa-eye"
            else
                ""

        nameAddon =
            if currentUser.name == user.name then
                " (you)"
            else
                ""
    in
        li []
            [ i [ class cssClass ] []
            , text <| user.name ++ nameAddon
            ]
