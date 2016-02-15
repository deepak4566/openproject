// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

angular
  .module('openproject.inplace-edit')
  .directive('inplaceEditorWikiTextarea', inplaceEditorWikiTextarea);

function inplaceEditorWikiTextarea(AutoCompleteHelper, $timeout) {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    templateUrl: '/components/inplace-edit/field-directives/edit-wiki-textarea/' +
      'edit-wiki-textarea.directive.html',

    controller: InplaceEditorWikiTextareaController,
    controllerAs: 'customEditorController',

    link: function(scope, element) {
      $timeout(function() {
        AutoCompleteHelper.enableTextareaAutoCompletion(element.find('textarea'));
      });

      var textarea = element.find('textarea').on('change', function () {
        textarea.data('changed', true);
      });

      // Listen to elastic textara expansion to always make the bottom
      // of that textarea visible.
      // Otherwise, when expanding the textarea with newlines,
      // its bottom border may no longer be visible
      scope.$on('elastic:resize', function(event, textarea, oldHeight, newHeight) {
        var containerHeight = element.scrollParent().height();

        // We can only help the user if the whole textarea fits in the screen
        if (newHeight >= (containerHeight - (containerHeight / 5))) {
          return;
        }

        $timeout(function() {
          var controls = element.closest('.inplace-edit--form ')
            .find('.inplace-edit--controls');

          if (!controls.isVisibleWithin(controls.scrollParent())) {
            controls[0].scrollIntoView(false);
          }
        }, 200);
      });
    }
  };
}

function InplaceEditorWikiTextareaController($scope, $sce, TextileService, EditableFieldsState) {
  var field = $scope.field;

  this.isPreview = false;
  this.previewHtml = '';

  this.togglePreview = function() {
    this.isPreview = !this.isPreview;
    this.previewHtml = '';
    // $scope.error = null;
    if (!this.isPreview) {
      return;
    }

    $scope.fieldController.state.isBusy = true;
    TextileService.renderWithWorkPackageContext(EditableFieldsState.workPackage.form,
        field.value.raw)

      .then(angular.bind(this, function(r) {
        this.previewHtml = $sce.trustAsHtml(r.data);
        $scope.fieldController.state.isBusy = false;
      }), angular.bind(this, function() {
        this.isPreview = false;
        $scope.fieldController.state.isBusy = false;
      }));
  };
}
