import {Directive, effect, EmbeddedViewRef, inject, input, TemplateRef, ViewContainerRef} from '@angular/core';

interface AppForContext<T> {
  $implicit: T;
  index: number;
  count: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
}

type TrackByFn<T> = (index: number, item: T) => unknown;

@Directive({
  selector: '[appFor]',
})
export class ForDirective<T> {
  private tmplRef = inject(TemplateRef<AppForContext<T>>);
  private vcr = inject(ViewContainerRef);
  private viewCache = new Map<unknown, EmbeddedViewRef<AppForContext<T>>>();

  appFor = input.required<T[]>();
  appForTrackBy = input<TrackByFn<T>>((index) => index);

  constructor() {
    effect(() => {
      const items = this.appFor();
      const trackByFn = this.appForTrackBy();
      const count = items.length;

      const newViewCache = new Map<unknown, EmbeddedViewRef<AppForContext<T>>>();
      const newKeys = new Set<unknown>();

      // Collect keys for new items
      items.forEach((item, index) => {
        const key = trackByFn(index, item);
        newKeys.add(key);
      });

      // Remove views that are no longer needed
      this.viewCache.forEach((view, key) => {
        if (!newKeys.has(key)) {
          const viewIndex = this.vcr.indexOf(view);
          if (viewIndex !== -1) {
            this.vcr.remove(viewIndex);
          }
        }
      });

      // Create or update views for each item
      items.forEach((item, index) => {
        const key = trackByFn(index, item);
        const existingView = this.viewCache.get(key);

        if (existingView) {
          // Update existing view context
          existingView.context.$implicit = item;
          existingView.context.index = index;
          existingView.context.count = count;
          existingView.context.first = index === 0;
          existingView.context.last = index === count - 1;
          existingView.context.even = index % 2 === 0;
          existingView.context.odd = index % 2 !== 0;

          // Move view to correct position if needed
          const currentIndex = this.vcr.indexOf(existingView);
          if (currentIndex !== index) {
            this.vcr.move(existingView, index);
          }

          newViewCache.set(key, existingView);
        } else {
          // Create new view
          const view = this.vcr.createEmbeddedView(this.tmplRef, {
            $implicit: item,
            index,
            count,
            first: index === 0,
            last: index === count - 1,
            even: index % 2 === 0,
            odd: index % 2 !== 0,
          }, index);

          newViewCache.set(key, view);
        }
      });

      this.viewCache = newViewCache;
    });
  }

  /**
   * Type guard for template type checking
   */
  static ngTemplateContextGuard<T>(
    _dir: ForDirective<T>,
    _ctx: unknown
  ): _ctx is AppForContext<T> {
    return true;
  }
}
