#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2013 the OpenProject Foundation (OPF)
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
# See doc/COPYRIGHT.rdoc for more details.
#++

class WikiMenuItemsController < ApplicationController

  attr_reader :wiki_menu_item

  current_menu_item do |controller|
    controller.wiki_menu_item.item_class.to_sym if controller.wiki_menu_item
  end

  before_filter :find_project_by_project_id
  before_filter :authorize

  def edit
    get_data_from_params(params)
  end

  def update
    wiki_menu_setting = params[:wiki_menu_item][:setting]
    parent_wiki_menu_item = params[:parent_wiki_menu_item]

    get_data_from_params(params)

    if wiki_menu_setting == 'no_item'
      @wiki_menu_item.destroy unless @wiki_menu_item.nil?
    else
      @wiki_menu_item.wiki_id = @page.wiki.id
      @wiki_menu_item.name = params[:wiki_menu_item][:name]
      @wiki_menu_item.title = @page_title

      if wiki_menu_setting == 'sub_item'
        @wiki_menu_item.parent_id = parent_wiki_menu_item
      elsif wiki_menu_setting == 'main_item'
        @wiki_menu_item.parent_id = nil

        if params[:wiki_menu_item][:new_wiki_page] == "1"
          @wiki_menu_item.new_wiki_page = true
        elsif params[:wiki_menu_item][:new_wiki_page] == "0"
          @wiki_menu_item.new_wiki_page = false
        end

        if params[:wiki_menu_item][:index_page] == "1"
          @wiki_menu_item.index_page = true
        elsif params[:wiki_menu_item][:index_page] == "0"
          @wiki_menu_item.index_page = false
        end
      end
    end

    if not @wiki_menu_item.errors.size >= 1 and (@wiki_menu_item.destroyed? or @wiki_menu_item.save)
      flash[:notice] = l(:notice_successful_update)
      redirect_back_or_default({ :action => 'edit', :id => @page_title })
    else
      respond_to do |format|
        format.html { render :action => 'edit', :id => @page_title }
      end
    end
  end

  private

  def get_data_from_params(params)
    @project = Project.find(params[:project_id])

    @page_title = params[:id]
    @page = WikiPage.find_by_title_and_wiki_id(@page_title, @project.wiki.id)


    @wiki_menu_item = WikiMenuItem.find_or_initialize_by_wiki_id_and_title(@page.wiki.id, @page_title)

    @possible_parent_menu_items = WikiMenuItem.main_items(@page.wiki.id) - [@wiki_menu_item]
    @possible_parent_menu_items.map! {|item| [item.name, item.id]}
  end
end
