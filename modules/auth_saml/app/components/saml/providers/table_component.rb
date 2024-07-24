module Saml
  module Providers
    class TableComponent < ::OpPrimer::BorderBoxTableComponent
      columns :name, :users

      def initial_sort
        %i[id asc]
      end

      def sortable?
        false
      end

      def empty_row_message
        I18n.t 'saml.providers.no_results_table'
      end

      def headers
        [
          ['name', { caption: I18n.t('attributes.name') }],
          ['users', { caption: I18n.t(:label_user_plural) }]
        ]
      end
    end
  end
end
