import {Component, OnInit} from '@angular/core';
import {faLink} from '@fortawesome/free-solid-svg-icons';
import {AuthService} from "@auth0/auth0-angular";
import {CrvResponse, MyElectionApiService} from "../../services/my-election-api.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css']
})
export class HomeContentComponent implements OnInit {
  faLink = faLink;

  constructor(public auth: AuthService,
              private myElectionApiService: MyElectionApiService,
              private fb: FormBuilder,
              private notificationService: NotificationService) {
  }


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
    this.myElectionApiService.voteRegistration(this.token, {
      dob: voteRegistrationForm.controls["dob"].value.format('YYYY-MM-DD'),
      ci: voteRegistrationForm.controls["ci"].value,
      fullName: voteRegistrationForm.controls["name"].value
    }).subscribe(response => {
          this.notificationService.show("votante registrado con exito !")
          this.navigate(0);
          voteRegistrationForm.reset()
        }
    );
  }

  cancel() {
    this.navigate(0);
    this.voteRegistrationForm.reset();
  }
}
