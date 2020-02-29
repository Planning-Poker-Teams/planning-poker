package domain

import akka.actor.{Actor, ActorLogging, ActorRef}
import akka.http.scaladsl.model.DateTime

import scala.collection.immutable.Map

class PokerRoomActor(roomId: String) extends Actor with ActorLogging {
  type Estimations = Map[String, Map[String, String]]
  type UserMap = Map[String, ActorRef]

  var participants: UserMap = Map.empty[String, ActorRef]
  var spectators: UserMap = Map.empty[String, ActorRef]
  var estimations: Estimations = Map.empty[String, Map[String, String]]

  def receive = idle

  def idle: Receive = {
    case UserJoined(name, actorRef, isSpectator, _) =>
      val updatedUsers = handleUserJoined(participants,
        spectators,
        None,
        None,
        name,
        isSpectator,
        actorRef)
      participants = updatedUsers._1
      spectators = updatedUsers._2
      log.info(s"[$roomId] User $name joined room (spectator: $isSpectator).")

    case UserLeft(name, _) =>
      val updatedUsers = handleUserLeft(participants, spectators, name)
      participants = updatedUsers._1
      spectators = updatedUsers._2
      log.info(s"[$roomId] User $name left room")

    case RequestStartEstimation(name, taskName, _, _) =>
      log.info(s"[$roomId] $name initiated an estimation for '$taskName'")
      estimations = removeTaskEstimations(taskName)
      val estimationStart = DateTime.now
      broadcast(
        RequestStartEstimation(name,
          taskName,
          estimationStart.toIsoDateTimeString()))
      context.become(estimating(taskName, estimationStart))

    case _ =>
      log.info(s"Invalid message received")
  }

  def estimating(currentTask: String, estimationStart: DateTime): Receive = {
    case UserJoined(name, actorRef, isSpectator, _) =>
      val updatedUsers = handleUserJoined(participants,
        spectators,
        Some(currentTask),
        Some(estimationStart),
        name,
        isSpectator,
        actorRef)
      participants = updatedUsers._1
      spectators = updatedUsers._2
      log.info(s"[$roomId] User $name joined room during an ongoing estimation (spectator: $isSpectator).")

    case UserLeft(name, _) => {
      val updatedUsers = handleUserLeft(participants, spectators, name)
      participants = updatedUsers._1
      spectators = updatedUsers._2

      // remove estimations
      estimations = removeUserEstimation(currentTask, name)
      if (outstandingEstimations(currentTask).isEmpty) {
        context.become(
          finishedEstimating(currentTask, estimationStart, DateTime.now))
      }
      log.info(s"[$roomId] User $name left room during estimation.")
    }

    case UserEstimate(name, taskName, estimation, _) => {
      if (!isParticipant(name)) {
        log.info(s"[$roomId] cannot save estimate. User is spectator.")
      } else if (taskName == currentTask) {
        estimations = insertEstimation(taskName, (name, estimation))
        broadcast(UserHasEstimated(name, taskName))
        log.info(s"[$roomId] User $name estimated $estimation for $currentTask")

        if (outstandingEstimations(taskName).isEmpty) {
          context.become(finishedEstimating(currentTask, estimationStart, DateTime.now))
        }
      } else {
        log.info(
          s"[$roomId] cannot save estimate for $taskName. Current task is $currentTask")
      }
    }

    case RequestShowEstimationResult(name, _) =>
      log.info(s"Cannot show results. There are still outstanding votes.")
  }

