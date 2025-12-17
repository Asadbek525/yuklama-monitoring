import {Component, DoCheck, input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-child',
  imports: [],
  templateUrl: './child.html',
  styleUrl: './child.css',
})
export class Child implements OnInit, OnChanges, DoCheck {
  ngDoCheck(): void {
    console.log('child check')
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
  }
  ngOnInit(): void {
    console.log('child init')
  }
  salom = input<string>()

  constructor() {
    console.log('child constructor')
  }
}
