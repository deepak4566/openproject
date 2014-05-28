require 'roar/decorator'
require 'roar/representer/json/hal'

module WorkPackages
  class WorkPackageRepresenter < Roar::Decorator
    include Roar::Representer::JSON::HAL
    include Roar::Representer::Feature::Hypermedia
    include Rails.application.routes.url_helpers

    self.as_strategy = CamelCasingStrategy.new

    property :_type, exec_context: :decorator

    link :self do
      { href: "http://localhost:3000/api/v3/work_packages/#{represented.work_package.id}", title: "#{represented.subject}" }
    end

    property :id, getter: lambda { |*| work_package.id }
    property :subject
    property :type
    property :description
    property :status
    property :priority
    property :start_date, getter: lambda { |*| work_package.start_date }, render_nil: true
    property :due_date, getter: lambda { |*| work_package.due_date }, render_nil: true
    property :estimated_time
    property :percentage_done
    property :version_id, getter: lambda { |*| work_package.fixed_version.try(:id) }, render_nil: true
    property :version_name,  getter: lambda { |*| work_package.fixed_version.try(:name) }, render_nil: true
    property :project_id, getter: lambda { |*| work_package.project.id }
    property :project_name, getter: lambda { |*| work_package.project.try(:name) }
    property :responsible_id, getter: lambda { |*| work_package.responsible.try(:id) }, render_nil: true
    property :responsible_name, getter: lambda { |*| work_package.responsible.try(:name) }, render_nil: true
    property :responsible_login, getter: lambda { |*| work_package.responsible.try(:login) }, render_nil: true
    property :responsible_mail, getter: lambda { |*| work_package.responsible.try(:mail) }, render_nil: true
    property :assigned_to_id, as: :assigneeId, getter: lambda { |*| work_package.assigned_to.try(:id) }, render_nil: true
    property :assignee_name, getter: lambda { |*| work_package.assigned_to.try(:name) }, render_nil: true
    property :assignee_login, getter: lambda { |*| work_package.assigned_to.try(:login) }, render_nil: true
    property :assignee_mail, getter: lambda { |*| work_package.assigned_to.try(:mail) }, render_nil: true
    property :author_name, getter: lambda { |*| work_package.author.name }
    property :author_login, getter: lambda { |*| work_package.author.login }
    property :author_mail, getter: lambda { |*| work_package.author.mail }
    property :created_at, getter: lambda { |*| work_package.created_at.utc.iso8601}
    property :updated_at, getter: lambda { |*| work_package.updated_at.utc.iso8601}

    def _type
      "WorkPackage"
    end
  end
end
