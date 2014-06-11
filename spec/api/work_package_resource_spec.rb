require 'spec_helper'
require 'rack/test'

describe 'API v3 Work package resource' do
  include Rack::Test::Methods

  let(:work_package) { FactoryGirl.create(:work_package, :project_id => project.id) }
  let(:project) { FactoryGirl.create(:project, :identifier => 'test_project', :is_public => false) }
  let(:current_user) { FactoryGirl.create(:user) }
  let(:role) { FactoryGirl.create(:role, permissions: [:view_work_packages]) }
  let(:unauthorize_user) { FactoryGirl.create(:user) }
  let(:type) { FactoryGirl.create(:type) }

  describe '#get' do
    let(:get_path) { "/api/v3/work_packages/#{work_package.id}" }
    let(:expected_response) do
      {
        "_type" => 'WorkPackage',
        "_links" => {
          "self" => {
            "href" => "http://localhost:3000/api/v3/work_packages/#{work_package.id}",
            "title" => work_package.subject
          }
        },
        "id" => work_package.id,
        "subject" => work_package.subject,
        "type" => work_package.type.name,
        "description" => work_package.description,
        "status" => work_package.status.name,
        "priority" => work_package.priority.name,
        "startDate" => work_package.start_date,
        "dueDate" => work_package.due_date,
        "estimatedTime" => JSON.parse({ units: 'hours', value: work_package.estimated_hours }.to_json),
        "percentageDone" => work_package.done_ratio,
        "versionId" => work_package.fixed_version_id,
        "versionName" => work_package.fixed_version.try(:name),
        "projectId" => work_package.project_id,
        "projectName" => work_package.project.name,
        "responsibleId" => work_package.responsible_id,
        "responsibleName" => work_package.responsible.try(:name),
        "responsibleLogin" => work_package.responsible.try(:login),
        "responsibleMail" => work_package.responsible.try(:mail),
        "assigneeId" => work_package.assigned_to_id,
        "assigneeName" => work_package.assigned_to.try(:name),
        "assigneeLogin" => work_package.assigned_to.try(:login),
        "assigneeMail" => work_package.assigned_to.try(:mail),
        "authorName" => work_package.author.name,
        "authorLogin" => work_package.author.login,
        "authorMail" => work_package.author.mail,
        "createdAt" => work_package.created_at.utc.iso8601,
        "updatedAt" => work_package.updated_at.utc.iso8601
      }
    end

    context 'when acting as a user with permission to view work package' do

      before(:each) do
        allow(User).to receive(:current).and_return current_user
        member = FactoryGirl.build(:member, user: current_user, project: work_package.project)
        member.role_ids = [role.id]
        member.save!
        get get_path
      end

      it 'should respond with 200' do
        last_response.status.should eq(200)
      end

      it 'should respond with work package in HAL+JSON format' do
        parsed_response = JSON.parse(last_response.body)
        parsed_response.should eq(expected_response)
      end

      context 'requesting nonexistent work package' do
        let(:get_path) { "/api/v3/work_packages/909090" }

        it 'should respond with 404' do
          last_response.status.should eq(404)
        end

        it 'should respond with explanatory error message' do
          parsed_errors = JSON.parse(last_response.body)['errors']
          parsed_errors.should eq([{ 'key' => 'not_found', 'messages' => ['Couldn\'t find WorkPackage with id=909090']}])
        end
      end
    end

    context 'when acting as an user without permission to view work package' do
      before(:each) do
        allow(User).to receive(:current).and_return unauthorize_user
        get get_path
      end

      it 'should respond with 403' do
        last_response.status.should eq(403)
      end

      it 'should respond with explanatory error message' do
        parsed_errors = JSON.parse(last_response.body)['errors']
        parsed_errors.should eq([{ 'key' => 'not_authorized', 'messages' => ['You are not authorize to access this resource']}])
      end
    end

    context 'when acting as an anonymous user' do
      before(:each) do
        allow(User).to receive(:current).and_return User.anonymous
        get get_path
      end

      it 'should respond with 401' do
        last_response.status.should eq(401)
      end

      it 'should respond with explanatory error message' do
        parsed_errors = JSON.parse(last_response.body)['errors']
        parsed_errors.should eq([{ 'key' => 'not_authenticated', 'messages' => ['You need to be authenticated to access this resource']}])
      end
    end

  end
end
