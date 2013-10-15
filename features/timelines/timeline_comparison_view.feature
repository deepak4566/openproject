#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2013 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

Feature: Timeline Comparison View Tests
  Background:
    Given there is 1 user with:
          | login | manager |
      And there is a role "manager"
      And the role "manager" may have the following rights:
          | view_timelines            |
          | edit_timelines            |
          | view_work_packages        |
          | edit_work_packages        |
          | delete_work_packages      |
          | view_reportings           |
          | view_project_associations |
      And there is a project named "Volatile Planning"
      And I am working in project "Volatile Planning"
      And the project uses the following modules:
          | timelines |
      And the user "manager" is a "manager"
      And I am already logged in as "manager"
      And there are the following work packages were added "three weeks ago":
          | Subject  | Start date | Due date   |
          | January  | 2014-01-01 | 2014-01-31 |
          | February | 2014-02-01 | 2014-02-28 |
          | March    | 2014-03-01 | 2014-03-31 |
          | April    | 2014-04-01 | 2014-04-30 |
      And the work package "February" was changed "two weeks ago" to:
          | Subject  | Start date | Due date   |
          | May      | 2014-05-01 | 2014-05-31 |
      And the work package "January" was changed "one week ago" to:
          | Subject  | Start date | Due date   |
          | February | 2014-02-01 | 2014-02-28 |

  @javascript
  Scenario: nine days comparison
    Given I am working in the timeline "Changes" of the project called "Volatile Planning"
     When there is a timeline "Changes" for project "Volatile Planning"
      And I set the timeline to compare "now" to "9 days ago"
      And I go to the page of the timeline "Changes" of the project called "Volatile Planning"
      And I wait for timeline to load table
     Then I should see the work package "May" has not moved
      And I should see the work package "February" has moved
      And I should not see the work package "January" in the timeline

  @javascript
  Scenario: sixteen days comparison
    Given I am working in the timeline "Changes" of the project called "Volatile Planning"
     When there is a timeline "Changes" for project "Volatile Planning"
      And I set the timeline to compare "now" to "16 days ago"
      And I go to the page of the timeline "Changes" of the project called "Volatile Planning"
      And I wait for timeline to load table
     Then I should see the work package "May" has moved
      And I should see the work package "February" has moved
      And I should not see the work package "January" in the timeline
