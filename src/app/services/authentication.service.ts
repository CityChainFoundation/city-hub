import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class AuthenticationService {

    constructor() { }

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasAuthenticated());

    private authenticated = false;

    isAuthenticated(): Observable<boolean> {
        return this.isAuthenticatedSubject.asObservable();
    }

    setAuthenticated() {
        this.authenticated = true;
        this.isAuthenticatedSubject.next(this.authenticated);
    }

    setAnonymous() {
        this.authenticated = false;
        this.isAuthenticatedSubject.next(this.authenticated);
    }

    private hasAuthenticated(): boolean {
        return this.authenticated;
    }
}
