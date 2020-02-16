import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import akka.http.scaladsl.server.Directives._
import services.PlanningPokerService

import scala.util.{Failure, Success}

object Server extends App {
  implicit val actorSystem: ActorSystem = ActorSystem("akka-system")
  implicit val flowMaterializer: ActorMaterializer = ActorMaterializer()

  val config = actorSystem.settings.config
  val interface = config.getString("app.interface")
  val port = config.getInt("app.port")

  val route = get {
    PlanningPokerService.route
  }

  import actorSystem.dispatcher

  val binding = Http().bindAndHandle(route, interface, port)

  binding.onComplete {
    case Success(_) =>
      println(s"Server is now running at http://$interface:$port")

    case Failure(e) =>
      println(s"Binding failed with ${e.getMessage}")
      actorSystem.terminate()
  }
}
