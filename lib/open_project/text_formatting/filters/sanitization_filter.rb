#-- encoding: UTF-8

#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2017 the OpenProject Foundation (OPF)
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
# See doc/COPYRIGHT.rdoc for more details.
#++

module OpenProject::TextFormatting
  module Filters
    class SanitizationFilter < HTML::Pipeline::SanitizationFilter
      # WHITELIST and it's elements are frozen....
      if WHITELIST[:elements].frozen?
        whitelist = WHITELIST.dup
        whitelist[:elements] = WHITELIST[:elements].dup
        whitelist[:elements] << 'macro'
        whitelist[:attributes] = WHITELIST[:attributes].dup
        whitelist[:attributes].merge!('macro' => ['class', :data])
        # Ignore, it's a constant, ignore the warning. - quite smelly, though -
        WHITELIST = whitelist
        WHITELIST[:elements].freeze
        WHITELIST[:attributes].freeze
        WHITELIST.freeze
      else
        WHITELIST[:elements] << 'macro'
        # Whitelist class and data-* attributes on all macros
        WHITELIST[:attributes].merge!('macro' => ['class', :data])
      end
    end
  end
end
