import { Component, OnInit } from '@angular/core';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import {AuthService} from "@auth0/auth0-angular";
import {CrvResponse, MyElectionApiService} from "../../services/my-election-api.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css']
})
export class HomeContentComponent implements OnInit {
  faLink = faLink;

  constructor( public auth: AuthService,
               private myElectionApiService: MyElectionApiService,
               private fb: FormBuilder) { }

  myCrv: CrvResponse;
  token: string;
  selected = new FormControl(0);
  voteRegistrationForm: FormGroup = new FormGroup({});


  ngOnInit() {

    this.voteRegistrationForm = this.fb.group({
      name: [null, [Validators.required]],
      ci: [null, [Validators.required]],
      dob: [null, [Validators.required]]
    })


    this.auth.getIdTokenClaims().subscribe(x => {
      this.token = x.__raw;
      this.findMyCrv();
    })

  }

  findMyCrv() {
    this.myElectionApiService.findMyCrv(this.token).subscribe(crv => {
      console.log("CRV: "+ JSON.stringify(crv))
      this.myCrv = crv;
    })
  }

  openCrv() {
    this.myElectionApiService.openCrv(this.token).subscribe(x => {
      this.findMyCrv();
    })

  }

  closeCrv() {
    this.myElectionApiService.closeCrv(this.token).subscribe(x => {
      this.findMyCrv();
    })
  }

  navigate(number: number) {
    this.selected.setValue(number);
  }

  submit(voteRegistrationForm: FormGroup) {

    this.myElectionApiService.voteRegistration(this.token,  {
      dob: voteRegistrationForm.controls["dob"].value,
      ci: voteRegistrationForm.controls["ci"].value,
      fullName: voteRegistrationForm.controls["name"].value
    }).subscribe(x => {
        this.navigate(0);
    });
  }
}
