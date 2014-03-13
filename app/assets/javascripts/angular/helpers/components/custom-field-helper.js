angular.module('openproject.uiComponents')

.constant('CUSTOM_FIELD_PREFIX', 'cf_')
.service('CustomFieldHelper', ['CUSTOM_FIELD_PREFIX', 'I18n', function(CUSTOM_FIELD_PREFIX, I18n) {
  CustomFieldHelper = {
    isCustomFieldKey: function(key) {
      return key.substr(0, CUSTOM_FIELD_PREFIX.length) === CUSTOM_FIELD_PREFIX;
    },
    getCustomFieldId: function(cfKey) {
      return parseInt(cfKey.substr(CUSTOM_FIELD_PREFIX.length, 10), 10);
    },
    booleanCustomFieldValue: function(value) {
      if (value) {
        if (value === '1') {
          return I18n.t('js.general_text_Yes');
        } else if (value === '0') {
          return I18n.t('js.general_text_No');
        }
      }
    },
    formatCustomFieldValue: function(value, fieldFormat, users) {
      switch(fieldFormat) {
        case 'bool':
          return CustomFieldHelper.booleanCustomFieldValue(value);
        case 'user':
          if (users[value])
            return users[value].name;
          break;
        default:
          return value;
      }
    }
  };

  return CustomFieldHelper;
}]);
