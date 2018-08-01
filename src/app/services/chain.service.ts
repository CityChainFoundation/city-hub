import { Injectable } from '@angular/core';

export interface Chain {
    name: string;
    identity: string;
    tooltip: string;
    port?: number;
    rpcPort?: number;
    apiPort?: number;
    wsPort?: number;
    network: string;
    mode?: string;
}

@Injectable()
export class ChainService {

    private availableChains: Array<Chain>;

    constructor() {
        this.availableChains = [
            { name: 'City Chain', identity: 'city', tooltip: 'City Hub', port: 4333, rpcPort: 4334, apiPort: 4335, wsPort: 4336, network: 'main' },
            { name: 'City Chain', identity: 'city', tooltip: 'City Hub', port: 14333, rpcPort: 14334, apiPort: 14335, wsPort: 14336, network: 'regtest' },
            { name: 'City Chain', identity: 'city', tooltip: 'City Hub', port: 24333, rpcPort: 24334, apiPort: 24335, wsPort: 24336, network: 'testnet' },

            { name: 'Stratis', identity: 'stratis', tooltip: 'Stratis Core', apiPort: 38221, network: 'main' },
            { name: 'Stratis', identity: 'stratis', tooltip: 'Stratis Core', apiPort: 37221, network: 'regtest' },
            { name: 'Stratis', identity: 'stratis', tooltip: 'Stratis Core', apiPort: 37221, network: 'testnet' },

            { name: 'Bitcoin', identity: 'bitcoin', tooltip: 'Stratis: Bitcoin', network: 'main' }
        ];
    }

    /** Retrieves a configuration for a blockchain, including the right network name and ports. */
    getChain(name: string = 'city', network: string = 'main'): Chain {
        // Couldn't use .find with the current tsconfig setup.
        const selectedChains = this.availableChains.filter(c => c.identity === name && c.network === network);
        let selectedChain: Chain;

        if (selectedChains.length === 0) {
            console.error('The supplied coin parameter is invalid. First available chain selected as default. Argument value: ' + name);
            selectedChain = this.availableChains[0];
        } else {
            selectedChain = selectedChains[0];
        }

        return selectedChain;
    }
}