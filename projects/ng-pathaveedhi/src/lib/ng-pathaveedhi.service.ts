import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Data,
  NavigationEnd,
  Router,
} from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class NgPathaveedhiService {
  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  bradcrumbs$ = this.breadcrumbsSubject.asObservable();
  // create a signal

  initialized = false;
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    console.count('BreadcrumbService created');
  }

  getBreadcrumbs() {
    return this.breadcrumbsSubject.asObservable();
  }

  initialize(): Promise<void> {
    console.log('BreadcrumbService initialized');
    return new Promise((resolve) => {
      // Perform any setup logic here, if needed
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          const root = this.router.routerState.snapshot.root;
          const breadcrumbs: Breadcrumb[] = [];
          this.addBreadcrumb(root, [], breadcrumbs);

          // Emit the new hierarchy
          console.log('Adding Breadcrumb => ', breadcrumbs);
          this.breadcrumbsSubject.next(breadcrumbs);
        });
      resolve();
    });
  }
  register() {
    this.router.events
      .pipe(
        // Filter the NavigationEnd events as the breadcrumb is updated only when the route reaches its end
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        // Construct the breadcrumb hierarchy
        const root = this.router.routerState.snapshot.root;
        const breadcrumbs: Breadcrumb[] = [];
        this.addBreadcrumb(root, [], breadcrumbs);

        // Emit the new hierarchy
        console.log('Adding Breadcrumb => ', breadcrumbs);
        this.breadcrumbsSubject.next(breadcrumbs);
      });
  }

  private addBreadcrumb(
    route: ActivatedRouteSnapshot,
    parentUrl: string[],
    breadcrumbs: Breadcrumb[]
  ) {
    if (route) {
      // Construct the route URL
      const routeUrl = parentUrl.concat(route.url.map((url) => url.path));

      // Add an element for the current route part
      if (route.data['breadcrumb']) {
        // TODO: if route.data['breadcrumb'] is an arr
        const breadcrumb = {
          label: this.getLabel(route.data),
          url: '/' + routeUrl.join('/'),
        };
        // check same url present in the breadcrumb array if yes replace it with the new one
        const index = breadcrumbs.findIndex((b) => b.url === breadcrumb.url);
        if (index !== -1) {
          breadcrumbs[index] = breadcrumb;
        } else {
          breadcrumbs.push(breadcrumb);
        }
      }

      if (route.data['breadcrumbs']) {
        route.data['breadcrumbs'].forEach(
          (breadcrumb: string | Breadcrumb | Function) => {
            if (typeof breadcrumb === 'string') {
              breadcrumbs.push({
                label: breadcrumb,
                url: '/' + routeUrl.join('/'),
              });
            } else if (typeof breadcrumb === 'object') {
              const index = breadcrumbs.findIndex(
                (b) => b.url === breadcrumb.url
              );
              if (index !== -1) {
                breadcrumbs[index] = breadcrumb;
              } else {
                breadcrumbs.push(breadcrumb);
              }
            } else if (typeof breadcrumb === 'function') {
              // resolve the function and push the breadcrumb
              const result = breadcrumb(route.data);
              if (typeof result === 'string') {
                breadcrumbs.push({
                  label: result,
                  url: '/' + routeUrl.join('/'),
                });
              } else {
                const bresult = result.label;
                const index = breadcrumbs.findIndex(
                  (b) => b.url === result.url
                );
                if (index !== -1) {
                  breadcrumbs[index] = result;
                } else {
                  breadcrumbs.push(result);
                }
              }
            }
          }
        );
      }
      console.log('breadcrumbs', breadcrumbs);
      this.breadcrumbsSubject.next(breadcrumbs);
      // Add another element for the next route part
      if (route.firstChild) {
        this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
      }
    }
  }

  private getLabel(data: Data) {
    // The breadcrumb can be defined as a static string or as a function to construct the breadcrumb element out of the route data
    switch (typeof data['breadcrumb']) {
      case 'function':
        return data['breadcrumb'](data);
      case 'string':
        return data['breadcrumb'];
      default:
        return '';
    }
  }
}
