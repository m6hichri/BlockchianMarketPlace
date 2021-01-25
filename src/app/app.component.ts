import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { Web3Service } from './service/web3.service';
import { ImageService } from './service/image.service';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  /********************* */

  galleryForm: FormGroup;
  imageFile: File = null;
  imageTitle = '';
  imageDesc = '';
  isLoadingResults = false;
  matcher = new MyErrorStateMatcher();
  /********************* */

  accountNumber: any;
  imbName: any;
  imbPrice: any;
  area: any = '40';
  localisation: any = 'Nantes';
  description: any = 'hblkjblkb';
  image: any = '';
  show = true;
  totalImb = [];
  private marketPlace: any;
  balance: any;
  gridColumns = 3;



  constructor(private web3: Web3Service, private cd: ChangeDetectorRef,
    private api: ImageService,
    private formBuilder: FormBuilder,
    private router: Router) {


    this.web3.checkAndInstantiateWeb3()
      .then((checkConn: any) => {
        if (checkConn === 'connected') {
          this.web3.loadBlockChainData()
            .then((accountData: any) => {
              this.accountNumber = accountData[0];
              this.web3.getEtherBalance(this.accountNumber)
                .then((data: any) => {
               //nombre arrondie
                  this.balance = Number(data).toFixed(2);
          
                });
              this.web3.getContract()
                .then((contractRes: any) => {
                  if (contractRes) {
                    this.marketPlace = contractRes;
                    this.marketPlace.methods.immobilierCount()
                      .call()
                      .then(value => {
                        for (let i = 1; i <= value; i++) {
                          this.marketPlace.methods.immobiliers(i)
                            .call()
                            .then(immob => {
                              this.show = false;
                              this.totalImb.push(immob);
                              this.cd.detectChanges();
                            });
                        }
                        console.log('totalImb _____________________', this.totalImb);
                        //this.toggleGridColumns();
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


  toggleGridColumns() {
    this.api.getGalleryById("maisonnnb.png")
    .subscribe((data: any) => {
      console.log("+++++++++++++++++++++++++", data);
      this.isLoadingResults = false;
    });
    //this.gridColumns = this.gridColumns === 3 ? 4 : 3;
   
  }


  ngOnInit() {
    this.galleryForm = this.formBuilder.group({
      imageFile: [null, Validators.required],
      imbName: [null, Validators.required],
      imbPrice: [null, Validators.required],
      area: [null, Validators.required],
      localisation: [null, Validators.required],
      description: [null, Validators.required]
    });
  }


  onFormSubmit(): void {
    this.isLoadingResults = true;

    this.imbName = this.galleryForm.get('imbName').value;
    this.area = this.galleryForm.get('area').value;
    this.imbPrice = this.galleryForm.get('imbPrice').value;
    this.localisation = this.galleryForm.get('localisation').value;
    this.description = this.galleryForm.get('description').value;
    this.image = this.galleryForm.get('imageFile').value._files[0].name;
/* 
    console.log('name ', this.imbName);
    console.log('area ', this.area);
    console.log('localisation ', this.localisation);
    console.log('description ', this.description);
    console.log('image ', this.image);
 */
    this.show = true;
    const etherPrice = this.web3.convertPriceToEther(this.imbPrice);
    //console.log('etherPrice ', etherPrice);

    this.marketPlace.methods.createImb(this.imbName, etherPrice, this.area, this.localisation, this.description, this.image)
      .send({ from: this.accountNumber })
      .once('receipt', (receipt) => {
        this.totalImb.push(receipt.events.ImbCreated.returnValues);

        this.show = false;
      });
    this.api.addGallery(this.galleryForm.get('imageFile').value._files[0])
      .subscribe((res: any) => {
        this.isLoadingResults = false;
      }, (err: any) => {
        console.log(err);
        this.isLoadingResults = false;
      });
  }



  /*   private createImb(name, price, area, localisation, description,image) {
   
      console.log('name ', name);
      console.log('area ', area);
      console.log('localisation ', localisation);
      console.log('description ', description);
      console.log('image ', image);
      this.show = true;
      const etherPrice = this.web3.convertPriceToEther(price);
      this.marketPlace.methods.createImb(name, etherPrice, area, localisation, description,image)
        .send({ from: this.accountNumber })
        .once('receipt', (receipt) => {
          this.totalImb.push(receipt.events.ImbCreated.returnValues);
  
          this.show = false;
        });
    } */


  private purchaseImb(id, price) {
    this.show = true;
    this.marketPlace.methods.purchaseImb(id)
      .send({ from: this.accountNumber, value: price })
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
