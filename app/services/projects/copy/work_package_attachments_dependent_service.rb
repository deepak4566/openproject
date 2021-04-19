#-- encoding: UTF-8

#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2021 the OpenProject GmbH
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
# See docs/COPYRIGHT.rdoc for more details.
#++

module Projects::Copy
  class WorkPackageAttachmentsDependentService < Dependency
    include ::Copy::Concerns::CopyAttachments

    def self.human_name
      I18n.t(:label_work_package_attachments)
    end

    def source_count
      source.work_packages.joins(:attachments).count('attachments.id')
    end

    protected

    def copy_dependency(params:)
      # If no work packages were copied, we cannot copy their attachments
      return unless state.work_package_id_lookup

      state.work_package_id_lookup.each do |old_wp_id, new_wp_id|
        copy_attachments(old_wp_id, new_wp_id)
      end
    end
  end
end
