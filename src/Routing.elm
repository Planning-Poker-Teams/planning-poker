module Routing exposing (delta2url, url2messages)

import Model exposing (Model, Msg(SetRoomId))
import RouteUrl.Builder as Builder exposing (Builder, builder, path, newEntry, modifyEntry, replacePath)
import RouteUrl exposing (UrlChange)
import Navigation exposing (Location)


-- update URL according to changes in the model:


delta2url : Model -> Model -> Maybe UrlChange
delta2url previous current =
    Maybe.map Builder.toUrlChange <|
        delta2builder previous current


delta2builder : Model -> Model -> Maybe Builder
delta2builder previousModel currentModel =
    let
        path =
            -- if freshly joining, force pushing a new history entry for browser back to work properly.
            if not previousModel.roomJoined && currentModel.roomJoined then
                [ currentModel.roomId, "" ]
            else
                [ currentModel.roomId ]
    in
        builder
            |> newEntry
            |> replacePath path
            |> Just



-- parse URL and convert to messages:


url2messages : Location -> List Msg
url2messages location =
    builder2messages (Builder.fromUrl location.href)


builder2messages : Builder -> List Msg
builder2messages builder =
    case path builder of
        first :: rest ->
            [ SetRoomId first ]

        _ ->
            []
