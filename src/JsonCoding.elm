module JsonCoding exposing (..)

import Model exposing (User, Task, Msg(..))
import Json.Decode as JD exposing (field, andThen)
import Json.Encode as JE exposing (encode)
import Date exposing (fromString)


stringToDate : JD.Decoder Date.Date
stringToDate =
    JD.string
        |> andThen
            (\val ->
                case Date.fromString val of
                    Err err ->
                        JD.fail err

                    Ok date ->
                        JD.succeed date
            )


payloadDecoder : JD.Decoder Msg
payloadDecoder =
    (field "eventType" JD.string)
        |> andThen
            (\eventType ->
                case eventType of
                    "userJoined" ->
                        JD.map UserJoined
                            (JD.map5 User
                                (field "userName" JD.string)
                                (field "isSpectator" JD.bool)
                                (JD.succeed False)
                                (JD.succeed False)
                                (JD.succeed Nothing)
                            )

                    "userLeft" ->
                        JD.map UserLeft
                            (JD.map5 User
                                (field "userName" JD.string)
                                (JD.succeed False)
                                (JD.succeed False)
                                (JD.succeed False)
                                (JD.succeed Nothing)
                            )

                    "startEstimation" ->
                        JD.map StartEstimation
                            (JD.map2 Task
                                (field "taskName" JD.string)
                                (field "startDate" stringToDate)
                            )

                    "userHasEstimated" ->
                        JD.map UserHasEstimated
                            (JD.map5 User
                                (field "userName" JD.string)
                                (JD.succeed False)
                                (JD.succeed True)
                                (JD.succeed False)
                                (JD.succeed Nothing)
                            )

                    "estimationResult" ->
                        -- startDate/endDate
                        JD.map EstimationResult
                            (JD.at
                                [ "estimates" ]
                                (JD.list
                                    (JD.map5 User
                                        (field "userName" JD.string)
                                        (JD.succeed False)
                                        (JD.succeed True)
                                        (JD.succeed False)
                                        (JD.maybe (field "estimate" JD.string))
                                    )
                                )
                            )

                    _ ->
                        JD.fail (eventType ++ " is not a recognized event type")
            )


decodePayload : String -> Msg
decodePayload payload =
    case JD.decodeString payloadDecoder payload of
        Err err ->
            UnexpectedPayload err

        Ok msg ->
            msg

joinRoomEncoded : User -> String -> String
joinRoomEncoded user roomName =
    let
        list =
            [ ( "eventType", JE.string "joinRoom" )
            , ( "userName", JE.string user.name )
            , ( "roomName", JE.string roomName )
            , ( "isSpectator", JE.bool user.isSpectator )
            ]
    in
        list |> JE.object |> JE.encode 0

requestStartEstimationEncoded : User -> Task -> String
requestStartEstimationEncoded user task =
    let
        list =
            [ ( "eventType", JE.string "startEstimation" )
            , ( "userName", JE.string user.name )
            , ( "taskName", JE.string task.name )
            ]
    in
        list |> JE.object |> JE.encode 0


userEstimationEncoded : User -> Task -> String
userEstimationEncoded user task =
    let
        estimation =
            Maybe.withDefault "" user.estimation

        list =
            [ ( "eventType", JE.string "estimate" )
            , ( "userName", JE.string user.name )
            , ( "taskName", JE.string task.name )
            , ( "estimate", JE.string estimation )
            ]
    in
        list |> JE.object |> JE.encode 0


requestShowResultEncoded : User -> String
requestShowResultEncoded user =
    let
        list =
            [ ( "eventType", JE.string "showResult" )
            , ( "userName", JE.string user.name )
            ]
    in
        list |> JE.object |> JE.encode 0
