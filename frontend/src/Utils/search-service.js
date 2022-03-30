import React from "react";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import "rxjs/add/observable/of";
import "rxjs/add/observable/fromPromise";

import "rxjs/add/operator/catch";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import { backend_raw_materials } from "../constants";
import { Auth } from "../components";

export class SearchService {
  constructor() {
    this.searchTerm = new Subject();
  }

  search(term) {
    this.searchTerm.next(term.value);
  }

  doSearch(term) {
    let params = {
      page: 1,
      pageSize: 10,
      name_contains: term,
    };
    let promise = fetch(
      backend_raw_materials + "?" + new URLSearchParams(params),
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + Auth.getToken(),
        },
      }
    ).then((response) => response.json());
    return Observable.fromPromise(promise);
  }

  getResults() {
    return this.searchTerm
      .debounceTime(500)
      .distinctUntilChanged()
      .switchMap((term) => (term ? this.doSearch(term) : Observable.of([])))
      .catch((error) => {
        console.error(error);
        return Observable.of([]);
      });
  }
}
