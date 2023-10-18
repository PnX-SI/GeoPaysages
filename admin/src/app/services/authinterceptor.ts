import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { catchError} from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';



@Injectable()

export class AuthInterceptor implements HttpInterceptor {
    constructor() {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const cloned = req.clone({
            withCredentials: true
        });
        return next.handle(cloned)
            .pipe(
                catchError(err => {
                    return throwError(err);
                })
            );
    }
}


