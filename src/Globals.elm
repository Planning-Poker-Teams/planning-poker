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
      -- todo handle spectators
        ("wss://g4okhizsx0.execute-api.eu-central-1.amazonaws.com/staging")
        --("wss://planningpoker.cc/poker/" ++ roomId ++ "?name=" ++ name ++ "&spectator=" ++ isSpectator)
