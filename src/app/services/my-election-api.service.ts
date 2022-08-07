import {HttpClient, HttpHeaders,} from '@angular/common/http';
import {Injectable, OnInit} from "@angular/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MyElectionApiService implements OnInit {

  apiUrl = "http://localhost:3010"

  constructor (
      protected readonly http: HttpClient
  ) {}

  ngOnInit() {

  }

  public findMyCrv(token? : string) : Observable<CrvResponse> {
    return this.http.get<CrvResponse>(this.apiUrl + '/api/v1/crv-lookup/my-crv',  this.buildOptions(token));
  }

  public openCrv(token? : string) : Observable<BaseResponse> {
    return this.http.post<BaseResponse>(this.apiUrl + '/api/v1/open-crv',  {}, this.buildOptions(token));
  }

  public closeCrv(token? : string) : Observable<BaseResponse> {
    return this.http.put<BaseResponse>(this.apiUrl + '/api/v1/close-crv',  {}, this.buildOptions(token));
  }

  public voteRegistration(token?: string, body?: any): Observable<BaseResponse> {
    console.log(body)
    return this.http.post<BaseResponse>(this.apiUrl + '/api/v1/vote-registration',  body, this.buildOptions(token));
  }

  private buildOptions(token? : string) {
    return {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'bearer '+ token
      })};
  }
}

export interface BaseResponse {
  message: string;
}

export interface CrvResponse {
  id: string
  description: string;
  opened: boolean
  message: string
}