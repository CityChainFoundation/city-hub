import { Component, Input, HostBinding, ChangeDetectionStrategy, ViewEncapsulation, HostListener } from '@angular/core';

@Component({
    selector: 'app-view-area',
    templateUrl: './view-area.component.html',
    styleUrls: ['./view-area.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAreaComponent {

    @HostBinding('class.app-view-area') hostClass = 'app-view-area';
    @HostBinding('class.app-view-area-hover') hoverClass = false;

    @HostListener('mouseenter')
    onMouseOver() {
        this.hoverClass = true;
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        this.hoverClass = false;
    }

}
