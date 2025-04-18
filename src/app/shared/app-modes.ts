import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AppModes {

    constructor() {
        const activeId = localStorage.getItem('Settings:Mode') || 'basic';
        this.active = this.available.find(m => m.id === activeId);
    }

    available: AppMode[] = [{
        id: 'basic',
        name: 'Basic',
        features: ['dashboard', 'wallet', 'settings', 'logout']
    }, {
        id: 'advanced',
        name: 'Advanced',
        features: ['dashboard', 'wallet', 'history', 'settings', 'logout', 'staking']
    }];

    active: AppMode;

    enabled(module: string): boolean {
        return (this.active.features.indexOf(module) > -1);
    }

    activate(modeId: string) {
        this.active = this.available.find(m => m.id === modeId);
    }
}

export interface AppMode {
    id: string;
    name: string;
    features: string[];
}
