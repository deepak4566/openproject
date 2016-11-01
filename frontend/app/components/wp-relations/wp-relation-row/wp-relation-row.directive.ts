import {wpDirectivesModule} from '../../../angular-modules';
import {RelatedWorkPackage} from '../wp-relations.interfaces';
import {WorkPackageCacheService} from '../../work-packages/work-package-cache.service';
import {WorkPackageNotificationService} from '../../wp-edit/wp-notification.service';
import {WorkPackageResourceInterface} from '../../api/api-v3/hal-resources/work-package-resource.service';
import {WorkPackageRelationsService} from '../wp-relations.service';
import {
  RelationResourceInterface,
  RelationResource
} from '../../api/api-v3/hal-resources/relation-resource.service';

class WpRelationRowDirectiveController {
  public workPackage: WorkPackageResourceInterface;
  public relatedWorkPackage: RelatedWorkPackage;
  public relationType: string;
  public showRelationInfo:boolean = false;
  public showEditForm:boolean = false;
  public availableRelationTypes: RelationResourceInterface[];
  public selectedRelationType: RelationResourceInterface;

  public userInputs = {
    description:this.relatedWorkPackage.relatedBy.description,
    showDescriptionEditForm:false,
    showRelationTypesForm: false,
    showRelationInfo:false
  };

  public relation: RelationResourceInterface = this.relatedWorkPackage.relatedBy;
  public text: Object;

  constructor(protected $scope: ng.IScope,
              protected $timeout:ng.ITimeoutService,
              protected $http,
              protected wpCacheService: WorkPackageCacheService,
              protected wpNotificationsService: WorkPackageNotificationService,
              protected wpRelationsService: WorkPackageRelationsService,
              protected I18n: op.I18n,
              protected PathHelper: op.PathHelper) {

    this.text = {
      removeButton:this.I18n.t('js.relation_buttons.remove')
    };
    this.availableRelationTypes = wpRelationsService.getRelationTypes(true);
    this.selectedRelationType = _.find(this.availableRelationTypes, {'name': this.relation.type});
  };

  /**
   * Return the normalized relation type for the work package we're viewing.
   * That is, normalize `precedes` where the work package is the `to` link.
   */
  public get normalizedRelationType() {
    var type = this.relation.normalizedType(this.workPackage);
    return this.I18n.t('js.relation_labels.' + type);
  }

  public get relationReady() {
    return this.relatedWorkPackage && this.relatedWorkPackage.$loaded;
  }

  public saveDescription() {
    this.relation.updateImmediately({
      description: this.relation.description
    }).then(() => {
      this.userInputs.showDescriptionEditForm = false;
      this.wpNotificationsService.showSave(this.relatedWorkPackage);
    });
  }

  public saveRelationType() {
    this.relation.updateImmediately({
      type: this.selectedRelationType.name
    }).then((savedRelation) => {
      this.wpNotificationsService.showSave(this.relatedWorkPackage);

      this.relatedWorkPackage.relatedBy = savedRelation;
      this.relation = savedRelation;

      this.userInputs.showRelationTypesForm = false;
    });
  }

  public toggleUserDescriptionForm() {
    this.userInputs.showDescriptionEditForm = !this.userInputs.showDescriptionEditForm;
  }

  public removeRelation() {
    this.relation.delete().then(() => {
      this.$scope.$emit('wp-relations.removed', this.relation);
      this.wpCacheService.updateWorkPackage(this.relatedWorkPackage);
      this.wpNotificationsService.showSave(this.relatedWorkPackage);
      this.$timeout(() => {
        angular.element('#relation--add-relation').focus();
      });
    })
      .catch(err => this.wpNotificationsService.handleErrorResponse(err, this.relatedWorkPackage));
  }
}

function WpRelationRowDirective() {
  return {
    restrict:'E',
    templateUrl:'/components/wp-relations/wp-relation-row/wp-relation-row.template.html',
    scope:{
      workPackage: '=',
      relatedWorkPackage: '='
    },
    controller:WpRelationRowDirectiveController,
    controllerAs:'$ctrl',
    bindToController:true
  };
}

wpDirectivesModule.directive('wpRelationRow', WpRelationRowDirective);
