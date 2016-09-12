import {Component, Inject} from 'angular2/core';
import { Http ,Headers , HTTP_PROVIDERS } from 'angular2/http';
import 'rxjs/Rx';

@Component({
  selector: 'anydeal-rss',
  template: '<b>YAY</b>',
  viewProviders: [HTTP_PROVIDERS]
  // providers: [HTTP_PROVIDERS]
})
export class AppComponent {
  http: Http;
  people;
  constructor(http: Http) {
    http.get('https://swapi.co/api/people/1/?format=json')
      // Call map on the response observable to get the parsed people object
      .map(res => res.json())
      // Subscribe to the observable to get the parsed people object and attach it to the
      // component
      // .subscribe(people => this.people = people);
      .subscribe(people => console.log(people));
  }
}



// import {Http, HTTP_PROVIDERS} from 'angular2/http';
// @Component({
  // selector: 'http-app',
  // viewProviders: [HTTP_PROVIDERS],
  // templateUrl: 'people.html'
// })
// class PeopleComponent {
  
// }