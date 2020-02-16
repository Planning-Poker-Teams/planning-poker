module Main exposing (..)

import Model exposing (Page(..), User, Task, Model, Msg(..), init)
import Update exposing (update)
import Subscriptions exposing (subscriptions)
import Routing exposing (delta2url, url2messages)
import RouteUrl exposing (RouteUrlProgram, UrlChange)
import View exposing (view)


main : RouteUrlProgram Never Model Msg
main =
    RouteUrl.program
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        , delta2url = delta2url
        , location2messages = url2messages
        }
