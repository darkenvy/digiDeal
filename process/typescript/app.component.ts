import {Component} from 'angular2/core';
import {AjaxComponent} from './ajax.component';

@Component({
  selector: 'main',
  directives: [AjaxComponent],
  templateUrl: 'partials/app.html',
})
export class AppComponent {}