import { NgModule } from '@angular/core';
import { ViewAreaModule } from './view-area/view-area.module';
import { RouterLinkBack } from './directives/router-link-back.directive';
import { PasswordValidationDirective } from './directives/password-validation.directive';
import { CoinNotationPipe } from './pipes/coin-notation.pipe';

const SHARED_DIRECTIVES = [RouterLinkBack, PasswordValidationDirective, CoinNotationPipe];

@NgModule({
    declarations: [
        SHARED_DIRECTIVES
    ],
    imports: [
        ViewAreaModule
    ],
    exports: [
        ViewAreaModule,
        SHARED_DIRECTIVES
    ]
})
export class AppSharedModule {

}
