//-- copyright
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
//++

module.exports = function($uiViewScroll,
    $timeout,
    $location,
    $sce,
    I18n,
    PathHelper,
    ActivityService,
    UsersHelper,
    UserService,
    ConfigurationService,
    AutoCompleteHelper,
    EditableFieldsState,
    TextileService) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/templates/work_packages/activities/_user.html',
    scope: {
      workPackage: '=',
      activity: '=',
      activityNo: '=',
      activityLabel: '=',
      isInitial: '='
    },
    link: function(scope, element) {
      scope.$watch('inEdit', function(newVal, oldVal) {
        var textarea = element.find('.edit-comment-text');
        if(newVal) {
          $timeout(function() {
            AutoCompleteHelper.enableTextareaAutoCompletion(textarea);
            textarea.focus();
            textarea.on('keydown keypress', function(e) {
              if (e.keyCode === 27) {
                scope.inEdit = false;
              }
            });
          });
        } else {
          textarea.off('keydown keypress');
        }
      });

      scope.I18n = I18n;
      scope.userPath = PathHelper.userPath;
      scope.inEdit = false;
      scope.inPreview = false;
      scope.userCanEdit = !!scope.activity.links.update;
      scope.userCanQuote = !!scope.workPackage.links.addComment;
      scope.accessibilityModeEnabled = ConfigurationService.accessibilityModeEnabled();

      var resource = UserService.getUserByResource(scope.activity.links.user);
      resource.then(function(user) {
        scope.userId = user.props.id;
        scope.userName = user.props.name;
        scope.userAvatar = user.props.avatar;
        scope.userActive = UsersHelper.isActive(user);
        scope.userLabel = I18n.t('js.label_author', { user: scope.userName });
      });

      scope.postedComment = $sce.trustAsHtml(scope.activity.props.comment.html);
      if(scope.postedComment) {
        scope.activityLabelWithComment = I18n.t('js.label_activity_with_comment_no', {
          activityNo: scope.activityNo
        });
      }
      scope.details = [];

      angular.forEach(scope.activity.props.details, function(detail) {
        this.push($sce.trustAsHtml(detail.html));
      }, scope.details);

      $timeout(function() {
        if($location.hash() === 'activity-' + scope.activityNo) {
          $uiViewScroll(element);
        }
      });

      scope.editComment = function() {
        scope.activity.editedComment = scope.activity.props.comment.raw;
        scope.inEdit = true;
      };

      scope.cancelEdit = function() {
        scope.inEdit = false;
      };

      scope.quoteComment = function() {
        scope.$emit(
          'workPackage.comment.quoteThis',
          quotedText(scope.activity.props.comment.raw)
        );
      };

      scope.updateComment = function() {
        ActivityService.updateComment(scope.activity, scope.activity.editedComment).then(function(){
          scope.$emit('workPackageRefreshRequired');
          scope.inEdit = false;
        });
      };

      scope.toggleCommentPreview = function() {
        scope.inPreview = !scope.inPreview;
        scope.previewHtml = '';
        if (scope.inPreview) {
          TextileService.renderWithWorkPackageContext(
            EditableFieldsState.workPackage.form,
            scope.activity.editedComment
          ).then(function(r) {
            scope.previewHtml = $sce.trustAsHtml(r.data);


          }, function() {
            this.inPreview = false;
          });
        }
      };

      var focused = false;
      scope.focus = function() {
        $timeout(function() {
          focused = true;
        });
      };

      scope.blur = function() {
        $timeout(function() {
          focused = false;
        });
      };

      scope.focussing = function() {
        return focused;
      };

      element.bind('focusin', scope.focus);
      element.bind('focusout', scope.blur);

      function quotedText(rawComment) {
        var quoted = rawComment.split("\n")
          .map(function(line){ return "\n> " + line; })
          .join('');
        return scope.userName + " wrote:" + quoted;
      }
    }
  };
};
