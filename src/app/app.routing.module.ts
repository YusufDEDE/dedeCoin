import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { BlockchainViewerComponent } from './pages/blockchain-viewer/blockchain-viewer.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { CreateTransactionComponent } from './pages/create-transaction/create-transaction.component';


const routes: Routes = [
  { path: '', component: BlockchainViewerComponent},
  { path: 'settings', component: SettingsComponent },
  { path: 'new/transaction', component: CreateTransactionComponent }
]


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
