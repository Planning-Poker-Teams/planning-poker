package domain

import akka.actor.ActorSystem

object PokerRooms {
  var pokerRooms: Map[String, PokerRoom] = Map.empty[String, PokerRoom]

  def findOrCreate(roomId: String)(implicit actorSystem: ActorSystem): PokerRoom =
    pokerRooms.getOrElse(roomId, createNewPokerRoom(roomId))

  private def createNewPokerRoom(roomId: String)(implicit actorSystem: ActorSystem): PokerRoom = {
    val pokerRoom = PokerRoom(roomId)
    pokerRooms += roomId -> pokerRoom
    pokerRoom
  }
}
