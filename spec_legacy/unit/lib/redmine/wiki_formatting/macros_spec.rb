#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2018 the OpenProject Foundation (OPF)
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
# See docs/COPYRIGHT.rdoc for more details.
#++

require_relative '../../../../legacy_spec_helper'

describe Redmine::WikiFormatting::Macros, type: :helper do
  include ApplicationHelper
  include WorkPackagesHelper
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::SanitizeHelper
  extend ActionView::Helpers::SanitizeHelper::ClassMethods

  fixtures :all

  before do
    @project = nil
  end

  it 'should macro hello world' do
    text = '{{hello_world}}'
    assert format_text(text).match(/Hello world!/)
    # escaping
    text = '!{{hello_world}}'
    assert_equal '<p>{{ $root.DOUBLE_LEFT_CURLY_BRACE }}hello_world}}</p>', format_text(text)
  end

  it 'should macro child pages' do
    expected_keywords = ['Child 1',                       # Child
                         'Child 2',                       # Child
                         'Hierarchy leaf',                # Hierarchy elements
                         'hidden-for-sighted',            # Accessability
                         'tabindex']                      # Accessability

    not_expected_keywords = ['Another page']

    @project = Project.find(1)

    # child pages of the current wiki page
    expect(format_text('{{child_pages}}', object: WikiPage.find(2).content)).to(
      include(*expected_keywords)
    )
    expect(format_text('{{child_pages}}', object: WikiPage.find(2).content)).to_not(
      include(*not_expected_keywords)
    )

    # child pages of another page
    expect(format_text('{{child_pages(Another page)}}', object: WikiPage.find(2).content)).to(
      include(*expected_keywords)
    )
    expect(format_text('{{child_pages(Another page)}}', object: WikiPage.find(2).content)).to_not(
      include(*not_expected_keywords)
    )

    @project = Project.find(2)
    expect(format_text('{{child_pages(ecookbook:Another page)}}', object: WikiPage.find(2).content)).to(
      include(*expected_keywords)
    )
    expect(format_text('{{child_pages(ecookbook:Another page)}}', object: WikiPage.find(2).content)).to_not(
      include(*not_expected_keywords)
    )
  end

  it 'should macro child pages with option' do
    @project = Project.find(1)

    expected_keywords = ['Another page',                  # Parent
                         'Child 1',                       # Child
                         'Child 2',                       # Child
                         'Hierarchy leaf',                # Hierarchy elements
                         'hidden-for-sighted',            # Accessability
                         'tabindex',                      # Accessability
                         'Expanded. Click to collapse']   # Accessability

    # child pages of the current wiki page
    expect(format_text('{{child_pages(parent=1)}}', object: WikiPage.find(2).content)).to(
      include(*expected_keywords)
    )
    # child pages of another page
    expect(format_text('{{child_pages(Another page, parent=1)}}', object: WikiPage.find(2).content)).to(
      include(*expected_keywords)
    )

    @project = Project.find(2)
    expect(format_text('{{child_pages(ecookbook:Another page, parent=1)}}', object: WikiPage.find(2).content)).to(
      include(*expected_keywords)
    )
  end
end
