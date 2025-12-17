import { Component } from '@angular/core';
import {Highlight} from '../../shared/directives/highlight';
import {Child} from './child/child';

@Component({
  selector: 'app-test',
  imports: [
    Child
  ],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test {
  protected salom: string = 'Salom from parent';

}
