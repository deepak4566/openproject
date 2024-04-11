# frozen_string_literal: true

# -- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2024 the OpenProject GmbH
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

class WorkPackages::ProgressController < ApplicationController
  ERROR_PRONE_ATTRIBUTES = %i[status_id
                              estimated_hours
                              remaining_hours
                              done_ratio].freeze

  layout false
  before_action :set_work_package

  helper_method :modal_class

  def edit
    build_up_new_work_package

    render modal_class.new(@work_package, focused_field: params[:field])
  end

  def create
    service_call = build_up_new_work_package

    if service_call.errors
                   .map(&:attribute)
                   .intersect?(ERROR_PRONE_ATTRIBUTES)
      respond_to do |format|
        format.turbo_stream do
          # Bundle 422 status code into stream response so
          # Angular has context as to the success or failure of
          # the request in order to fetch the new set of Work Package
          # attributes in the ancestry solely on success.
          render :update, status: :unprocessable_entity
        end
      end
    else
      render json: { estimatedTime: formatted_duration(@work_package.estimated_hours),
                     remainingTime: formatted_duration(@work_package.remaining_hours) }
    end
  end

  def update
    service_call = WorkPackages::UpdateService
                     .new(user: current_user,
                          model: @work_package)
                     .call(update_work_package_params)

    if service_call.success?
      respond_to do |format|
        format.turbo_stream
      end
    else
      respond_to do |format|
        format.turbo_stream do
          # Bundle 422 status code into stream response so
          # Angular has context as to the success or failure of
          # the request in order to fetch the new set of Work Package
          # attributes in the ancestry solely on success.
          render :update, status: :unprocessable_entity
        end
      end
    end
  end

  private

  def modal_class
    if WorkPackage.use_status_for_done_ratio?
      WorkPackages::Progress::StatusBased::ModalBodyComponent
    else
      WorkPackages::Progress::WorkBased::ModalBodyComponent
    end
  end

  def set_work_package
    @work_package = WorkPackage.visible.find(params[:work_package_id])
  rescue ActiveRecord::RecordNotFound
    @work_package = WorkPackage.new
  end

  def create_work_package_params
    params.require(:work_package)
          .permit(allowed_params)
          .compact_blank
  end

  def update_work_package_params
    params.require(:work_package)
          .permit(allowed_params)
  end

  def allowed_params
    if WorkPackage.use_status_for_done_ratio?
      %i[estimated_hours status_id]
    else
      %i[estimated_hours remaining_hours]
    end
  end

  def build_up_new_work_package
    WorkPackages::SetAttributesService
      .new(user: current_user,
           model: @work_package,
           contract_class: WorkPackages::CreateContract)
      .call(create_work_package_params)
  end

  def formatted_duration(hours)
    API::V3::Utilities::DateTimeFormatter.format_duration_from_hours(hours)
  end
end
