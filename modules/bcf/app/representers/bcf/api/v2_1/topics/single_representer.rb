#-- encoding: UTF-8

#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2018 the OpenProject Foundation (OPF)
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

module Bcf::API::V2_1
  class Topics::SingleRepresenter < BaseRepresenter
    include API::V3::Utilities::PathHelper

    property :uuid,
             as: :guid

    property :type_text,
             as: :topic_type

    property :status_text,
             as: :topic_status

    property :reference_links,
             getter: ->(decorator:, **) {
               [decorator.api_v3_paths.work_package(work_package.id)]
             }

    property :title

    property :index_text,
             as: :index

    property :labels

    property :creation_date_text,
             as: :creation_date

    property :creation_author_text,
             as: :creation_author

    property :modified_date_text,
             as: :modified_date

    property :modified_author_text,
             as: :modified_author

    property :assignee_text,
             as: :assigned_to

    property :stage_text,
             as: :stage

    property :description

    # TODO bim snippet property does not exist in the xml

    property :due_date_text,
             as: :due_date
  end
end
