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

Feature: Viewing a work package
  Background:
    Given there is 1 project with the following:
      | identifier | omicronpersei8 |
      | name       | omicronpersei8 |
    And I am working in project "omicronpersei8"
    And the project "omicronpersei8" has the following trackers:
      | name | position |
      | Bug  |     1    |
    And there is a default issuepriority with:
      | name   | Normal |
    And there is a issuepriority with:
      | name   | High |
    And there is a issuepriority with:
      | name   | Immediate |

    And there are the following planning element types:
      | Name  | Is Milestone | In aggregation |
      | Phase | false        | true           |
    And there are the following project types:
      | Name             |
      | Standard Project |
    And the following planning element types are default for projects of type "Standard Project"
      | Phase |

    And there is a role "member"
    And the role "member" may have the following rights:
      | manage_issue_relations |
      | view_work_packages |
      | edit_work_packages |
    And there is 1 user with the following:
      | login | bob |
    And the user "bob" is a "member" in the project "omicronpersei8"
    And there are the following issue status:
      | name        | is_closed  | is_default  |
      | New         | false      | true        |

    And there are the following issues in project "omicronpersei8":
      | subject |
      | issue1  |
      | issue2  |
      | issue3  |

    And there are the following planning elements in project "omicronpersei8":
      | subject | start_date | end_date   |
      | pe1     | 2013-01-01 | 2013-12-31 |
      | pe2     | 2013-01-01 | 2013-12-31 |

    And the work package "issue1" has the following children:
      | issue2 |

    And the work package "pe1" has the following children:
      | pe2    |

    And I am already logged in as "bob"

  Scenario: Call the work package page for an issue and view the issue
    When I go to the page of the work package "issue1"
    Then I should see "Bug #1: issue1"
    Then I should see "Bug #2: issue2" within ".idnt-1"

  Scenario: Call the work package page for a planning element and view the planning element
    When I go to the page of the planning element "pe1" of the project called "omicronpersei8"
    Then I should see "pe1"
    Then I should see "pe2" within ".idnt-1"

  @javascript
  Scenario: Adding a relation will add it to the list of related work packages through AJAX instantly
    When I go to the page of the issue "issue1"
    And I click on "Add related issue"
    And I fill in "relation_issue_to_id" with "3"
    And I press "Add"
    And I wait for the AJAX requests to finish
    Then I should be on the page of the issue "issue1"
    And I should see "related to Bug #3: issue3"

