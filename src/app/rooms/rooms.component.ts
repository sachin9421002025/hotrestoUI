import { Component, OnInit } from '@angular/core';
import { roomsModel } from './rooms.model';
import { RoomService } from './room.service';
import { notificationMessages } from '../../notificationMessages';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-addroom',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  providers: [RoomService, notificationMessages]
})
export class AddroomComponent implements OnInit {

  loading = false;
  errorText: string;
  errorDisplay: true;
  roomList: {};
  public model: roomsModel;

  constructor(private router: Router, private _snackBar: MatSnackBar, private roomService: RoomService, public constants: notificationMessages) {
    this.model = new roomsModel();
  }

  ngOnInit() {
    this.viewRooms();
  }

  viewRooms() {
    this.loading = true;
    this.roomService.viewRoom()
      .subscribe(
        data => {
          if (data) {
            this.loading = false;
            this.roomList = data;
          } else {
            this.loading = false;
          }
        },
        error => {
          console.log(error);
          this.loading = false;
        });
  }

  addRoom() {
    this.loading = true;
    this.roomService.addRoom(this.model.roomname, this.model.roomnumber, this.model.noofbeds, this.model.image)
      .subscribe(
        data => {
          if (data) {
            this.loading = false;
            this._snackBar.open(this.constants.addRoom, '', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            this.viewRooms();
          }
        },
        error => {
          console.log(error);
          this.loading = false;
        });
  }

  deleteRoom(item) {
    this.roomService.deleteRoom(item)
      .subscribe(data => {
        confirm("Do you want to delete the record?");
        this.viewRooms();
      })
  };
}
