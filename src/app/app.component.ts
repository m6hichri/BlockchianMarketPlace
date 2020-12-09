import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {Web3Service} from './service/web3.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  accountNumber: any;
  imbName: any;
  imbPrice: any;
  show = true;
  totalImb = [];
  private marketPlace: any;
  balance: any;
  constructor(private web3: Web3Service, private cd: ChangeDetectorRef) {

    this.web3.checkAndInstantiateWeb3()
      .then((checkConn: any) => {
        if (checkConn === 'connected') {
          this.web3.loadBlockChainData()
            .then((accountData: any) => {
              this.accountNumber = accountData[0];
              this.web3.getEtherBalance(this.accountNumber)
                .then((data: any) => {
                  this.balance = Number(data).toFixed(2);
                  console.log(data);
                });
              this.web3.getContract()
                .then((contractRes: any) => {
                  if (contractRes) {
                    this.marketPlace = contractRes;
                    this.marketPlace.methods.immobiliereCount()
                      .call()
                      .then(value => {
                        for (let i = 1; i <= value; i++) {
                          const immobilier = this.marketPlace.methods.Immobiliere(i)
                            .call()
                            .then(immobiliers => {
                              console.log("test show getcontract");
                              this.show = false;
                              this.totalImb.push(immobiliers);
                              this.cd.detectChanges();
                            });
                        }
                        console.log('totalImb ', this.totalImb);
                      });
                  }
                });
            }, err => {
              console.log('account error', err);
            });
        }
      }, err => {
        alert(err);
      });
  }

  ngOnInit() {
  }


  private createImb(name, price) {
    this.show = true;
    const etherPrice = this.web3.convertPriceToEther(price);
    this.marketPlace.methods.createImb(name, etherPrice)
      .send({from: this.accountNumber})
      .once('receipt', (receipt) => {
        this.totalImb.push(receipt.events.ImbCreated.returnValues);
        console.log("test show createImb");
        this.show = false;
      });
  }


  private purchaseImb(id, price) {
    this.show = true;
    this.marketPlace.methods.purchaseImb(id)
      .send({from: this.accountNumber, value: price})
      .once('receipt', (receipt) => {
        console.log('receipt ', receipt);
        // this.totalImb.push(receipt.events.ImbCreated.returnValues);
        this.show = false;
      })
      .on('error', (error) => {
        console.log('receipt ', error);
        this.show = false;
      });

  }

  private convertEtherToPrice(price) {
    return this.web3.convertEtherToPrice(price);
  }


  trackByFn(index, item) {
    return item.purchased;
  }
}
