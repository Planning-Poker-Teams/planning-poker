module Globals exposing (planningPokerServerUrl)

import Model exposing (Model)


planningPokerServerUrl : Model -> String
planningPokerServerUrl model =
    let
        roomId =
            model.roomId

        name =
            model.user.name

        isSpectator =
            toString model.user.isSpectator
    in
        ("wss://planningpoker.cc/poker/" ++ roomId ++ "?name=" ++ name ++ "&spectator=" ++ isSpectator)
