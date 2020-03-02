module IfcModelsHelper
  def provision_gon_for_ifc_model(all_models)
    all_converted_models = converted_ifc_models(all_models)

    gon.ifc_models = {
      models: gon_ifc_model_models(all_converted_models),
      projects: [{id: @project.identifier, name: @project.name}],
      xkt_attachment_ids: gon_ifc_model_xkt_attachment_ids(all_converted_models),
      metadata_attachment_ids: gon_ifc_model_metadata_attachment_ids(all_converted_models),
      permissions: {
        manage: User.current.allowed_to?(:manage_ifc_models, @project)
      }
    }
  end

  def converted_ifc_models(ifc_models)
    ifc_models.select(&:converted?)
  end

  def gon_ifc_model_models(all_models)
    all_converted_models = converted_ifc_models(all_models)

    all_converted_models.map do |ifc_model|
      {
        id: ifc_model.id,
        name: ifc_model.title
      }
    end
  end

  def gon_ifc_model_xkt_attachment_ids(models)
    Hash[models.map { |model| [model.id, model.xkt_attachment.id] }]
  end

  def gon_ifc_model_metadata_attachment_ids(models)
    Hash[
      models.map do |model|
        [model.id,
         model.metadata_attachment.id]
      end
    ]
  end
end
