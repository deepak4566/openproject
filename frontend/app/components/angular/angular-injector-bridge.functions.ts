
  /**
   * Returns the currently bootstrapped injector from the application.
   * Not applicable until after the application bootstrapping is done.
   */
  export function $currentInjector() {
    return angular.element(document.body).injector();
  }

  export function $injectNow(dep:string) {
    return $currentInjector().get(dep);
  }

  /**
   * Detects desired injections from `target.$inject = [...]` definitions
   * analogous to how angular does its DI, only that we're not registering the
   * factory.
   *
   * @param injectable The target to inject into
   */
  export function injectorBridge(injectable:any) {
    let $injector = $currentInjector();
    $injector.annotate(injectable.constructor).forEach((dep:string) => {
      injectable[dep] = $injector.get(dep);
    });
  }
