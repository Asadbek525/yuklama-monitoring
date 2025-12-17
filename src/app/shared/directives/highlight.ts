import {Directive, ElementRef, inject, input} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class Highlight {
  appHighlight = input('')
  private el = inject(ElementRef)

  constructor() {
    console.log(this.el)
    this.el.nativeElement.onmouseenter = () => {
      this.el.nativeElement.style.backgroundColor = this.appHighlight();
    }
    (this.el.nativeElement as HTMLElement).onmouseleave = () => {
      this.el.nativeElement.style.backgroundColor = '';
    }
  }

}
