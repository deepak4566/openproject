#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2017 the OpenProject Foundation (OPF)
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
# See doc/COPYRIGHT.rdoc for more details.
#++

require 'spec_helper'

describe ProjectType, type: :model do
  describe '- Relations ' do
    describe '#projects' do
      it 'can read projects w/ the help of the has_many association' do
        project_type = FactoryGirl.create(:project_type)
        project      = FactoryGirl.create(:project, project_type_id: project_type.id)

        project_type.reload

        expect(project_type.projects.size).to eq(1)
        expect(project_type.projects.first).to eq(project)
      end
    end
  end

  describe '- Validations ' do
    let(:attributes) {
      { name:               'Project Type No. 1' }
    }

    describe 'name' do
      it 'is invalid w/o a name' do
        attributes[:name] = nil
        project_type = ProjectType.new(attributes)

        expect(project_type).not_to be_valid

        expect(project_type.errors[:name]).to be_present
        expect(project_type.errors[:name]).to eq(["can't be blank."])
      end

      it 'is invalid w/ a name longer than 255 characters' do
        attributes[:name] = 'A' * 500
        project_type = ProjectType.new(attributes)

        expect(project_type).not_to be_valid

        expect(project_type.errors[:name]).to be_present
        expect(project_type.errors[:name]).to eq(['is too long (maximum is 255 characters).'])
      end
    end
  end
end
