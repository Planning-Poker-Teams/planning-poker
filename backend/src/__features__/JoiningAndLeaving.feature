Feature: Joining and leaving poker room

Scenario:
  Given there is an empty room named "Awesome room"
  When a participant named "Fred" joins the room
  Then he should be added as a new participant

Scenario:
  Given there is an occupied room named "Awesome room"
  When a participant named "Fred" joins the room
  Then he should be added as a new participant
  And he should receive information about the existing participants
  And the existing participants should be informed about the new participant
