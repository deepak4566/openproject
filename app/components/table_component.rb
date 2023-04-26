# frozen_string_literal: true

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

##
# Abstract view component. Subclass this for a concrete table.
class TableComponent < ViewComponent::Base
  attr_reader :rows

  def initialize(rows:)
    super()
    @rows = rows
  end

  class << self
    # Declares columns shown in the table.
    #
    # Use it in subclasses like so:
    #
    #     columns :name, :description, :sort
    #
    # When table is sortable, the column names are used by sort logic. It means
    # these names will be used directly in the generated SQL queries.
    def columns(*names)
      return Array(@columns) if names.empty?

      @columns = names.map(&:to_sym)
    end
  end

  def row_class
    mod = self.class.name.deconstantize.presence || "Table"

    "#{mod}::RowComponent".constantize
  rescue NameError
    raise(
      NameError,
      "#{mod}::RowComponent required by #{mod}::TableComponent not defined. " +
      "Expected to be defined in `app/components/#{mod.underscore}/row_component.rb`."
    )
  end

  def columns
    self.class.columns
  end

  def render_row(row)
    render(row_class.new(row:, table: self))
  end

  def inline_create_link
    nil
  end

  def sortable?
    false
  end

  def empty_row_message
    I18n.t :no_results_title_text
  end
end
