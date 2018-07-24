import { Component, ViewEncapsulation, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { ApplicationStateService } from '../../services/application-state.service';
import { HubConnectionBuilder } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { HDNode, Transaction } from 'bitcoinjs-lib';
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');

export interface Mode {
    name: string;
    id: string;
}
@Component({
    selector: 'app-load',
    templateUrl: './load.component.html',
    styleUrls: ['./load.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LoadComponent {
    @HostBinding('class.load') hostClass = true;

    selectedMode: Mode;
    hasWallet = false;
    modes: Mode[] = [];
    remember: boolean;
    connection: signalR.HubConnection;

    constructor(private authService: AuthenticationService, private router: Router, private appState: ApplicationStateService) {

        this.modes = [
            { id: 'simple', name: 'Mobile' },
            { id: 'light', name: 'Light' },
            { id: 'full', name: 'Full' },
            //{ id: 'pos', name: 'Point-of-Sale (POS)' },
            //{ id: 'readonly', name: 'Read-only' }
        ];

        // If user has choosen to remember mode, we'll redirect directly to login.
        if (localStorage.getItem('Mode') != null) {
            this.router.navigateByUrl('/login');
        }
    }

    launch() {
        if (this.remember) {
            localStorage.setItem('Mode', this.selectedMode.id);
        }

        this.appState.mode = this.selectedMode.id;

        this.router.navigateByUrl('/login');
    }

    simpleWalletConnect() {

        // Meet the new stack for real-time web communication: ASP.NET Core SignalR
        // Learn more: https://www.youtube.com/watch?v=Lws0zOaseIM

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:8081/wallet')
            .build();

        this.connection.on('ReceiveMessage', (user, message) => {
            console.log(user);
            console.log(message);
        });

        this.connection.on('txs', (transactions) => {

            console.log(transactions);

            // TODO: Update a bitcore-lib fork to add support for Stratis/City Chain.
            // var tx1 = transactions[0];
            // var tx = bitcoin.Transaction.fromHex(tx1.value.hex);
        });

        const self = this;

        // Transport fallback functionality is now built into start.
        this.connection.start()
            .then(function () {
                console.log('connection started');
                self.connection.invoke('CreateWallet', 'cityhub-mobile-0.0.1', '2018-01-01', ['SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ']).catch(err => console.error(err.toString()));
            })
            .catch(error => {
                console.error(error.message);
            });
    }

    simpleWalletWatch() {
        this.connection.invoke('Watch', 'SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ').catch(err => console.error(err.toString()));
    }

    simpleWalletBalance() {
        this.connection.invoke('Balance', 'SMsZGWkF9zR5mjxWTYsDq9pU5ZHdUQw1jJ').catch(err => console.error(err.toString()));
    }
}
