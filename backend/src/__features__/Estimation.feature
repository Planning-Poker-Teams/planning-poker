Feature: Performing estimations

  Scenario: Starting a new estimation if there is none running
    Given there is a room with no ongoing estimation
    When a participant initiates a new estimation
    Then all participants should be informed to start estimating

  Scenario: Attempting to start a estimation while another one is running
    Given there is a room with an ongoing estimation for "Clean bathroom"
    When a participant initiates a new estimation
    Then no action should be performed

  Scenario: Recording an estimation
    Given there is a room with an ongoing estimation for "Buy milk"
    When "Fred" estimates "10" for "Buy milk"
    Then the estimation of "Fred" gets recorded
    And the other participants get informed that "Fred" has estimated

  Scenario: Ignoring invalid estimation
    Given there is a room with an ongoing estimation for "Buy milk"
    When "Fred" estimates "20" for "Do the laundry"
    Then no action should be performed

  Scenario: Attempting to show results with missing estimations
    Given there is a room with an ongoing estimation for "Buy milk"
    And "John" estimated "1"
    And "Jimmy" estimated "10"
    When showing the result is requested
    Then no action should be performed

  Scenario: Showing estimation results
    Given there is a room with an ongoing estimation for "Buy milk"
    And "Fred" estimated "20"
    And "John" estimated "1"
    And "Jimmy" estimated "10"
    When showing the result is requested
    Then all participants get informed about the estimation result
    And the estimation round is ended

# startDate / endDate