import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material';
import { BookRoomModel } from './book-room-form.model';
import { BookRoomFormService } from './book-room-form.service';
import { notificationMessages } from '../../notificationMessages';
import { CustomerService } from '../customer/customer.service';
import { Router } from '@angular/router';
import { DataService } from "../data.service";

@Component({
  selector: 'app-book-room-form',
  templateUrl: './book-room-form.component.html',
  styleUrls: ['./book-room-form.component.scss']
})
export class BookRoomFormComponent implements OnInit {
  public bookroommodel: BookRoomModel;
  loading = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  formView: boolean = false;
  bookedCustomerList = true;
  bookForm: {};
  customerList: {};
  viewCustomer = false;
  @Input() activeTab: string;
  @ViewChild('stepper') stepper: MatStepper;
  isEditable = true;
  remainingAmount: number = 0;
  @Input() roomObject: Object;
  roomNumber: String;
  GST: number;
  totalRoomAmount: number;
  totalFoodBill: number;
  updatedTotal: number;
  totalGSTAmount: number;
  roomType: String;
  message: String;
  item: {};
  @Output() formEvent = new EventEmitter<boolean>();

  constructor(private data: DataService, private router: Router, private formBuilder: FormBuilder, private customerService: CustomerService, private bookroomformService: BookRoomFormService, public constants: notificationMessages, private _snackBar: MatSnackBar) {
    this.bookroommodel = new BookRoomModel();
  }

  ngOnInit() {
    this.firstFormGroup = this.formBuilder.group({
      customerId: [''],
      name: [''],
      idtype: [''],
      idnumber: [''],
      phonenumber: [''],
      address: [''],
      roomamount: [''],
      extraoccupancy: [''],
      foodbillnumber: [''],
      foodbillamount: ['']
    });
    this.thirdFormGroup = this.formBuilder.group({
      billamount: ['', Validators.required],
      paymenttype: ['', Validators.required],
      paidamount: ['', Validators.required],
      totalamount: ['', Validators.required],
      paymentstatus: ['', Validators.required]
    });
    this.viewCustomerDetails();
    if (this.roomObject) {
      this.roomNumber = this.roomObject['roomId'].room_number;
      this.roomType = this.roomObject['roomId'].room_name;
    } else {
      this.data.currentItem
        .subscribe(
          item => (
            this.item = item,
            this.firstFormGroup.controls.customerId.setValue(item['customer_id']),
            this.firstFormGroup.controls.roomamount.setValue(item['room_charges']),
            this.firstFormGroup.controls.extraoccupancy.setValue(item['extra_occupancy']),
            this.firstFormGroup.controls.foodbillnumber.setValue(item['food_bill_number']),
            this.firstFormGroup.controls.foodbillamount.setValue(item['food_bill_amount']),
            this.thirdFormGroup.controls.paidamount.setValue(item['paid_amount']),
            this.thirdFormGroup.controls.paymenttype.setValue(item['payment_mode']),
            this.thirdFormGroup.controls.totalamount.setValue(item['grandTotal']),
            this.thirdFormGroup.controls.paymentstatus.setValue(item['payment_status']),
            this.remainingAmount = parseInt(item['grandTotal']) - parseInt(item['paid_amount']),
            this.GST = item['GST'],
            this.totalFoodBill = item['food_bill_amount'],
            this.totalRoomAmount = item['totalRoomCharges'],
            this.totalGSTAmount = item['totalGSTAmount']
          ),
        );
    }
  }


  editBooking() {
    this.data.setBookingFormValue(false);
    this.bookroomformService.updateBookingInfo(this.firstFormGroup.value, this.thirdFormGroup.value, this.item['booking_id'])
      .subscribe(
        data => {
          if (data) {
            console.log(data);
          }
        },
        error => {
          console.log(error);
        });
  }

