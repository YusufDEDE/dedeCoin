import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/services/blockchain.service';
import { Transaction } from 'savjeecoin';

@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transaction.component.html',
  styleUrls: ['./create-transaction.component.scss']
})
export class CreateTransactionComponent implements OnInit {

  public newTx;
  public walletKey;

  constructor(private blockchainService : BlockchainService ) {
    this.walletKey = blockchainService.walletkeys[0];
   }

  ngOnInit() {
    this.newTx = new Transaction();
  }

  createTransaction() {
    this.newTx.fromAddress = this.walletKey.publicKey;
    this.newTx.singTransaction(this.walletKey.keyObj);

    this.blockchainService.addTransactions(this.newTx);

    this.newTx = new Transaction();
  }

}
