import { Given, When, Then } from "cucumber";

interface World {
  variable?: number;
}

Given("a variable set to {int}", function(number) {
  this.variable = number;
});

When("I increment the variable by {int}", function(number) {
  this.variable += number;
});

Then("the variable should contain {int}", function(number) {
  expect(this.variable).toEqual(number);
});
