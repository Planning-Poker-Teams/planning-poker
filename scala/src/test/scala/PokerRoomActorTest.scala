import akka.actor.{ActorRef, ActorSystem, Props}
import akka.testkit.{TestActors, TestKit}
import domain._
import org.scalatest._
import akka.testkit.TestProbe

import scala.concurrent.duration._

class PokerRoomActorTest
  extends TestKit(ActorSystem("test-system"))
    with WordSpecLike
    with Matchers
    with BeforeAndAfterAll {

  override def afterAll = {
    shutdown()
  }

  "User handling" should {
    val roomRef =
      system.actorOf(Props(classOf[PokerRoomActor], "user-test-room"))
    val userA = TestProbe()
    val userB = TestProbe()
    val userC = TestProbe()

    "ignore invalid messages" in {
      within(100 millis) {
        roomRef ! "hi"
        expectNoMsg
      }
    }

    "broadcast other participants when users join" in {
      roomRef ! UserJoined("userA", userA.ref)
      roomRef ! UserJoined("userB", userB.ref)

      // send other user
      userA.expectMsg(UserJoined("userB", userB.ref))
      userB.expectMsg(UserJoined("userA", userA.ref))

      roomRef ! UserJoined("userC", userC.ref)
      // broadcast new user
      userA.expectMsg(UserJoined("userC", userC.ref))
      userB.expectMsg(UserJoined("userC", userC.ref))

      // send other users to new user
      userC.expectMsgAllOf(
        UserJoined("userA", userA.ref),
        UserJoined("userB", userB.ref)
      )
    }

    "broadcast when users leave" in {
      roomRef ! UserLeft("userB")
      userA.expectMsg(UserLeft("userB"))
      userC.expectMsg(UserLeft("userB"))

      roomRef ! UserLeft("userA")
      userC.expectMsg(UserLeft("userA"))

      roomRef ! UserLeft("userC")
    }
  }

  "Estimation handling" should {
    val roomRef =
      system.actorOf(Props(classOf[PokerRoomActor], "estimation-test-room"))
    val userA = TestProbe()
    val userB = TestProbe()
    val userC = TestProbe()
    val userD = TestProbe()

    "setup" in {
      roomRef ! UserJoined("userA", userA.ref)
      roomRef ! UserJoined("userB", userB.ref)
      roomRef ! UserJoined("userC", userC.ref)

      userB.expectMsgAllOf(
        UserJoined("userA", userA.ref),
        UserJoined("userC", userC.ref)
      )

      userA.expectMsgAllOf(
        UserJoined("userB", userB.ref),
        UserJoined("userC", userC.ref)
      )

      userC.expectMsgAllOf(
        UserJoined("userA", userA.ref),
        UserJoined("userB", userB.ref)
      )
    }

    "broadcast start of estimation" in {
      roomRef ! RequestStartEstimation("userA",
        "new-task",
        "20150102T13:37:00")

      val check: PartialFunction[Any, Boolean] = {
        case RequestStartEstimation("userA", "new-task", _, _) => true
      }

      userA.expectMsgPF(500 millis)(check)
      userB.expectMsgPF(500 millis)(check)
      userC.expectMsgPF(500 millis)(check)
    }

    "send current estimation to new user" in {
      roomRef ! UserJoined("userD", userD.ref)

      userA.expectMsg(UserJoined("userD", userD.ref))
      userB.expectMsg(UserJoined("userD", userD.ref))
      userC.expectMsg(UserJoined("userD", userD.ref))

      userD.expectMsgAllOf(
        UserJoined("userA", userA.ref),
        UserJoined("userB", userB.ref),
        UserJoined("userC", userC.ref)
      )

      userD.expectMsgPF(100 millis)({
        case RequestStartEstimation("", "new-task", _, _) => true
      })
    }

    "receive estimations and broadcast them" in {
      roomRef ! UserEstimate("userA", "new-task", "5")

      userA.expectMsg(UserHasEstimated("userA", "new-task"))
      userB.expectMsg(UserHasEstimated("userA", "new-task"))
      userC.expectMsg(UserHasEstimated("userA", "new-task"))
      userD.expectMsg(UserHasEstimated("userA", "new-task"))
    }

    "not send estimation values when there are outstanding votes" in {
      roomRef ! RequestShowEstimationResult("userA")

      userA.expectNoMsg(100 millis)
      userB.expectNoMsg(100 millis)
      userC.expectNoMsg(100 millis)
      userD.expectNoMsg(100 millis)
    }

    "let all users estimate and broadcasts estimation status" in {
      roomRef ! UserEstimate("userB", "new-task", "20")
      roomRef ! UserEstimate("userC", "new-task", "1")
      roomRef ! UserEstimate("userD", "new-task", "2")

      userA.expectMsgAllOf(
        UserHasEstimated("userB", "new-task"),
        UserHasEstimated("userC", "new-task"),
        UserHasEstimated("userD", "new-task")
      )

      userB.expectMsgAllOf(
        UserHasEstimated("userB", "new-task"),
        UserHasEstimated("userC", "new-task"),
        UserHasEstimated("userD", "new-task")
      )

      userC.expectMsgAllOf(
        UserHasEstimated("userB", "new-task"),
        UserHasEstimated("userC", "new-task"),
        UserHasEstimated("userD", "new-task")
      )

      userD.expectMsgAllOf(
        UserHasEstimated("userB", "new-task"),
        UserHasEstimated("userC", "new-task"),
        UserHasEstimated("userD", "new-task")
      )
    }

    "send estimations on request when all users have estimated" in {
      roomRef ! RequestShowEstimationResult("userA")

      val check: PartialFunction[Any, Boolean] = {
        case EstimationResult("new-task", _, _, estimations, _) => {
          assert(estimations.length == 4)
          estimations should contain theSameElementsAs List(
            UserEstimation("userA", "5"),
            UserEstimation("userB", "20"),
            UserEstimation("userC", "1"),
            UserEstimation("userD", "2")
          )

          true
        }
      }

      userA.expectMsgPF(500 millis)(check)
      userB.expectMsgPF(500 millis)(check)
      userC.expectMsgPF(500 millis)(check)
      userD.expectMsgPF(500 millis)(check)
    }
  }

  "Estimation with spectator" should {
    val roomRef = system.actorOf(
      Props(classOf[PokerRoomActor], "estimation-test-room-spectators"))
    val userA = TestProbe()
    val userB = TestProbe()
    val userC = TestProbe()
    val spectator = TestProbe()

    "setup" in {
      roomRef ! UserJoined("userA", userA.ref)
      roomRef ! UserJoined("userB", userB.ref)
      roomRef ! UserJoined("spectator", spectator.ref, isSpectator = true)

      userB.expectMsgAllOf(
        UserJoined("userA", userA.ref, isSpectator = false),
        UserJoined("spectator", spectator.ref, isSpectator = true)
      )

      userA.expectMsgAllOf(
        UserJoined("userB", userB.ref, isSpectator = false),
        UserJoined("spectator", spectator.ref, isSpectator = true)
      )

      spectator.expectMsgAllOf(
        UserJoined("userA", userA.ref, isSpectator = false),
        UserJoined("userB", userB.ref, isSpectator = false)
      )
    }

    "spectators are sent to new users" in {
      roomRef ! UserJoined("userC", userC.ref)

      userC.expectMsgAllOf(
        UserJoined("userA", userA.ref, isSpectator = false),
        UserJoined("userB", userB.ref, isSpectator = false),
        UserJoined("spectator", spectator.ref, isSpectator = true)
      )

      userA.expectMsg(UserJoined("userC", userC.ref))
      userB.expectMsg(UserJoined("userC", userC.ref))
      spectator.expectMsg(UserJoined("userC", userC.ref))

      roomRef ! UserLeft("userC")
      userA.expectMsg(UserLeft("userC"))
      userB.expectMsg(UserLeft("userC"))
      spectator.expectMsg(UserLeft("userC"))
    }

    "spectator can initiate estimation, but cannot vote" in {
      roomRef ! RequestStartEstimation("spectator",
        "new-task",
        "20150102T13:37:00")

      val check: PartialFunction[Any, Boolean] = {
        case RequestStartEstimation("spectator", "new-task", _, _) => true
      }

      userA.expectMsgPF(500 millis)(check)
      userB.expectMsgPF(500 millis)(check)
      spectator.expectMsgPF(500 millis)(check)

      roomRef ! UserEstimate("userA", "new-task", "20")
      roomRef ! UserEstimate("userB", "new-task", "1")
      roomRef ! UserEstimate("spectator", "new-task", "2")

      userA.expectMsgAllOf(
        UserHasEstimated("userA", "new-task"),
        UserHasEstimated("userB", "new-task")
      )

      userB.expectMsgAllOf(
        UserHasEstimated("userA", "new-task"),
        UserHasEstimated("userB", "new-task")
      )

      spectator.expectMsgAllOf(
        UserHasEstimated("userA", "new-task"),
        UserHasEstimated("userB", "new-task")
      )

      expectNoMsg(500 millis)
    }

    "estimation can be shown once all participants have voted (excluding spectators)" in {
      roomRef ! RequestShowEstimationResult("userA")

      val check: PartialFunction[Any, Boolean] = {
        case EstimationResult("new-task", _, _, estimations, _) => {
          assert(estimations.length == 2)
          estimations should contain theSameElementsAs List(
            UserEstimation("userA", "20"),
            UserEstimation("userB", "1")
          )
          true
        }
      }

      userA.expectMsgPF(500 millis)(check)
      userB.expectMsgPF(500 millis)(check)
      spectator.expectMsgPF(500 millis)(check)
    }
  }
}
