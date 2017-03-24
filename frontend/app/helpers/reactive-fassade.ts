import {scopedObservable} from "./angular-rx-utils";
import IScope = angular.IScope;
import {BehaviorSubject, Observable, Subject} from "rxjs";

export abstract class StoreElement {

  public pathInStore: string;

  public logFn: (msg: any) => any;

  log(msg: string, reason?: string) {
    reason = reason === undefined ? "" : " // " + reason;
    if (this.pathInStore && this.logFn) {
      this.logFn("[" + this.pathInStore + "] " + msg + reason);
    }
  }
}

interface PromiseLike<T> {
  then(successCallback: (value: T) => any, errorCallback: (value: T) => any): any;
}

export class State<T> extends StoreElement {

  private timestampOfLastValue = -1;

  private timestampOfLastPromise = -1;

  private subject = new BehaviorSubject<T|null>(null);

  private lastValue: T|null = null;

  private cleared = new Subject<null>();

  private observable: Observable<T|null>;

  constructor() {
    super();
    this.observable = this.subject.filter(val => val !== null && val !== undefined);
  }

  /**
   * Returns true if this state either has a value of if
   * a value is awaited from a promise (via putFromPromise).
   */
  public isPristine(): boolean {
    return this.timestampOfLastValue === -1 && this.timestampOfLastPromise === -1;
  }

  public isValueOrPromiseOlderThan(timeoutInMs: number) {
    const ageValue = Date.now() - this.timestampOfLastValue;
    const agePromise = Date.now() - this.timestampOfLastPromise;
    return ageValue > timeoutInMs && agePromise > timeoutInMs;
  }

  public hasValue(): boolean {
    return this.lastValue !== null && this.lastValue !== undefined;
  }

  /**
   * Returns the current value or 'null', if no value is present.
   * Therefore, calls to this method should always be guarded by State#hasValue().
   *
   * However, it is usually better to use State#get()/State#observe().
   */
  public getCurrentValue(): T|null {
    return this.lastValue;
  }

  public clear(reason?: string): this {
    this.log("State#clear()", reason);
    this.setState(null);
    return this;
  }

  public put(value: T, reason?: string): this {
    this.log("State#put(...)", reason);
    this.setState(value);
    return this;
  }

  public putFromPromise(promise: PromiseLike<T>): this {
    this.clear();
    this.timestampOfLastPromise = Date.now();
    promise.then(
      // success
      (value: T) => {
        this.log("State#putFromPromise(...)");
        this.setState(value);
      },
      // error
      () => {
        this.log("State#putFromPromise ERROR");
        this.timestampOfLastPromise = -1;
      }
    );
    return this;
  }

  public putFromPromiseIfPristine(calledIfPristine: () => PromiseLike<T>): this {
    if (this.isPristine()) {
      this.putFromPromise(calledIfPristine());
    }
    return this;
  }

  public get() {
    return this.observable.take(1).toPromise();
  }

  public observeOnScope(scope: IScope): Observable<T> {
    return this.scopedObservable(scope);
  }

  public observeUntil(unsubscribeNotifier: Observable<any>): Observable<T> {
    return this.observable.takeUntil(unsubscribeNotifier);
  }

  public observeCleared(scope: IScope): Observable<any> {
    return scope ? scopedObservable(scope, this.cleared.asObservable()) : this.cleared.asObservable();
  }

  private scopedObservable(scope: IScope): Observable<T> {
    return scope ? scopedObservable(scope, this.observable) : this.observable;
  }

  protected setState(val: T|null) {
    this.lastValue = val;
    this.subject.next(val);

    if (val === null || val === undefined) {
      this.timestampOfLastValue = -1;
      this.timestampOfLastPromise = -1;
      this.cleared.next(null);
    } else {
      this.timestampOfLastValue = Date.now();
    }
  }


}

export class MultiStateMember<T> extends State<T> {

  // Behaves as a regular state, but keeps a reference to a multistate
  // to notify the overall observable.
  constructor(public id:string, public parentMultiState:MultiState<T>) {
    super();
  }

  // Change this state and notify the associated MultiState
  // of the change.
  protected setState(val: T) {
    super.setState(val);
    this.parentMultiState.changed(this.id, val);
  }
}

export class MultiState<T> extends StoreElement {

  private states: {[id: string]: MultiStateMember<T>} = {};

  private memberSubject = new BehaviorSubject<[string, T|null]>(['', null]);

  constructor() {
    super();
  }

  clearAll() {
    this.states = {};
  }

  public get(id: string): MultiStateMember<T> {
    if (this.states[id] === undefined) {
      this.states[id] = new MultiStateMember<T>(id, this);
    }
    return this.states[id];
  }

  /**
   * Observe changes on this multistate.
   *
   * @param scope An optional scope
   * @returns {Observable<string>} Observable on the changed ids
   */
  public observe(scope: IScope): Observable<[string, T]> {
    return scope ? scopedObservable(scope, this.memberSubject) : this.memberSubject;
  }

  /**
   * Observe changes on this multistate until another subject is triggered.
   *
   * @param scope An optional scope
   * @returns {Observable<string>} Observable on the changed ids
   */
  public observeUntil(subject: Observable<any>): Observable<[string, T]> {
    return this.memberSubject.takeUntil(subject);
  }

  /**
   * Notify MultiState of a change in member {id}.
   * @param id The id of the changed member
   * @param value The next value
   */
  public changed(id: string, value: T) {
    this.memberSubject.next([id, value]);
  }
}

function traverse(elem: any, path: string, logFn: (msg: any) => any) {

  for (const key in elem) {
    if (!elem.hasOwnProperty(key)) {
      continue;
    }
    const value = elem[key];

    let location = path.length > 0 ? path + "." + key : key;
    if (value instanceof StoreElement) {
      value.pathInStore = location;
      value.logFn = logFn;
    } else {
      traverse(value, location, logFn);
    }
  }

}

export function initStates(states: any, logFn: (msg: any) => any) {
  return traverse(states, "", logFn);
}
