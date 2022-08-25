Feature: Performing estimations

  Scenario: Starting a new estimation if there is none running
    Given there is a room with no ongoing estimation
    When a participant initiates a new estimation for "Buy milk"
    Then the current task name should be set to "Buy milk"
    And all participants should be informed to start estimating

  Scenario: Attempting to start a estimation while another one is running
    Given there is a room with an ongoing estimation for "Clean bathroom"
    When a participant initiates a new estimation for "Clean kitchen"
    Then no action should be performed

  Scenario: Recording an estimation
    Given there is a room with an ongoing estimation for "Buy milk"
    When "Fred" estimates "13" for "Buy milk"
    Then the estimation of "Fred" gets recorded
    And the other participants get informed that "Fred" has estimated

  Scenario: Participants get only informed once about estimations
    Given there is a room with an ongoing estimation for "Buy milk"
    And "Fred" estimated "1"
    When "Fred" estimates "13" for "Buy milk"
    Then the estimation of "Fred" gets recorded
    And the other participants do not get informed that "Fred" has estimated

  Scenario: Ignoring invalid estimation
    Given there is a room with an ongoing estimation for "Buy milk"
    When "Fred" estimates "20" for "Do the laundry"
    Then no action should be performed

  Scenario: Joining an active estimation session
    Given there is a room with an ongoing estimation for "Buy milk"
    And "John" estimated "1"
    And "Jimmy" estimated "13"
    When a participant named "Fred" joins the room
    Then he should receive information about the task
    And he should receive information about who has already estimated

  Scenario: Attempting to show results with missing estimations
    Given there is a room with an ongoing estimation for "Buy milk"
    And "John" estimated "1"
    And "Jimmy" estimated "13"
    When showing the result is requested
    Then no action should be performed

  Scenario: Estimation results can be shown without estimations from spectators
    Given there is a room with an ongoing estimation for "Buy milk"
    And a participant named "Lou" has joined the room as spectator
    And "John" estimated "1"
    And "Jimmy" estimated "13"
    And "Fred" estimated "20"
    When showing the result is requested
    Then all participants get informed about the estimation result

  Scenario: Showing estimation results
    Given there is a room with an ongoing estimation for "Buy milk"
    And "Fred" estimated "20"
    And "John" estimated "1"
    And "Jimmy" estimated "13"
    When showing the result is requested
    Then all participants get informed about the estimation result
    And the estimation round is ended