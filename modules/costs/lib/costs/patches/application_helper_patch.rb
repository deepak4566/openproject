#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2020 the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2017 Jean-Philippe Lang
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
# See docs/COPYRIGHT.rdoc for more details.
#++

module Costs::Patches::ApplicationHelperPatch
  def self.included(base) # :nodoc:
    # Same as typing in the class
    base.class_eval do
      def link_to_budget(budget, options = {})
        title = nil
        subject = nil
        if options[:subject] == false
          subject = "#{t(:label_budget)} ##{budget.id}"
          title = truncate(budget.subject, length: 60)
        else
          subject = budget.subject
          if options[:truncate]
            subject = truncate(subject, length: options[:truncate])
          end
        end
        s = link_to subject, budget_path(budget), class: budget.css_classes, title: title
        s = "#{h budget.project} - " + s if options[:project]
        s
      end
    end
  end
end
