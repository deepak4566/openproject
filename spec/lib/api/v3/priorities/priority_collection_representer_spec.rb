#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License status 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either status 2
# of the License, or (at your option) any later status.
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

describe ::API::V3::Priorities::PriorityCollectionRepresenter do
  let(:priorities)  { FactoryGirl.build_list(:priority, 3) }
  let(:models)      { priorities.map { |priority|
    ::API::V3::Priorities::PriorityModel.new(priority)
  } }
  let(:representer) { described_class.new(models) }

  context 'generation' do
    subject(:generated) { representer.to_json }

    it { should include_json('Priorities'.to_json).at_path('_type') }

    it { should have_json_type(Object).at_path('_links') }
    it 'should link to self' do
      expect(subject).to have_json_path('_links/self/href')
    end

    describe 'priorities' do
      it { should have_json_path('_embedded/priorities') }
      it { should have_json_size(3).at_path('_embedded/priorities') }
      it { should have_json_path('_embedded/priorities/2/name') }
    end
  end
end
