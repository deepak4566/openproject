Given (/^there are the following planning elements(?: in project "([^"]*)")?:$/) do |project_name, table|
  project = get_project(project_name)
  table.map_headers! { |header| header.underscore.gsub(' ', '_') }

  table.hashes.each do |type_attributes|

    [
      ["planning_element_status", PlanningElementStatus],
      ["responsible", User],
      ["assigned_to", User],
      ["planning_element_type", PlanningElementType],
      ["fixed_version", Version],
      ["priority", IssuePriority],
      ["parent", WorkPackage]
    ].each do |key, const|
      if type_attributes[key].present?
        type_attributes[key] = InstanceFinder.find(const, type_attributes[key])
      else
        type_attributes.delete(key)
      end
    end

    factory = FactoryGirl.create(:planning_element, type_attributes.merge(:project_id => project.id))
  end
end
