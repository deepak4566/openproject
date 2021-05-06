import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from "@angular/core";
import { Observable } from "rxjs";

@Component({
  selector: 'op-tab-count',
  templateUrl: './tab-count.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabCountComponent {
  @Input('counter') counter$:Observable<number>;
}