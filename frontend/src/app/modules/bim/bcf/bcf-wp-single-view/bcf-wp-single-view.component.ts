import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {StateService} from "@uirouter/core";
import {WorkPackageResource} from "core-app/modules/hal/resources/work-package-resource";
import {NgxGalleryImage, NgxGalleryOptions} from '@kolkov/ngx-gallery';
import {HalLink} from "core-app/modules/hal/hal-link/hal-link";

@Component({
  selector: 'bcf-wp-single-view',
  templateUrl: './bcf-wp-single-view.component.html',
  styleUrls: ['./bcf-wp-single-view.component.sass']
})

export class BcfWpSingleViewComponent implements OnInit, OnDestroy {
  @Input() workPackage:WorkPackageResource;

  galleryOptions:NgxGalleryOptions[] = [
    {
      width: '100%',
      height: '400px',
      thumbnailsColumns: 4,
      imageAnimation: '',
      previewAnimation: false,
      previewCloseOnEsc: true,
      previewKeyboardNavigation: true,
      imageSize: 'contain',
      imageArrowsAutoHide: true,
      thumbnailsArrowsAutoHide: true,
      thumbnailsAutoHide: true,
      thumbnailsMargin: 5,
      thumbnailMargin: 5,
      previewDownload: true,
      arrowPrevIcon: 'icon-arrow-left2',
      arrowNextIcon: 'icon-arrow-right2',
      closeIcon: 'icon-close',
      downloadIcon: 'icon-download',
      previewCloseOnClick: true,
    },
    // max-width 800
    {
      breakpoint: 800,
      width: '100%',
      height: '300px',
      imagePercent: 80,
      thumbnailsPercent: 20,
      thumbnailsMargin: 5,
      thumbnailMargin: 5,
      imageSize: 'contain',
    },
    // max-width 400
    {
      breakpoint: 400,
      height: '200px',
    }
  ];

  galleryImages:NgxGalleryImage[];

  private _viewpointUrls:string[];

  public get viewpoints():string[] {
    return this._viewpointUrls;
  }

  public set viewpoints(viewPoints:string[]) {
    this._viewpointUrls = viewPoints;
  }

  public text = {
  };

  constructor(public readonly state:StateService) {
  }

  ngOnInit():void {
    this.viewpoints = this.workPackage.bcfViewpoints.map((vp:HalLink) => {
      return `${vp.href}/snapshot`;
    });

    this.galleryImages = this.viewpoints.map(url => {
      return {
        small:  url,
        medium: url,
        big:    url,
      };
    });
  }

  public galleryPreviewOpen():void {
    jQuery('#top-menu')[0].style.zIndex = '10';
  }

  public galleryPreviewClose():void {
    jQuery('#top-menu')[0].style.zIndex = '';
  }

  ngOnDestroy():void {
    // Nothing to do.
  }
}
