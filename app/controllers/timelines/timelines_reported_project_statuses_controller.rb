#-- copyright
# OpenProject is a project management system.
#
# Copyright (C) 2012-2013 the OpenProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

class Timelines::TimelinesReportedProjectStatusesController < ApplicationController
  unloadable
  helper :timelines

  extend Timelines::Pagination::Controller
  timelines_paginate_model Timelines::ReportedProjectStatus

  before_filter :require_login
  before_filter :determine_base
  accept_key_auth :index, :show

  def index
    @reported_project_statuses = @base.all
    respond_to do |format|
      format.html { render_404 }
      format.api
    end
  end

  def show
    @reported_project_status = @base.find(params[:id])
    respond_to do |format|
      format.html { render_404 }
      format.api
    end
  end

  protected

  def determine_base
    if params[:project_type_id]
      @base = Timelines::ProjectType.find(params[:project_type_id]).reported_project_statuses.active
    else
      @base = Timelines::ReportedProjectStatus.active
    end
  end
end
