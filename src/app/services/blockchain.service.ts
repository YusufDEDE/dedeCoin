import { Injectable } from '@angular/core';
import { Blockchain } from 'savjeecoin';
import EC from 'elliptic';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
1
  public blockchainInstance = new Blockchain();
  public walletkeys = [];

  constructor() {
    this.blockchainInstance.difficulty = 1;
    this.blockchainInstance.minePendingTransactions('my-wallet-address')

    this.generateWalletKeys();
  }

  getBlocks(){
    return this.blockchainInstance.chain;
  }

  private generateWalletKeys() {
    const ec = new EC.ec('secp256k1');
    const key = ec.genKeyPair();

    this.walletkeys.push({
      keyObj: key,
      publicKey: key.getPublic('hex'),
      privateKey: key.getPrivate('hex'),
    });
  }
}
