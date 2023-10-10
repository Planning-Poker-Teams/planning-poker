import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import OngoingEstimation from "../../src/components/OngoingEstimation.vue";
import TaskHeader from "../../src/components/TaskHeader.vue";
import createWrapper from "./helper";

describe("ongoing estimation", () => {

  //TODO: Move to taskheader test
  // it('should use the property "task" to show the task name', () => {
  //   const { wrapper } = createWrapper(OngoingEstimation, {
  //     props: {
  //       taskName: "test-task",
  //       currentCardDeck: ["0, 1, 2, 3, 5, 8, 13"],
  //     },
  //   });
  //   expect(wrapper.findAll("div")[1].exists()).toBeTruthy();
  //   expect(wrapper.findAll("div")[1].text()).toContain("test-task");
  // });

  it("should show result button and no warning dialog", async () => {
    const { wrapper } = createWrapper(
      OngoingEstimation,
      {
        props: {
          taskName: "test-task",
          currentCardDeck: ["0, 1, 2, 3, 5, 8, 13"],
        },
      },
      {
        participants: [
          { name: "test-user-a", isSpectator: true, hasEstimated: false },
          { name: "test-user-b", isSpectator: false, hasEstimated: true },
          { name: "test-user-c", isSpectator: false, hasEstimated: true },
        ],
        cardDeck: ["0, 1, 2, 3, 5, 8, 13"],
      }
    );

    //TODO: Move or remove
    // const taskHeaderWrapper = createWrapper(
    //   TaskHeader,
    //   {},
    //   {
    //     participants: [
    //       { name: "test-user-a", isSpectator: true, hasEstimated: false },
    //       { name: "test-user-b", isSpectator: false, hasEstimated: true },
    //       { name: "test-user-c", isSpectator: false, hasEstimated: true },
    //     ],
    //     cardDeck: ["0, 1, 2, 3, 5, 8, 13"],
    //   }
    // );
    // const buttonTest = taskHeaderWrapper.wrapper.find({
    //   ref: "show-result-button",
    // });
    // console.log(buttonTest);
    // expect(buttonTest.exists()).toBeTruthy();

    const resultButton = wrapper.find("button[type=submit]");
    expect(resultButton.exists()).toBeTruthy();
    await resultButton.trigger("click");
    expect(
      wrapper.find("[data-testid=confirm-show-results-dialog]").exists()
    ).toBeFalsy();
  });

  //TODO: Move to taskheader test
  // it("should show warning dialog when not all users have voted yet", async () => {
  //   const { wrapper } = createWrapper(
  //     OngoingEstimation,
  //     {
  //       props: {
  //         taskName: "test-task",
  //         currentCardDeck: ["0, 1, 2, 3, 5, 8, 13"],
  //       },
  //     },
  //     {
  //       participants: [
  //         { name: "test-user-a", isSpectator: true, hasEstimated: false },
  //         { name: "test-user-b", isSpectator: false, hasEstimated: false },
  //         { name: "test-user-c", isSpectator: false, hasEstimated: true },
  //       ],
  //       cardDeck: ["0, 1, 2, 3, 5, 8, 13"],
  //     }
  //   );

  //   await wrapper.find("button[type=submit]").trigger("click");
  //   const confirmDialog = wrapper.find(
  //     "[data-testid=confirm-show-results-dialog]"
  //   );
  //   expect(confirmDialog.exists()).toBeTruthy();
  //   expect(confirmDialog.text()).include("test-user-b");
  // });

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
