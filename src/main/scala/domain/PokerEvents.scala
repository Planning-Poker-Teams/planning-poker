package domain

import akka.actor.ActorRef

case class PokerMessage(sender: String, text: String)

object SystemMessage {
  def apply(text: String) = PokerMessage("System", text)
}

sealed trait PokerEvent

case class IncomingMessage(sender: String,
                           message: String) extends PokerEvent

case class UserJoined(userName: String,
                      userActor: ActorRef,
                      isSpectator: Boolean = false,
                      eventType: String = "userJoined") extends PokerEvent

case class UserLeft(userName: String,
                    eventType: String = "userLeft") extends PokerEvent

case class RequestStartEstimation(userName: String,
                                  taskName: String,
                                  startDate: String,
                                  eventType: String = "startEstimation") extends PokerEvent

case class UserEstimate(userName: String,
                        taskName: String,
                        estimate: String,
                        eventType: String = "estimate") extends PokerEvent

case class UserHasEstimated(userName: String,
                            taskName: String,
                            eventType: String = "userHasEstimated") extends PokerEvent

case class RequestShowEstimationResult(userName: String,
                                       eventType: String = "showResult") extends PokerEvent

case class EstimationResult(taskName: String,
                            startDate: String,
                            endDate: String,
                            estimates: List[UserEstimation],
                            eventType: String = "estimationResult") extends PokerEvent

case class UserEstimation(userName: String, estimate: String) extends PokerEvent

case class HeartBeat(eventType: String = "keepAlive") extends PokerEvent
