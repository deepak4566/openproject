#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2023 the OpenProject GmbH
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
#++

module WorkPackageMeetingsTab
  class HeadingComponent < ApplicationComponent
    include ApplicationHelper
    include OpPrimer::ComponentHelpers
    include OpTurbo::Streamable

    def initialize(work_package:)
      super

      @work_package = work_package
    end

    def call
      component_wrapper do
        flex_layout(justify_content: :space_between, align_items: :center) do |flex|
          flex.with_column(mr: 3) do
            info_partial
          end
          flex.with_column do
            add_to_meeting_partial
          end
        end
      end
    end

    private

    def info_partial
      render(Primer::Beta::Text.new(color: :subtle)) { t("text_add_work_package_to_meeting_description") }
    end

    def add_to_meeting_partial
      # we need to render a dialog with size :xlarge as the RTE requires this size to be able to render the toolbar properly
      render(Primer::Alpha::Dialog.new(
               id: "add-work-package-to-meeting-dialog", title: t("label_add_work_package_to_meeting_dialog_title"),
               size: :xlarge
             )) do |dialog|
        dialog.with_show_button do |button|
          button.with_leading_visual_icon(icon: :plus)
          t("label_add_work_package_to_meeting_dialog_button")
        end
        render(WorkPackageMeetingsTab::AddWorkPackageToMeetingFormComponent.new(work_package: @work_package))
      end
    end
  end
end
