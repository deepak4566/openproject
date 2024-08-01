# -- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2010-2024 the OpenProject GmbH
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
# See COPYRIGHT and LICENSE files for more details.
# ++

class WorkPackages::ProgressForm
  class InitialValuesForm < ApplicationForm
    attr_reader :work_package, :mode

    def initialize(work_package:,
                   mode: :work_based)
      super()

      @work_package = work_package
      @mode = mode
    end

    form do |form|
      if mode == :status_based
        form.hidden(name: :status_id,
                    value: work_package.status_id_was)
        form.hidden(name: :estimated_hours,
                    value: work_package.estimated_hours_was)
      else
        form.hidden(name: :estimated_hours,
                    value: work_package.estimated_hours_was)
        form.hidden(name: :remaining_hours,
                    value: work_package.remaining_hours_was)
        # next line to be removed in 15.0 with :percent_complete_edition feature flag removal
        next unless OpenProject::FeatureDecisions.percent_complete_edition_active?

        form.hidden(name: :done_ratio,
                    value: work_package.done_ratio_was)
      end
    end
  end
end