  def finishedEstimating(task: String,
                         estimationStart: DateTime,
                         estimationEnd: DateTime): Receive = {

    case UserJoined(name, actorRef, isSpectator, _) => {
      val updatedUsers = handleUserJoined(participants,
        spectators,
        Some(task),
        Some(estimationStart),
        name,
        isSpectator,
        actorRef)
      participants = updatedUsers._1
      spectators = updatedUsers._2
      log.info(s"[$roomId] User $name joined room (spectator: $isSpectator).")
      context.become(estimating(task, estimationStart))
    }

    case UserLeft(name, _) => {
      val updatedUsers = handleUserLeft(participants, spectators, name)
      participants = updatedUsers._1
      spectators = updatedUsers._2
      log.info(s"[$roomId] User $name left room after estimation.")
    }

    case UserEstimate(name, taskName, estimation, _) => {
      if (!isParticipant(name)) {
        log.info(s"[$roomId] cannot save estimate. User is spectator.")
      } else if (taskName == task) {
        estimations = insertEstimation(taskName, (name, estimation))
        log.info(s"[$roomId] User $name estimated $estimation for $task (has changed their mind)")
      } else {
        log.info(s"[$roomId] cannot save estimate for $taskName. Current task is $task")
      }
    }

    case RequestShowEstimationResult(name, _) => {
      val estimates = estimations.getOrElse(task, Map.empty[String, String])
      val estimatesList = estimates.keys.toList.map(userName =>
        UserEstimation(userName, estimates.getOrElse(userName, "")))

      broadcast(
        EstimationResult(task,
          estimationStart.toIsoDateTimeString(),
          estimationEnd.toIsoDateTimeString(),
          estimatesList))

      log.info(s"[$roomId] finishing estimation with result: $estimates")
      context.become(idle)
    }
  }

  private def handleUserJoined(participants: UserMap,
                               spectators: UserMap,
                               task: Option[String],
                               estimationStart: Option[DateTime],
                               newUser: String,
                               isSpectator: Boolean,
                               actorRef: ActorRef): (UserMap, UserMap) = {
    broadcast(UserJoined(newUser, actorRef, isSpectator))
    participants.foreach(p => actorRef ! UserJoined(p._1, p._2))
    spectators.foreach(p =>
      actorRef ! UserJoined(p._1, p._2, isSpectator = true))

    // update participants or spectators
    val users = isSpectator match {
      case false => (participants + (newUser -> actorRef), spectators)
      case true => (participants, spectators + (newUser -> actorRef))
    }

    // broadcast current task and estimation status
    task match {
      case Some(justTask) => {
        actorRef ! RequestStartEstimation(
          "",
          justTask,
          estimationStart.getOrElse(DateTime.now).toIsoDateTimeString())
        currentEstimations(justTask).foreach(estimation =>
          actorRef ! UserHasEstimated(estimation._1, justTask))
        users
      }
      case None => users
    }
  }

  private def handleUserLeft(participants: UserMap,
                             spectators: UserMap,
                             user: String): (UserMap, UserMap) = {
    broadcast(UserLeft(user))

    // remove users from participants or spectators
    (participants - user, spectators - user)
  }

  def broadcast(message: PokerEvent) = {
    participants.values.foreach(_ ! message)
    spectators.values.foreach(_ ! message)
  }

  private def allActors: List[ActorRef] =
    participants.keys.toList.flatMap(participants.get)

  private def isParticipant(userName: String): Boolean =
    participants.contains(userName)

  private def previousEstimations(currentTask: String): Estimations =
    estimations.filter(_._1 != currentTask)

  private def currentEstimations(currentTask: String): Map[String, String] =
    estimations.getOrElse(currentTask, Map.empty[String, String])

  private def outstandingEstimations(currentTask: String): UserMap =
    participants.filter(p => !currentEstimations(currentTask).keys.toList.contains(p._1))

  private def insertEstimation(currentTask: String,
                               estimation: (String, String)): Estimations = {
    val newEstimations = currentEstimations(currentTask) - estimation._1 + (estimation._1 -> estimation._2)
    estimations - currentTask + (currentTask -> newEstimations)
  }

  private def removeTaskEstimations(taskName: String): Estimations = {
    estimations - taskName
  }

  private def removeUserEstimation(taskName: String,
                                   userName: String): Estimations = {
    val newEstimations = currentEstimations(taskName) - userName
    estimations - taskName + (taskName -> newEstimations)
  }
}
