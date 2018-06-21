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

##
# Intended to be used by the UsersController to enforce the user limit.
module Concerns::UserLimits
  def enforce_user_limit(redirect_to: users_path, hard: OpenProject::Enterprise.fail_fast?)
    if user_limit_reached?
      if hard
        show_user_limit_error!

        redirect_back fallback_location: redirect_to
      else
        show_user_limit_warning!
      end

      true
    else
      false
    end
  end

  def enforce_activation_user_limit(redirect_to: signin_path)
    if user_limit_reached?
      show_user_limit_activation_error!

      redirect_back fallback_location: redirect_to

      true
    else
      false
    end
  end

  def show_user_limit_activation_error!
    flash[:error] = I18n.t(:error_enterprise_activation_user_limit)
  end

  def show_user_limit_warning!
    flash[:warning] = user_limit_warning
  end

  def show_user_limit_error!
    flash[:error] = user_limit_warning
  end

  def user_limit_warning
    warning = I18n.t(
      :warning_user_limit_reached,
      upgrade_url: OpenProject::Enterprise.upgrade_path
    )

    warning.html_safe
  end

  def user_limit_reached?
    OpenProject::Enterprise.user_limit_reached?
  end
end
