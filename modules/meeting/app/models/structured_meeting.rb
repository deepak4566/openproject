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

class StructuredMeeting < Meeting
  has_many :agenda_items, dependent: :destroy, foreign_key: 'meeting_id', class_name: 'MeetingAgendaItem'

  # triggered by MeetingAgendaItem#after_create/after_destroy/after_save
  def calculate_agenda_item_time_slots
    current_time = start_time
    agenda_items.order(:position).each do |top|
      start_time = current_time
      current_time += top.duration_in_minutes&.minutes || 0.minutes
      end_time = current_time
      top.update_columns(start_time:, end_time:) # avoid callbacks, infinite loop otherwise
    end
  end

  def agenda_items_sum_duration_in_minutes
    agenda_items.sum(:duration_in_minutes)
  end

  def duration_exceeded_by_agenda_items?
    agenda_items_sum_duration_in_minutes > (duration*60 || 0)
  end

  def duration_exceeded_by_agenda_items_in_minutes
    agenda_items_sum_duration_in_minutes - (duration*60 || 0)
  end
end
