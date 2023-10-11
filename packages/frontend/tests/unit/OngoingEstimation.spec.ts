import { describe, expect, it } from "vitest";
import OngoingEstimation from "../../src/components/OngoingEstimation.vue";
import createWrapper from "./helper";

describe("ongoing estimation", () => {
  it("should show hint if user is spectator", () => {
    const { wrapper } = createWrapper(
      OngoingEstimation,
      {
        props: {
          taskName: "test-task",
          currentCardDeck: ["0, 1, 2, 3, 5, 8, 13"],
        },
      },
      {
        room: {
          name: "test-room",
          userName: "test-user",
          isSpectator: true,
          showCats: false,
        },
        participants: [],
        cardDeck: ["0, 1, 2, 3, 5, 8, 13"],
      }
    );
    expect(wrapper.findAll("div")[2].exists()).toBeTruthy();
    expect(wrapper.findAll("div")[2].text()).toContain(
      "Participants are voting"
    );
  });
});
