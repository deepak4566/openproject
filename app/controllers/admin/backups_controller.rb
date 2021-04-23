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

class Admin::BackupsController < ApplicationController
  include ActionView::Helpers::TagHelper
  include BackupHelper

  layout 'admin'

  before_action :check_enabled
  before_action :require_admin

  menu_item :backups

  def show
    @backup_token = Token::Backup.find_by user: current_user
    last_backup = Backup.last

    if last_backup
      @job_status_id = last_backup.job_status.job_id
      @last_backup_date = I18n.localize(last_backup.updated_at)
      @last_backup_attachment_id = last_backup.attachments.first&.id
    end

    @may_include_attachments = may_include_attachments? ? "true" : "false"
  end

  def reset_token
    @backup_token = Token::Backup.find_by user: current_user
  end

  def perform_token_reset
    token = create_backup_token user: current_user

    notify_user_and_admins current_user, backup_token: token

    flash[:warning] = [
      t('my.access_token.notice_reset_token', type: 'Backup').html_safe,
      content_tag(:strong, token.plain_value),
      t('my.access_token.token_value_warning')
    ]
  rescue StandardError => e
    Rails.logger.error "Failed to reset user ##{current_user.id}'s Backup key: #{e}"
    flash[:error] = t('my.access_token.failed_to_reset_token', error: e.message)
  ensure
    redirect_to action: 'show'
  end

  def delete_token
    Token::Backup.where(user: current_user).destroy_all

    flash[:info] = t("backup.text_token_deleted")

    redirect_to action: 'show'
  end

  def default_breadcrumb
    t(:label_backup)
  end

  def show_local_breadcrumb
    true
  end

  def check_enabled
    render_404 unless OpenProject::Configuration.backup_enabled?
  end

  private

  def may_include_attachments?
    Backup.include_attachments? && Backup.attachments_size_in_bounds?
  end
end
