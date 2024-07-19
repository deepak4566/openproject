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

module WorkPackages
  module ActivitiesTab
    module Journals
      class ItemComponent::Reactions < ApplicationComponent
        include ApplicationHelper
        include OpPrimer::ComponentHelpers
        include OpTurbo::Streamable

        def initialize(journal:)
          super

          @journal = journal
        end

        private

        attr_reader :journal

        def wrapper_uniq_by
          journal.id
        end

        def reacted_by_current_user?(users)
          users.any? { |u| u[:id] == User.current.id }
        end

        def counter_color(users)
          reacted_by_current_user?(users) ? :accent : :default
        end

        def tooltip_text(emoji, users)
          max_displayed_users_count = 5

          user_count = users.length
          displayed_users = users.take(max_displayed_users_count).map { |u| u[:name] }

          result = if user_count <= max_displayed_users_count
            displayed_users.join(', ')
          elsif user_count == max_displayed_users_count + 1
            "#{displayed_users.join(', ')} #{I18n.t("reactions.and_n_others_singular", n: 1)}"
          else
            "#{displayed_users.join(', ')} #{I18n.t("reactions.and_n_others_plural", n: user_count - max_displayed_users_count)}"
          end

          result += " "

          result += I18n.t("reactions.reacted_with", emoji_shortcode: EmojiReaction.shortcode(emoji))
        end
      end
    end
  end
end
