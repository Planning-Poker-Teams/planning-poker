Feature: Joining and leaving poker room

  Scenario: Joining an empty room
    Given there is an empty room
    When a participant named "Fred" joins the room
    Then he should be added as a new participant

  Scenario: Joining an occupied room
    Given there is an occupied room
    When a participant named "Fred" joins the room
    Then he should be added as a new participant
    And he should receive information about the existing participants
    And the existing participants should be informed about the new participant

  Scenario: Leaving a room
    Given there is a room with a few participants
    When a participant named "Fred" leaves the room
    Then he should be removed from the participants
    And the remaining participants should be informed the leaving participant