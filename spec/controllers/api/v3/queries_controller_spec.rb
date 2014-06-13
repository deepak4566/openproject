#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
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

require File.expand_path('../../../../spec_helper', __FILE__)

describe Api::V3::QueriesController do
  let(:current_user) { FactoryGirl.create(:admin) }

  before do
    allow(User).to receive(:current).and_return(current_user)
  end

  describe '#available_columns' do
    context 'with no query_id parameter' do
      it 'assigns available_columns' do
        get :available_columns, format: :xml
        expect(assigns(:available_columns)).not_to be_empty
        expect(assigns(:available_columns).first).to have_key('name')
        expect(assigns(:available_columns).first).to have_key('meta_data')
      end
    end

    it 'renders the available_columns template' do
      get :available_columns, format: :xml
      expect(response).to render_template('api/v3/queries/available_columns', formats: %w(api))
    end
  end

  describe '#custom_field_filters' do
    context 'with no query_id parameter' do
      it 'assigns custom_field_filters' do
        get :available_columns, format: :xml
        expect(assigns(:custom_field_filters)).to be_nil
      end
    end

    it 'renders the custom_field template' do
      get :custom_field_filters, format: :xml
      expect(response).to render_template('api/v3/queries/custom_field_filters', formats: %w(api))
    end
  end

  describe '#grouped' do
    let(:project) { FactoryGirl.create(:project, :identifier => 'test_project') }

    context 'with public and private queries' do
      before do
        FactoryGirl.create :public_query
        FactoryGirl.create :private_query, user: current_user
        FactoryGirl.create :shown_in_all_query, project: project
      end

      it 'renders template' do
        get :grouped, project_id: project.id, format: :xml
        expect(response).to render_template('api/v3/queries/grouped', formats: %w(api))
      end

      it 'assigns user queries' do
        get :grouped, project_id: project.id, format: :xml
        expect(assigns(:user_queries)).not_to be_empty
        expect(assigns(:user_queries).length).to eq(2)
      end

      it 'assigns public queries' do
        get :grouped, format: :xml
        expect(assigns(:queries)).not_to be_empty
        expect(assigns(:queries).length).to eq(1)
      end
    end
  end

end
