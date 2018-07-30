import { Component, HostBinding, OnDestroy, ViewEncapsulation, OnInit } from '@angular/core';
import { ApplicationStateService } from '../../../services/application-state.service';
import { GlobalService } from '../../../services/global.service';
import { ApiService } from '../../../services/api.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TransactionBuilding } from '../../../classes/transaction-building';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CoinNotationPipe } from '../../../shared/pipes/coin-notation.pipe';
import { FeeEstimation } from '../../../classes/fee-estimation';
import { TransactionSending } from '../../../classes/transaction-sending';
import { WalletInfo } from '../../../classes/wallet-info';

@Component({
    selector: 'app-send',
    templateUrl: './send.component.html',
    styleUrls: ['./send.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SendComponent implements OnInit, OnDestroy {
    @HostBinding('class.send') hostClass = true;

    public sendForm: FormGroup;
    public coinUnit: string;
    public isSending = false;
    public estimatedFee = 0;
    public totalBalance = 0;
    public apiError: string;
    private transactionHex: string;
    private responseMessage: any;
    private errorMessage: string;
    private transaction: TransactionBuilding;
    private walletBalanceSubscription: Subscription;

    constructor(public readonly appState: ApplicationStateService,
        private apiService: ApiService,
        private globalService: GlobalService,
        private fb: FormBuilder
    ) {
        this.appState.pageMode = true;
        this.buildSendForm();
    }

    ngOnInit() {
        this.startSubscriptions();
        this.coinUnit = this.globalService.getCoinUnit();
    }

    ngOnDestroy() {
        this.appState.pageMode = false;
        this.cancelSubscriptions();
    }

    formErrors = {
        'address': '',
        'amount': '',
        'fee': '',
        'password': ''
      };
    
      validationMessages = {
        'address': {
          'required': 'An address is required.',
          'minlength': 'An address is at least 26 characters long.'
        },
        'amount': {
          'required': 'An amount is required.',
          'pattern': 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
          'min': "The amount has to be more or equal to 0.00001 Stratis.",
          'max': 'The total transaction amount exceeds your available balance.'
        },
        'fee': {
          'required': 'A fee is required.'
        },
        'password': {
          'required': 'Your password is required.'
        }
      };

    private buildSendForm(): void {
        this.sendForm = this.fb.group({
            "address": ["", Validators.compose([Validators.required, Validators.minLength(26)])],
            "amount": ["", Validators.compose([Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/), Validators.min(0.00001), (control: AbstractControl) => Validators.max((this.totalBalance - this.estimatedFee) / 100000000)(control)])],
            "fee": ["medium", Validators.required],
            "password": ["", Validators.required]
        });

        this.sendForm.valueChanges.pipe(debounceTime(300))
            .subscribe(data => this.onValueChanged(data));
    }

    onValueChanged(data?: any) {
        if (!this.sendForm) { return; }
        const form = this.sendForm;

        for (const field in this.formErrors) {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }

        this.apiError = "";

        if (this.sendForm.get("address").valid && this.sendForm.get("amount").valid) {
            this.estimateFee();
        }
    }

    public getMaxBalance() {
        let data = {
            walletName: this.globalService.getWalletName(),
            feeType: this.sendForm.get("fee").value
        }

        let balanceResponse;

        this.apiService
            .getMaximumBalance(data)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        balanceResponse = response.json();
                    }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                        this.apiError = "Something went wrong while connecting to the API. Please restart the application."
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                            this.apiError = error.json().errors[0].message;
                        }
                    }
                },
                () => {
                    this.sendForm.patchValue({ amount: +new CoinNotationPipe(this.globalService).transform(balanceResponse.maxSpendableAmount) });
                    this.estimatedFee = balanceResponse.fee;
                }
            )
    }

    public estimateFee() {
        let transaction = new FeeEstimation(
            this.globalService.getWalletName(),
            "account 0",
            this.sendForm.get("address").value.trim(),
            this.sendForm.get("amount").value,
            this.sendForm.get("fee").value,
            true
        );

        this.apiService.estimateFee(transaction)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        this.responseMessage = response.json();
                    }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        }
                        else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                            this.apiError = error.json().errors[0].message;
                        }
                    }
                },
                () => {
                    this.estimatedFee = this.responseMessage;
                }
            )
            ;
    }

    public buildTransaction() {
        this.transaction = new TransactionBuilding(
            this.globalService.getWalletName(),
            "account 0",
            this.sendForm.get("password").value,
            this.sendForm.get("address").value.trim(),
            this.sendForm.get("amount").value,
            this.sendForm.get("fee").value,
            // TO DO: use coin notation
            this.estimatedFee / 100000000,
            true,
            false
        );

        let transactionData;

        this.apiService
            .buildTransaction(this.transaction)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        console.log(response);
                        this.responseMessage = response.json();
                    }
                },
                error => {
                    console.log(error);
                    this.isSending = false;
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                        this.apiError = "Something went wrong while connecting to the API. Please restart the application."
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                            this.apiError = error.json().errors[0].message;
                        }
                    }
                },
                () => {
                    this.estimatedFee = this.responseMessage.fee;
                    this.transactionHex = this.responseMessage.hex;
                    if (this.isSending) {
                        this.sendTransaction(this.transactionHex);
                    }
                }
            );
    }

    public send() {
        this.isSending = true;
        this.buildTransaction();
    }

    private sendTransaction(hex: string) {
        let transaction = new TransactionSending(hex);
        this.apiService
            .sendTransaction(transaction)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        // this.activeModal.close("Close clicked");
                    }
                },
                error => {
                    console.log(error);
                    this.isSending = false;
                    if (error.status === 0) {
                        // this.genericModalService.openModal(null, null);
                        this.apiError = "Something went wrong while connecting to the API. Please restart the application."
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            // this.genericModalService.openModal(null, error.json().errors[0].message);
                            this.apiError = error.json().errors[0].message;
                        }
                    }
                },
                () => this.openConfirmationModal()
            )
            ;
    }

    private getWalletBalance() {
        let walletInfo = new WalletInfo(this.globalService.getWalletName());
        this.walletBalanceSubscription = this.apiService.getWalletBalance(walletInfo)
            .subscribe(
                response => {
                    if (response.status >= 200 && response.status < 400) {
                        let balanceResponse = response.json();
                        // TO DO - add account feature instead of using first entry in array
                        this.totalBalance = balanceResponse.balances[0].amountConfirmed + balanceResponse.balances[0].amountUnconfirmed;
                    }
                },
                error => {
                    console.log(error);
                    if (error.status === 0) {
                        this.cancelSubscriptions();
                        // this.genericModalService.openModal(null, null);
                    } else if (error.status >= 400) {
                        if (!error.json().errors[0]) {
                            console.log(error);
                        } else {
                            if (error.json().errors[0].description) {
                                // this.genericModalService.openModal(null, error.json().errors[0].message);
                            } else {
                                this.cancelSubscriptions();
                                this.startSubscriptions();
                            }
                        }
                    }
                }
            );
    }

    private openConfirmationModal() {

        console.log('Show confirmation TX: ', this.transaction);
        console.log('Show confirmation FEE: ', this.estimatedFee);

        // const modalRef = this.modalService.open(SendConfirmationComponent, { backdrop: "static" });
        // modalRef.componentInstance.transaction = this.transaction;
        // modalRef.componentInstance.transactionFee = this.estimatedFee;
    }

    private cancelSubscriptions() {
        if (this.walletBalanceSubscription) {
            this.walletBalanceSubscription.unsubscribe();
        }
    }

    private startSubscriptions() {
        this.getWalletBalance();
    }
}
