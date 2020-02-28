package services

import akka.actor.ActorSystem
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import domain.PokerRooms

object PlanningPokerService {
  def route(implicit actorSystem: ActorSystem): Route =
    pathPrefix("poker" / """[a-zA-Z0-9]{2,32}""".r) { roomId =>
      parameters('name, 'spectator ? false) { (userName, isSpectator) =>
        handleWebSocketMessages(
          PokerRooms.findOrCreate(roomId).websocketFlow(userName, isSpectator)
        )
      }
    }
}
