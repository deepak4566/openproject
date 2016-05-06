#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
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

require 'concerns/omniauth_login'

module Redmine::MenuManager::TopMenuHelper
  def render_top_menu_left
    content_tag :ul, id: 'account-nav-left', class: 'menu_root account-nav hidden-for-mobile' do
      [render_main_top_menu_nodes,
       render_projects_top_menu_node,
       render_module_top_menu_node].join.html_safe
    end
  end

  def render_top_menu_right
    content_tag :ul, id: 'account-nav-right', class: 'menu_root account-nav' do
      [render_help_top_menu_node,
       render_user_top_menu_node].join.html_safe
    end
  end

  private

  def render_projects_top_menu_node
    return '' if User.current.anonymous? and Setting.login_required?

    return '' if User.current.anonymous? and User.current.number_of_known_projects.zero?

    link_to_all_projects = link_to l(:label_project_plural),
                            { controller: '/projects', action: 'index' },
                            title: l(:label_project_plural),
                            accesskey: OpenProject::AccessKeys.key_for(:project_search),
                            class: 'icon5 icon-projects',
                            aria: { haspopup: 'true' }

    result = ''.html_safe
    if User.current.impaired?
      result << content_tag(:li, link_to_all_projects)

      if User.current.allowed_to?(:add_project, nil, global: true)
        result << content_tag(:li) do
                    link_to l(:label_project_new), new_project_path,
                      class: 'icon4 icon-add',
                      # For the moment we actually don't have a key for new project.
                      # Need to decide on one.
                      accesskey: OpenProject::AccessKeys.key_for(:new_project)
                  end
      end
      result
    else
      render_drop_down_menu_node link_to_all_projects do
        content_tag :ul, style: 'display:none', class: 'drop-down--projects' do
          if User.current.allowed_to?(:add_project, nil, global: true)
            result << content_tag(:li) do
                        link_to l(:label_project_new), new_project_path, class: 'icon4 icon-add'
                      end
          end
          result << content_tag(:li) do
            link_to l(:label_project_view_all),
                    { controller: '/projects', action: 'index' },
                    class: 'icon4 icon-show-all-projects'
          end

          result << content_tag(:li, id: 'project-search-container') do
            hidden_field_tag('', '', class: 'select2-select')
          end
          result
        end
      end
    end
  end

  def render_user_top_menu_node(items = menu_items_for(:account_menu))
    if User.current.logged?
      render_user_drop_down items
    elsif omniauth_direct_login?
      render_direct_login
    else
      render_login_drop_down
    end
  end

  def render_login_drop_down
    url = { controller: '/account', action: 'login' }
    link = link_to l(:label_login),
                   url,
                   class: 'login',
                   title: l(:label_login)

    render_drop_down_menu_node(link, class: 'drop-down last-child') do
      content_tag :ul do
        render_login_partial
      end
    end
  end

  def render_direct_login
    login = Redmine::MenuManager::MenuItem.new :login,
                                               signin_path,
                                               caption: I18n.t(:label_login),
                                               html: { class: 'login' }

    render_menu_node login
  end

  def render_user_drop_down(items)
    render_drop_down_menu_node link_to_user(User.current, title: User.current.to_s, aria: { haspopup: 'true' }),
                               items,
                               class: 'drop-down last-child'
  end

  def render_login_partial
    partial =
      if OpenProject::Configuration.disable_password_login?
        'account/omniauth_login'
      else
        'account/login'
      end

    render partial: partial
  end

  def render_module_top_menu_node(items = more_top_menu_items)
    render_drop_down_menu_node link_to(l(:label_modules), '#', title: l(:label_modules), class: 'icon5 icon-modules', aria: { haspopup: 'true' }),
                               items,
                               id: 'more-menu'
  end

  def render_help_top_menu_node(item = help_menu_item)
    link_to_help_pop_up = link_to '', '',
                            class: 'icon-help1',
                            aria: { haspopup: 'true' }

    result = ''.html_safe

    render_drop_down_menu_node(link_to_help_pop_up, class: 'drop-down hidden-for-mobile') do
      content_tag :ul, style: 'display:none', class: 'drop-down--help' do
        result << content_tag(:li) do
                    content_tag(:span, l('top_menu.help_and_support'), class: 'drop-down--help-headline', title: l('top_menu.help_and_support'))
                  end
        result << content_tag(:li) do
                    link_to l('homescreen.links.user_guides'), 'https://www.openproject.org/help/user-guides', title: l('homescreen.links.user_guides')
                  end
        result << content_tag(:li) do
                    link_to l('homescreen.links.faq'), 'https://www.openproject.org/help/faq', title: l('homescreen.links.faq')
                  end
        result << content_tag(:li) do
                    link_to l('homescreen.links.shortcuts'), '', title: l('homescreen.links.shortcuts'), onClick: 'modalHelperInstance.createModal(\'/help/keyboard_shortcuts\');'
                  end
        result << content_tag(:li) do
                    link_to l('homescreen.links.boards'), 'https://community.openproject.com/projects/openproject/boards', title: l('homescreen.links.boards')
                  end
        result << content_tag(:li) do
                    link_to l(:label_professional_support), 'https://www.openproject.org/professional-services/', title: l(:label_professional_support)
                  end
        result << content_tag(:hr, '', class: 'form--separator')


        result << content_tag(:li) do
                    content_tag(:span, l('top_menu.additional_resources'), class: 'drop-down--help-headline', title: l('top_menu.additional_resources'))
                  end
        result << content_tag(:li) do
                    link_to l('homescreen.links.blog'), 'https://www.openproject.org/blog', title: l('homescreen.links.blog')
                  end
        result << content_tag(:li) do
                    link_to l(:label_release_notes), 'https://www.openproject.org/open-source/release-notes/', title: l(:label_release_notes)
                  end
        result << content_tag(:li) do
                    link_to l(:label_report_bug), 'https://www.openproject.org/open-source/report-bug/', title: l(:label_report_bug)
                  end
        result << content_tag(:li) do
                    link_to l(:label_development_roadmap), 'https://community.openproject.org/projects/openproject/roadmap', title: l(:label_development_roadmap)
                  end
        result << content_tag(:li) do
                    link_to l(:label_add_edit_translations), 'https://crowdin.com/projects/opf', title: l(:label_add_edit_translations)
                  end
        result << content_tag(:li) do
                    link_to l(:label_api_documentation), 'https://www.openproject.org/api', title: l(:label_api_documentation)
                  end

        result
      end
    end
  end

  def render_main_top_menu_nodes(items = main_top_menu_items)
    items.map { |item|
      render_menu_node(item)
    }.join(' ')
  end

  # Menu items for the main top menu
  def main_top_menu_items
    split_top_menu_into_main_or_more_menus[:main]
  end

  # Menu items for the more top menu
  def more_top_menu_items
    split_top_menu_into_main_or_more_menus[:more]
  end

  def help_menu_item
    split_top_menu_into_main_or_more_menus[:help]
  end

  # Split the :top_menu into separate :main and :more items
  def split_top_menu_into_main_or_more_menus
    unless @top_menu_split
      items_for_main_level = []
      items_for_more_level = []
      help_menu = nil
      menu_items_for(:top_menu) do |item|
        if item.name == :my_page
          items_for_main_level << item
        elsif item.name == :help
          help_menu = item
        elsif item.name == :projects
          # Remove, present in layout
        else
          items_for_more_level << item
        end
      end
      @top_menu_split = {
        main: items_for_main_level,
        more: items_for_more_level,
        help: help_menu
      }
    end
    @top_menu_split
  end
end