  viewCustomerDetails() {
    this.loading = true;
    this.customerService.viewCustomerDetails()
      .subscribe(
        data => {
          if (data) {
            this.loading = false;
            this.customerList = data['customerList'];
            this.GST = data['GST'];
          } else {
            this.loading = false;
            this.customerList = null;
          }
        },
        error => {
          console.log(error);
          this.loading = false;
        });
  }

  onSubmit() {
    this.loading = true;
    if (this.firstFormGroup.controls.customerId.value) {
      this.bookForm = {
        "bookingInfo": this.firstFormGroup.value,
        "paymentInfo": this.thirdFormGroup.value
      };
      let customerObj = this.bookForm['bookingInfo'];
      customerObj['room_id'] = this.roomObject['roomId'].room_id;
      customerObj['checkin_date'] = this.roomObject['checkin'];
      customerObj['checkout_date'] = this.roomObject['checkout'];
      delete customerObj.name;
      delete customerObj.address;
      delete customerObj.idnumber;
      delete customerObj.phonenumber;
      delete customerObj.idtype;
    } else {
      this.bookForm = {
        "bookingInfo": this.firstFormGroup.value,
        "paymentInfo": this.thirdFormGroup.value
      };
      let customerObj = this.bookForm['bookingInfo'];
      customerObj['room_id'] = this.roomObject['roomId'].room_id;
      customerObj['checkin_date'] = this.roomObject['checkin'];
      customerObj['checkout_date'] = this.roomObject['checkout'];
      delete customerObj.customerId;
    }
    this.bookroomformService.bookRoom(this.bookForm)
      .subscribe(
        data => {
          console.log(data);
          this.loading = false;
          this._snackBar.open(this.constants.roomBooked, '', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.router.navigate(['dashboard/booked-customer-list']);
        },
        error => {
          console.log(error);
          this.loading = false;
        });
  }

  move(index: number) {
    this.stepper.selectedIndex = index;
  }

  callRoomTable() {
    this.formEvent.emit(this.formView);
    localStorage.setItem('showRoomList', 'true');
  }

  viewCustomerForm() {
    if (!this.viewCustomer) {
      this.firstFormGroup.controls.customerId.setValue(undefined);
    }
    this.viewCustomer = !this.viewCustomer;
  }

  calculateEditFormValues() {
    this.firstFormGroup.controls.foodbillamount.setValue(parseInt(this.firstFormGroup.controls.foodbillamount.value) ? parseInt(this.firstFormGroup.controls.foodbillamount.value) : 0);
    this.thirdFormGroup.controls.paidamount.setValue(parseInt(this.thirdFormGroup.controls.paidamount.value) ? parseInt(this.thirdFormGroup.controls.paidamount.value) : 0);
    this.totalRoomAmount = parseInt(this.firstFormGroup.controls.roomamount.value) + parseInt(this.firstFormGroup.controls.extraoccupancy.value);
    if (this.totalRoomAmount > 999) {
      this.totalGSTAmount = this.totalRoomAmount * this.GST / 100;
      this.totalRoomAmount = this.totalRoomAmount + this.totalGSTAmount;
    }
    this.totalFoodBill = parseInt(this.firstFormGroup.controls.foodbillamount.value);
    this.thirdFormGroup.controls.totalamount.setValue(this.totalRoomAmount + parseInt(this.firstFormGroup.controls.foodbillamount.value));
    this.remainingAmount = (this.totalRoomAmount + parseInt(this.firstFormGroup.controls.foodbillamount.value)) - parseInt(this.thirdFormGroup.controls.paidamount.value);
  }

  calculateTotal() {
    if (this.firstFormGroup.controls.foodbillamount.value) {
      this.thirdFormGroup.controls.totalamount.setValue(parseInt(this.firstFormGroup.controls.roomamount.value) + parseInt(this.firstFormGroup.controls.extraoccupancy.value) + parseInt(this.firstFormGroup.controls.foodbillamount.value));
    } else {
      this.thirdFormGroup.controls.totalamount.setValue(parseInt(this.firstFormGroup.controls.roomamount.value) + parseInt(this.firstFormGroup.controls.extraoccupancy.value));
    }
  }

}
