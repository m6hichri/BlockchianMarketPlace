import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpRequest } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
//import { Gallery } from './gallery';

const apiUrl = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) { }
  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }

  getGalleryById(name: string): Observable<any> {
    const url = `${apiUrl}/${name}`;
    console.log("url",url);
    return this.http.get<any>(url).pipe(
      catchError(this.handleError)
    );
  }

  addGallery(file: File): Observable<any> {
    const formData = new FormData();
    
    formData.append('img', file);
    const header = new HttpHeaders();
    const params = new HttpParams();
    const options = {
      params,
      reportProgress: true,
      headers: header
    };
    const req = new HttpRequest('POST', apiUrl, formData);
    return this.http.request(req);
  }
}
