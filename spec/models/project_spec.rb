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

require 'spec_helper'

describe Project, type: :model do
  include BecomeMember

  let(:project) { FactoryGirl.create(:project, is_public: false) }
  let(:admin) { FactoryGirl.create(:admin) }
  let(:user) { FactoryGirl.create(:user) }

  describe Project::STATUS_ACTIVE do
    it 'equals 1' do
      # spec that STATUS_ACTIVE has the correct value
      expect(Project::STATUS_ACTIVE).to eq(1)
    end
  end

  describe '#active?' do
    before do
      # stub out the actual value of the constant
      stub_const('Project::STATUS_ACTIVE', 42)
    end

    it 'is active when :status equals STATUS_ACTIVE' do
      project = FactoryGirl.create :project, status: 42
      expect(project).to be_active
    end

    it "is not active when :status doesn't equal STATUS_ACTIVE" do
      project = FactoryGirl.create :project, status: 99
      expect(project).not_to be_active
    end
  end

  describe 'associated_project_candidates' do
    let(:project_type) { FactoryGirl.create(:project_type, allows_association: true) }

    before do
      FactoryGirl.create(:type_standard)
    end

    it 'should not include the project' do
      project.project_type = project_type
      project.save!

      expect(project.associated_project_candidates(admin)).to be_empty
    end
  end

  describe 'add_work_package' do
    let(:project) { FactoryGirl.create(:project_with_types) }

    it 'should return a new work_package' do
      expect(project.add_work_package).to be_a(WorkPackage)
    end

    it 'should not be saved' do
      expect(project.add_work_package).to be_new_record
    end

    it 'returned work_package should have project set to self' do
      expect(project.add_work_package.project).to eq(project)
    end

    it "returned work_package should have type set to project's first type" do
      expect(project.add_work_package.type).to eq(project.types.first)
    end

    it 'returned work_package should have type set to provided type' do
      specific_type = FactoryGirl.build(:type)
      project.types << specific_type

      expect(project.add_work_package(type: specific_type).type).to eq(specific_type)
    end

    it "should raise an error if the provided type is not one of the project's types" do
      # Load project first so that the new type is not automatically included
      project
      specific_type = FactoryGirl.create(:type)

      expect { project.add_work_package(type: specific_type) }.to raise_error ActiveRecord::RecordNotFound
    end

    it 'returned work_package should have type set to provided type_id' do
      specific_type = FactoryGirl.build(:type)
      project.types << specific_type

      expect(project.add_work_package(type_id: specific_type.id).type).to eq(specific_type)
    end

    it 'should set all the other attributes' do
      attributes = { blubs: double('blubs') }

      new_work_package = FactoryGirl.build_stubbed(:work_package)
      expect(new_work_package).to receive(:attributes=).with(attributes)

      allow(WorkPackage).to receive(:new).and_yield(new_work_package)

      project.add_work_package(attributes)
    end
  end

  describe '#find_visible' do
    it 'should find the project by id if the user is project member' do
      become_member_with_permissions(project, user, :view_work_packages)

      expect(Project.find_visible(user, project.id)).to eq(project)
    end

    it 'should find the project by identifier if the user is project member' do
      become_member_with_permissions(project, user, :view_work_packages)

      expect(Project.find_visible(user, project.identifier)).to eq(project)
    end

    it 'should not find the project by identifier if the user is no project member' do
      expect { Project.find_visible(user, project.identifier) }.to raise_error ActiveRecord::RecordNotFound
    end

    it 'should not find the project by id if the user is no project member' do
      expect { Project.find_visible(user, project.id) }.to raise_error ActiveRecord::RecordNotFound
    end
  end

  context 'when the wiki module is enabled' do
    let(:project) { FactoryGirl.create(:project, disable_modules: 'wiki') }

    before :each do
      project.enabled_module_names = project.enabled_module_names | ['wiki']
      project.save
      project.reload
    end

    it 'creates a wiki' do
      expect(project.wiki).to be_present
    end

    it 'creates a wiki menu item named like the default start page' do
      expect(project.wiki.wiki_menu_items).to be_one
      expect(project.wiki.wiki_menu_items.first.title).to eq(project.wiki.start_page)
    end
  end

  describe 'copy_allowed?' do
    let(:user) { FactoryGirl.create(:user) }
    let(:role_add_subproject) { FactoryGirl.create(:role, permissions: [:add_subprojects]) }
    let(:role_copy_projects) { FactoryGirl.create(:role, permissions: [:edit_project, :copy_projects, :add_project]) }
    let(:parent_project) { FactoryGirl.create(:project) }
    let(:project) { FactoryGirl.create(:project, parent: parent_project) }
    let!(:subproject_member) {
      FactoryGirl.create(:member,
                         user: user,
                         project: project,
                         roles: [role_copy_projects])
    }
    before do
      allow(User).to receive(:current).and_return(user)
    end

    context 'with permission to add subprojects' do
      let!(:member_add_subproject) {
        FactoryGirl.create(:member,
                           user: user,
                           project: parent_project,
                           roles: [role_add_subproject])
      }

      it 'should allow copy' do
        expect(project.copy_allowed?).to eq(true)
      end
    end

    context 'with permission to add subprojects' do
      it 'should not allow copy' do
        expect(project.copy_allowed?).to eq(false)
      end
    end
  end

  describe 'avialable principles' do
    let(:user) { FactoryGirl.create(:user) }
    let(:group) { FactoryGirl.create(:group) }
    let(:role) { FactoryGirl.create(:role) }
    let!(:user_member) {
      FactoryGirl.create(:member,
                         principal: user,
                         project: project,
                         roles: [role])
    }
    let!(:group_member) {
      FactoryGirl.create(:member,
                         principal: group,
                         project: project,
                         roles: [role])
    }

    shared_examples_for 'respecting group assignment settings' do
      context 'with group assignment' do
        before { allow(Setting).to receive(:work_package_group_assignment?).and_return(true) }

        it { is_expected.to match_array([user, group]) }
      end

      context 'w/o group assignment' do
        before { allow(Setting).to receive(:work_package_group_assignment?).and_return(false) }

        it { is_expected.to match_array([user]) }
      end
    end

    describe 'assignees' do
      subject { project.possible_assignees }

      it_behaves_like 'respecting group assignment settings'
    end

    describe 'responsibles' do
      subject { project.possible_responsibles }

      it_behaves_like 'respecting group assignment settings'
    end
  end

  describe 'countable required_project_storage' do
    describe '#required_storage' do
      it 'counts collections' do
        expect(project).to receive(:count_for).with(:required_project_storage).and_call_original
        storage_hash = project.required_storage
        expect(storage_hash).to eq('attributes.attachments' => 0, total: 0)
      end

      it 'counts only once before caching' do
        expect(project)
          .to receive(:count_for).with(:required_project_storage)
          .once
          .and_return([{ 'whatever' => 123, total: 1234 }, 'my label'])

        project.required_storage
        project.required_storage
      end
    end

    describe '#total_projects_size' do
      let(:projects) { FactoryGirl.build_list(:project, 3) }
      before do
        projects.each(&:save!)
        allow(Project).to receive(:all).and_return(projects)

        allow(projects[0]).to receive(:count_for).and_return(
          [{ 'attributes.attachments' => 23543, total: 23543 },
           'unused project label']
        )
        allow(projects[1]).to receive(:count_for).and_return(
          [{ 'attributes.attachments' => 2, label_repository: 2412345, total: 2412347 },
           'unused project label']
        )
        Rails.cache.clear('projects/total_projects_size')
      end

      it 'counts required_storage on all projects' do
        expect(Project.all.length).to eq(3)
        expect(Project.total_projects_size).to eq(2435890)
      end

      it 'counts required_storage only once' do
        expect(project).not_to receive(:count_for).with(:required_project_storage)
        projects.each do |p|
          expect(p).not_to receive(:count_for)
            .with(:required_project_storage)
            .once
            .and_call_original
        end
        Project.total_projects_size
        Project.total_projects_size
      end
    end
  end
end
