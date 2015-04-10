#-- encoding: UTF-8
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
require File.expand_path('../../test_helper', __FILE__)
require 'repositories_controller'

# Re-raise errors caught by the controller.
class RepositoriesController; def rescue_action(e) raise e end; end

class RepositoriesFilesystemControllerTest < ActionController::TestCase
  fixtures :all

  PRJ_ID = 3

  def setup
    super
    @controller = RepositoriesController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new

    @request.session[:user_id] = 1 # admin

    with_existing_filesystem_scm do |repo_path|
      @repository = Repository::Filesystem.create(project: Project.find(PRJ_ID),
                                                  url:     repo_path,
                                                  path_encoding: nil)
      assert @repository
    end
  end

  def teardown
    User.current = nil
  end

  def test_browse_root
    with_existing_filesystem_scm do
      @repository.fetch_changesets
      @repository.reload
      get :show, project_id: PRJ_ID
      assert_response :success
      assert_template 'show'
      assert_not_nil assigns(:entries)
      assert assigns(:entries).size > 0
      assert_not_nil assigns(:changesets)
      assert assigns(:changesets).size == 0
    end
  end

  def test_show_no_extension
    with_existing_filesystem_scm do
      get :entry, project_id: PRJ_ID, path: 'test'
      assert_response :success
      assert_template 'entry'
      assert_tag tag: 'th',
                 content: '1',
                 attributes: { class: 'line-num' },
                 sibling: { tag: 'td', content: /TEST CAT/ }
    end
  end

  def test_entry_download_no_extension
    with_existing_filesystem_scm do |_|
      get :entry, project_id: PRJ_ID, path: 'test', format: 'raw'
      assert_response :success
      assert_equal 'application/octet-stream', @response.content_type
    end
  end

  def test_show_non_ascii_contents
    with_existing_filesystem_scm do
      with_settings repositories_encodings: 'UTF-8,EUC-JP' do
        get :entry, project_id: PRJ_ID, path: 'japanese/euc-jp.txt'
        assert_response :success
        assert_template 'entry'
        assert_tag tag: 'th',
                   content: '2',
                   attributes: { class: 'line-num' },
                   sibling: { tag: 'td', content: /japanese/ }
      end
    end
  end

  def test_show_utf16
    with_existing_filesystem_scm do
      with_settings repositories_encodings: 'UTF-16' do
        get :entry, project_id: PRJ_ID, path: 'japanese/utf-16.txt'
        assert_response :success

        assert_select 'tr' do
          assert_select 'th.line-num' do
            assert_select 'a', text: /2/
          end
          assert_select 'td', content: /japanese/
        end
      end
    end
  end

  def test_show_text_file_should_send_if_too_big
    with_existing_filesystem_scm do
      with_settings file_max_size_displayed: 1 do
        get :entry, project_id: PRJ_ID, path: 'japanese/big-file.txt'
        assert_response :success
        assert_equal 'text/plain', @response.content_type
      end
    end
  end
end
