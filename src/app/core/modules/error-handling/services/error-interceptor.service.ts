import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError, EMPTY, Observable} from 'rxjs';
import {ErrorMessage} from '../common/error-message.enum';
import {NotificationService} from "../../../../services/notification.service";


const whiteListedRoutes = [];

@Injectable({
    providedIn: 'root'
})
export class ErrorInterceptorService implements HttpInterceptor {
    constructor(private notificationService: NotificationService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {

                console.error(JSON.stringify(error));


                if (error.error instanceof Error) {
                    // A client-side or network error occurred. Handle it accordingly.
                    this.notificationService.show(ErrorMessage.GENERIC);

                } else {
                    // The backend returned an unsuccessful response code.
                    // The response body may contain clues as to what went wrong,
                    this.notificationService.show(error.error.message == null ? ErrorMessage.GENERIC : error.error.message);
                }

                // If you want to return a new response:
                //return of(new HttpResponse({body: [{name: "Default value..."}]}));

                // If you want to return the error on the upper level:
                //return throwError(error);

                // or just return nothing:
                return EMPTY;
            })
        );
    }

}
