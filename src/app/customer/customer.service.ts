import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operator/map';
import { environment } from '../../environments/environment';
import 'rxjs/Rx';

@Injectable()
export class CustomerService {
    constructor(private http: HttpClient) { }

    addCust(customername: string, custid: string, idnumber: string, phonenumber: number, address: string) {
        return this.http.post('environment.BACKEND.URL.customerinfo', { customername: customername, custid: custid, idnumber: idnumber, phonenumber: phonenumber, address: address })
            .map(res => {
                return res;
            });
    }
}