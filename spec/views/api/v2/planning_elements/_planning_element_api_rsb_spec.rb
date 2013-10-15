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

#
# The spec is still using the planning-elements, although internally only work_packages are used.
#
require File.expand_path('../../../../../spec_helper', __FILE__)

describe 'api/v2/planning_elements/_planning_element.api' do
  before do
    view.extend TimelinesHelper
  end

  # added to pass in locals
  def render
    params[:format] = 'xml'
    super(:partial => 'api/v2/planning_elements/planning_element.api', :object => planning_element)
  end

  before :each do
    view.stub(:include_journals?).and_return(false)
  end

  describe 'with an assigned planning element' do
    let(:project) { FactoryGirl.create(:project, :id => 4711,
                                       :identifier => 'test_project',
                                       :name => 'Test Project') }
    let(:planning_element) { FactoryGirl.build(:work_package,
                                               :id => 1,
                                               :project_id => project.id,
                                               :subject => 'Awesometastic Planning Element',
                                               :description => 'Description of this planning element',

                                               :start_date => Date.parse('2011-12-06'),
                                               :due_date   => Date.parse('2011-12-13'),

                                               :created_at => Time.parse('Thu Jan 06 12:35:00 +0100 2011'),
                                               :updated_at => Time.parse('Fri Jan 07 12:35:00 +0100 2011')) }

    it 'renders a planning_element node' do
      render
      response.should have_selector('planning_element', :count => 1)
    end

    describe 'planning_element node' do
      it 'contains an id element containing the planning element id' do
        render
        response.should have_selector('planning_element id', :text => '1')
      end

      it 'contains a project element containing the planning element\'s project id, identifier and name' do
        render
        response.should have_selector('planning_element project[id="4711"][identifier=test_project][name="Test Project"]')
      end

      it 'contains an name element containing the planning element name' do
        render
        response.should have_selector('planning_element subject', :text => 'Awesometastic Planning Element')
      end

      it 'contains an description element containing the planning element description' do
        render
        response.should have_selector('planning_element description', :text => 'Description of this planning element')
      end

      it 'contains an start_date element containing the planning element start_date in YYYY-MM-DD' do
        render
        response.should have_selector('planning_element start_date', :text => '2011-12-06')
      end

      it 'contains an due_date element containing the planning element due_date in YYYY-MM-DD' do
        render
        response.should have_selector('planning_element due_date', :text => '2011-12-13')
      end

      it 'does not contain a parent node' do
        render
        response.should_not have_selector('planning_element parent')
      end

      it 'does not contain a responsible node' do
        render
        response.should_not have_selector('planning_element responsible')
      end

      it 'does not contain a planning_element_type node' do
        render
        response.should_not have_selector('planning_element type')
      end

      it 'contains a created_at element containing the planning element created_at in UTC in ISO 8601' do
        render
        response.should have_selector('planning_element created_at', :text => '2011-01-06T11:35:00Z')
      end

      it 'contains an updated_at element containing the planning element updated_at in UTC in ISO 8601' do
        render
        response.should have_selector('planning_element updated_at', :text => '2011-01-07T11:35:00Z')
      end
    end
  end

  describe 'with a planning element having a parent' do
    let(:project) { FactoryGirl.create(:project) }

    let(:parent_element)   { FactoryGirl.create(:work_package,
                                            :id         => 1337,
                                            :subject       => 'Parent Element',
                                            :project_id => project.id) }
    let(:planning_element) {  FactoryGirl.build(:work_package,
                                            :parent_id  => parent_element.id,
                                            :project_id => project.id) }

    it 'renders a parent node containing the parent\'s id and subject' do
      render
      response.should have_selector('planning_element parent[id="1337"][subject="Parent Element"]')
    end
  end

  describe 'with a planning element having children' do
    let(:project) { FactoryGirl.create(:project) }
    let(:planning_element) { FactoryGirl.create(:work_package,
                                                :id => 1338,
                                                :project_id => project.id) }
    before do
      FactoryGirl.create(:work_package,
                         :project_id => project.id,
                         :parent_id  => planning_element.id,
                         :id         => 1339,
                         :subject    => 'Child #1')
      FactoryGirl.create(:work_package,
                         :project_id => project.id,
                         :parent_id  => planning_element.id,
                         :id         => 1340,
                         :subject    => 'Child #2')
    end

    it 'renders a children node containing child nodes for each child planning element' do
      render
      response.should have_selector('planning_element children child', :count => 2)
    end

    it 'each child node has an id and subject attribute' do
      render
      response.should have_selector('planning_element children child[id="1339"][subject="Child #1"]', :count => 1)
      response.should have_selector('planning_element children child[id="1340"][subject="Child #2"]', :count => 1)
    end
  end

  describe 'with a planning element having a responsible' do
    let(:responsible)      { FactoryGirl.create(:user,
                                            :id => 1341,
                                            :firstname => 'Paul',
                                            :lastname => 'McCartney') }
    let(:planning_element) { FactoryGirl.build(:work_package,
                                           :responsible_id => responsible.id) }

    it 'renders a responsible node containing the responsible\'s id and name' do
      render
      response.should have_selector('planning_element responsible[id="1341"][name="Paul McCartney"]')
    end
  end

  describe 'with a planning element having a planning element type' do
    let(:type) { FactoryGirl.create(:type,
                                    :id => 1342,
                                    :name => 'Typ A') }
    let(:planning_element) { FactoryGirl.build(:work_package,
                                               :type_id => type.id) }

    it 'renders a planning_element_type node containing the type\'s id and name' do
      render
      response.should have_selector('planning_element planning_element_type[id="1342"][name="Typ A"]')
    end
  end

  describe 'with a planning element having a planning element status' do
    let(:planning_element_status) { FactoryGirl.create(:status,
                                                   :id => 1343,
                                                   :name => 'All well') }
    let(:planning_element) { FactoryGirl.build(:work_package,
                                               :status_id => planning_element_status.id) }

    it 'renders a planning_element_status node containing the status\'s id and name' do
      render
      response.should have_selector('planning_element planning_element_status[id="1343"][name="All well"]')
    end
  end

  describe "a destroyed planning element" do
    let(:planning_element) { FactoryGirl.create(:work_package) }
    before do
      planning_element.destroy
    end

    it 'renders a planning_element node having destroyed=true' do
      render
      response.should have_selector('planning_element[destroyed=true]')
    end
  end
end
