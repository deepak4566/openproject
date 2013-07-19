#-- copyright
# OpenProject is a project management system.
#
# Copyright (C) 2012-2013 the OpenProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

Feature: User session
  Background:
    Given there is 1 project with the following:
      | name            | Awesome Project      |
      | identifier      | awesome-project      |
    And project "Awesome Project" uses the following modules:
      | calendar |
    And there is a role "member"
    And the role "member" may have the following rights:
      | view_calendar  |
    And there is 1 user with the following:
      | login | bob |
    And the user "bob" is a "member" in the project "Awesome Project"

  Scenario: A user can log in
    When I login as "bob"
    Then I should be logged in as "bob"

  Scenario: A user can log out
    Given I am logged in as "bob"
    When I logout
    Then I should be logged out

  Scenario: A user is logged out when their session is expired
    Given the "session_ttl_enabled" setting is set to true
    And the "session_ttl" setting is set to 5
    When I login as "bob"
    And I wait for "10" minutes
    And I go to the home page
    Then I should be logged out

  Scenario: A user is logged in as long as their session is valid
    Given the "session_ttl_enabled" setting is set to true
    And the "session_ttl" setting is set to 5
    When I login as "bob"
    And I wait for "4" minutes
    And I go to the home page
    Then I should be logged in as "bob"
