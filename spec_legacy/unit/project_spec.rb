#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2022 the OpenProject GmbH
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
require_relative '../legacy_spec_helper'

describe Project, type: :model do
  fixtures :all

  before do
    User.current = nil
  end

  it 'rolleds up types' do
    parent = Project.find(1)
    parent.types = ::Type.find([1, 2])
    child = parent.children.find(3)

    assert_equal [1, 2], parent.type_ids
    assert_equal [2, 3], child.types.map(&:id)

    assert_kind_of ::Type, parent.rolled_up_types.first

    assert_equal [999, 1, 2, 3], parent.rolled_up_types.map(&:id)
    assert_equal [2, 3], child.rolled_up_types.map(&:id)
  end

  it 'rolleds up types should ignore archived subprojects' do
    parent = Project.find(1)
    parent.types = ::Type.find([1, 2])
    child = parent.children.find(3)
    child.types = ::Type.find([1, 3])
    parent.children.each do |child|
      child.update(active: false)
      child.children.each do |grand_child|
        grand_child.update(active: false)
      end
    end

    assert_equal [1, 2], parent.rolled_up_types.map(&:id)
  end

  context 'with modules',
          with_legacy_settings: { default_projects_modules: ['work_package_tracking', 'repository'] } do
    it 'enableds module names' do
      project = Project.new

      project.enabled_module_names = %w(work_package_tracking news)
      assert_equal %w(news work_package_tracking), project.enabled_module_names.sort
    end
  end

  it 'enableds module names should not recreate enabled modules' do
    project = Project.find(1)
    # Remove one module
    modules = project.enabled_modules.to_a.slice(0..-2)
    assert modules.any?
    assert_difference 'EnabledModule.count', -1 do
      project.enabled_module_names = modules.map(&:name)
    end
    project.reload
    # Ids should be preserved
    assert_equal project.enabled_module_ids.sort, modules.map(&:id).sort
  end
end
