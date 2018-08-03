import { Injectable, Inject, InjectionToken, Optional } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {

    static singletonInstance: UpdateService;
    private ipc: Electron.IpcRenderer;

    constructor(private electronService: ElectronService) {

        this.ipc = electronService.ipcRenderer;

        if (!UpdateService.singletonInstance) {

            this.ipc.on('check-for-update', (info) => {
                console.log('check-for-update: ', info);
            });

            this.ipc.on('update-available', (info) => {
                console.log('update-available: ', info);
            });

            this.ipc.on('update-not-available', (info) => {
                console.log('update-not-available: ', info);
            });

            this.ipc.on('update-downloaded', (info) => {
                console.log('update-downloaded: ', info);
            });

            this.ipc.on('download-progress', (progress) => {
                console.log('download-progress: ', progress);
            });

            this.ipc.on('update-error', (error) => {
                console.log('update-error: ', error);
            });

            UpdateService.singletonInstance = this;
        }

        return UpdateService.singletonInstance;
    }

    checkForUpdate() {
        if (this.ipc) {
            const result = this.electronService.ipcRenderer.send('check-for-update');
        }
    }

    downloadUpdate() {
        if (this.ipc) {
            const result = this.electronService.ipcRenderer.send('download-update');
        }
    }

    installUpdate() {
        if (this.ipc) {
            const result = this.electronService.ipcRenderer.send('install-update');
        }
    }
}