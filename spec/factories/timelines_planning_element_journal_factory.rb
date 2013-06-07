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

Timelines::PlanningElement # this should fix "uninitialized constant Timelines_PlanningElementJournal" errors on ci.

FactoryGirl.define do
  factory(:timelines_planning_element_journal, :class => Timelines_PlanningElementJournal) do

    association :journaled, :factory => :timelines_planning_element
  end
end
