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

class Users::ProjectRoleCache
  attr_accessor :user

  def initialize(user)
    self.user = user
  end

  def fetch(project: nil, entity: nil)
    if project
      project_cache[project] ||= roles(project:)
    elsif entity
      entity_cache[entity] ||= roles(entity:)
    else
      []
    end
  end

  private

  def roles(project: nil, entity: nil)
    # Return all roles if user is admin
    return all_givable_roles if user.admin?

    if project
      # Project is nil if checking global role
      # No roles on archived projects, unless the active state is being changed
      return [] if archived?(project)

      ::Authorization.roles(user, project:).eager_load(:role_permissions)
    elsif entity
      ::Authorization.roles(user, entity:).eager_load(:role_permissions)
    end
  end

  def project_cache
    @project_cache ||= {}
  end

  def entity_cache
    @entity_cache ||= {}
  end

  def all_givable_roles
    @all_givable_roles ||= Role.givable.to_a
  end

  def archived?(project)
    # project for which activity is being changed is still considered active
    return false if project.being_archived?

    project.archived?
  end
end
