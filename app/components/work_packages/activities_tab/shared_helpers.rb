# frozen_string_literal: true

# -- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2023 the OpenProject GmbH
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

module WorkPackages
  module ActivitiesTab
    module SharedHelpers
      def truncated_user_name(user)
        render(Primer::Beta::Link.new(
                 href: user_url(user),
                 target: "_blank",
                 scheme: :primary,
                 underline: false,
                 font_weight: :bold
               )) do
          component_collection do |collection|
            collection.with_component(Primer::Beta::Truncate.new(classes: "hidden-for-mobile")) do |component|
              component.with_item(max_width: 180) do
                user.name
              end
            end
            collection.with_component(Primer::Beta::Truncate.new(classes: "hidden-for-desktop")) do |component|
              component.with_item(max_width: 220) do
                user.name
              end
            end
          end
        end
      end
    end
  end
end