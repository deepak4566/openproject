import {Component, ElementRef, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {I18nService} from 'core-app/modules/common/i18n/i18n.service';
import {WorkPackageResource} from 'core-app/modules/hal/resources/work-package-resource';
import {PathHelperService} from 'core-app/modules/common/path-helper/path-helper.service';
import {componentDestroyed} from 'ng2-rx-componentdestroyed';
import {takeUntil} from 'rxjs/operators';
import {WorkPackageCacheService} from '../../work-packages/work-package-cache.service';
import {WorkPackageNotificationService} from '../../wp-edit/wp-notification.service';
import {WorkPackageRelationsHierarchyService} from '../wp-relations-hierarchy/wp-relations-hierarchy.service';

@Component({
  selector: 'wp-relation-parent',
  templateUrl: './wp-relations-parent.html'
})
export class WpRelationParentComponent implements OnInit, OnDestroy {
  @Input() public workPackage:WorkPackageResource;
  public showEditForm:boolean = false;
  public canModifyHierarchy:boolean = false;
  public selectedWpId:string | null = null;
  public isSaving = false;

  constructor(readonly elementRef:ElementRef,
              readonly wpRelationsHierarchyService:WorkPackageRelationsHierarchyService,
              readonly wpCacheService:WorkPackageCacheService,
              readonly wpNotificationsService:WorkPackageNotificationService,
              readonly PathHelper:PathHelperService,
              readonly I18n:I18nService) {
  }

  public text = {
    add_parent: this.I18n.t('js.relation_buttons.add_parent'),
    change_parent: this.I18n.t('js.relation_buttons.change_parent'),
    remove_parent: this.I18n.t('js.relation_buttons.remove_parent'),
    remove: this.I18n.t('js.relation_buttons.remove'),
    parent: this.I18n.t('js.relation_labels.parent'),
    abort: this.I18n.t('js.relation_buttons.abort'),
    save: this.I18n.t('js.relation_buttons.save'),
  };

  ngOnDestroy() {
    // Nothing to do
  }

  ngOnInit() {
    this.canModifyHierarchy = !!this.workPackage.changeParent;

    this.wpCacheService.state(this.workPackage.id)
      .values$()
      .pipe(
        takeUntil(componentDestroyed(this))
      )
      .subscribe(wp => this.workPackage = wp);
  }

  public updateSelectedId(workPackageId:string) {
    this.selectedWpId = workPackageId;
  }

  public changeParent() {
    if (_.isNil(this.selectedWpId)) {
      return;
    }

    const newParentId = this.selectedWpId;
    this.showEditForm = false;
    this.selectedWpId = null;
    this.isSaving = true;

    this.wpRelationsHierarchyService.changeParent(this.workPackage, newParentId)
      .then((updatedWp:WorkPackageResource) => {
        setTimeout(() => jQuery('#hierarchy--parent').focus());
      })
      .catch((err:any) => {
        this.wpNotificationsService.handleRawError(err, this.workPackage);
      })
      .then(() => this.isSaving = false); // Behaves as .finally()
  }

  public get relationReady() {
    return this.workPackage.parent && this.workPackage.parent.$loaded;
  }

  public removeParent() {
    this.wpRelationsHierarchyService
      .removeParent(this.workPackage)
      .then(() => {
        this.wpNotificationsService.showSave(this.workPackage);
        setTimeout(() => {
          jQuery('#hierarchy--add-parent').focus();
        });
      });
  }
}
