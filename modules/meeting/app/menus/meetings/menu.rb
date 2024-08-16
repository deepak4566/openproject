# -- copyright
# OpenProject is an open source project management software.
# Copyright (C) the OpenProject GmbH
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
module Meetings
  class Menu < Submenu
    attr_reader :view_type, :project

    def initialize(project: nil, params: nil)
      @project = project
      @params = params

      super(view_type:, project:, params:)
    end

    def menu_items
      [
        OpenProject::Menu::MenuGroup.new(header: nil, children: top_level_menu_items),
        OpenProject::Menu::MenuGroup.new(header: I18n.t(:label_involvement), children: involvement_sidebar_menu_items)
      ]
    end

    def top_level_menu_items
      [
        menu_item(title: I18n.t(:label_upcoming_meetings),
                  query_params: { query_id: MeetingQueries::Static::UPCOMING }),
        menu_item(title: I18n.t(:label_past_meetings),
                  query_params: { query_id: MeetingQueries::Static::PAST })
      ]
    end

    def involvement_sidebar_menu_items
      [
        menu_item(title: I18n.t(:label_upcoming_invitations),
                  query_params: { query_id: MeetingQueries::Static::UPCOMING_INVITATIONS }),
        menu_item(title: I18n.t(:label_past_invitations),
                  query_params: { query_id: MeetingQueries::Static::PAST_INVITATIONS }),
        menu_item(title: I18n.t(:label_attendee),
                  query_params: { query_id: MeetingQueries::Static::ATTENDEE }),
        menu_item(title: I18n.t(:label_author),
                  query_params: { query_id: MeetingQueries::Static::CREATOR })
      ]
    end

    def query_path(query_params)
      polymorphic_path([@project, :meetings], query_params)
    end

    def selected?(query_params)
      case params[:query_id]
      when nil
        query_params[:query_id].to_s == MeetingQueries::Static::UPCOMING_INVITATIONS
      else
        query_params[:query_id].to_s == params[:query_id] unless modification_params?
      end
    end

    def modification_params?
      params.values_at(:filters, :columns, :sortBy).any?
    end
  end
end
