#-- encoding: UTF-8

#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2020 the OpenProject GmbH
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
# See docs/COPYRIGHT.rdoc for more details.

require 'spec_helper'
require 'rack/test'

describe ::API::V3::Projects::Copy::CreateFormAPI, content_type: :json do
  include Rack::Test::Methods
  include API::V3::Utilities::PathHelper

  shared_let(:text_custom_field) do
    FactoryBot.create(:text_project_custom_field)
  end
  shared_let(:list_custom_field) do
    FactoryBot.create(:list_project_custom_field)
  end

  shared_let(:source_project) do
    FactoryBot.create :project,
                      custom_field_values: {
                        text_custom_field.id => 'source text',
                        list_custom_field.id => list_custom_field.custom_options.last.id
                      }
  end

  shared_let(:current_user) do
    FactoryBot.create :user,
                      member_in_project: source_project,
                      member_with_permissions: %i[copy_projects view_project view_work_packages]
  end

  let(:path) { api_v3_paths.project_copy_form(source_project.id) }
  let(:params) do
    {
    }
  end

  before do
    login_as(current_user)

    post path, params.to_json
  end

  subject(:response) { last_response }

  describe '#POST /api/v3/projects/:id/copy/form' do
    it 'returns 200 FORM response', :aggregate_failures do
      expect(response.status).to eq(200)

      expect(response.body)
        .to be_json_eql('Form'.to_json)
              .at_path('_type')

      expect(Project.count)
        .to eql 1
    end

    it 'retains the values from the source project' do
      expect(response.body)
        .to be_json_eql('source text'.to_json)
              .at_path("_embedded/payload/customField#{text_custom_field.id}/raw")

      expect(response.body)
        .to be_json_eql(list_custom_field.custom_options.last.value.to_json)
              .at_path("_embedded/payload/_links/customField#{list_custom_field.id}/title")
    end

    it 'contains a meta property with copy properties for every module' do
      ::Projects::CopyService.copyable_dependencies.each do |dep|
        identifier = dep[:identifier].to_s.camelize
        expect(response.body)
          .to be_json_eql(true.to_json)
                .at_path("_embedded/payload/_meta/copy#{identifier}")
      end
    end

    it 'shows an empty name as not set' do
      expect(response.body)
        .to be_json_eql(''.to_json)
              .at_path("_embedded/payload/name")

      expect(response.body)
        .to be_json_eql("Name can't be blank.".to_json)
              .at_path("_embedded/validationErrors/name/message")
    end

    context 'updating the form payload' do
      let(:params) do
        {
          name: 'My copied project',
          "customField#{text_custom_field.id}": {
            "raw": "CF text"
          },
          status: 'on track',
          statusExplanation: { raw: "A magic dwells in each beginning." },
          "_links": {
            "customField#{list_custom_field.id}": {
              "href": api_v3_paths.custom_option(list_custom_field.custom_options.first.id)
            }
          }
        }
      end

      it 'sets those values' do
        expect(response.body)
          .to be_json_eql('My copied project'.to_json)
                .at_path("_embedded/payload/name")

        expect(response.body)
          .to be_json_eql('on track'.to_json)
                .at_path("_embedded/payload/status")

        expect(response.body)
          .to be_json_eql('A magic dwells in each beginning.'.to_json)
                .at_path("_embedded/payload/statusExplanation/raw")

        expect(response.body)
          .to be_json_eql('CF text'.to_json)
                .at_path("_embedded/payload/customField#{text_custom_field.id}/raw")

        expect(response.body)
          .to be_json_eql(list_custom_field.custom_options.first.value.to_json)
                .at_path("_embedded/payload/_links/customField#{list_custom_field.id}/title")
      end
    end

    context 'when setting copy meta properties' do
      let(:params) do
        {
          _meta: {
            copyOverview: true
          }
        }
      end

      it 'sets that value to true and all others to false' do
        ::Projects::CopyService.copyable_dependencies.each do |dep|
          identifier = dep[:identifier].to_s.camelize
          expect(response.body)
            .to be_json_eql((identifier == 'Overview').to_json)
                  .at_path("_embedded/payload/_meta/copy#{identifier}")
        end
      end
    end

    context 'without the necessary permission' do
      let(:current_user) do
        FactoryBot.create :user,
                          member_in_project: source_project,
                          member_with_permissions: %i[view_project view_work_packages]
      end

      it 'returns 403 Not Authorized' do
        expect(response.status).to eq(403)
      end
    end
  end
end
