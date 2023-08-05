import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {faLink} from '@fortawesome/free-solid-svg-icons';
import {AuthService} from "@auth0/auth0-angular";
import {CrvResponse, MyElectionApiService, Vote} from "../../services/my-election-api.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "../../services/notification.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {DateAdapter} from "@angular/material/core";

@Component({
    selector: 'app-home-content',
    templateUrl: './home-content.component.html',
    styleUrls: ['./home-content.component.css']
})
export class HomeContentComponent implements OnInit, AfterViewInit {
    faLink = faLink;

    constructor(public auth: AuthService,
                private myElectionApiService: MyElectionApiService,
                private fb: FormBuilder,
                private notificationService: NotificationService,
                private dateAdapter: DateAdapter<Date>) {
        this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
    }

    myCrv: CrvResponse;
    token: string;
    selected = new FormControl(0);
    voteRegistrationForm: FormGroup = new FormGroup({});
    noteForm: FormGroup = new FormGroup({});
    closeForm: FormGroup = new FormGroup({});
    loading: boolean;

    // table tab view
    displayedColumns: string[] = ['voteNumber', 'fullName', 'dob', 'ci'/*, 'timestamp'*/];
    dataSource: MatTableDataSource<Vote>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    pageInfo: PageInfo = {
        pageIndex: 0,
        pageSize: 25,
        total: 0
    }
    days: viewValue[] = [
        {value: '01', viewValue: '1'},
        {value: '02', viewValue: '2'},
        {value: '03', viewValue: '3'},
        {value: '04', viewValue: '4'},
        {value: '05', viewValue: '5'},
        {value: '06', viewValue: '6'},
        {value: '07', viewValue: '7'},
        {value: '08', viewValue: '8'},
        {value: '09', viewValue: '9'},
        {value: '10', viewValue: '10'},
        {value: '11', viewValue: '11'},
        {value: '12', viewValue: '12'},
        {value: '13', viewValue: '13'},
        {value: '14', viewValue: '14'},
        {value: '15', viewValue: '15'},
        {value: '16', viewValue: '16'},
        {value: '17', viewValue: '17'},
        {value: '18', viewValue: '18'},
        {value: '19', viewValue: '19'},
        {value: '20', viewValue: '20'},
        {value: '21', viewValue: '21'},
        {value: '22', viewValue: '22'},
        {value: '23', viewValue: '23'},
        {value: '24', viewValue: '24'},
        {value: '25', viewValue: '25'},
        {value: '26', viewValue: '26'},
        {value: '27', viewValue: '27'},
        {value: '28', viewValue: '28'},
        {value: '29', viewValue: '29'},
        {value: '30', viewValue: '30'},
        {value: '31', viewValue: '31'}
    ];

    months: viewValue[] = [
        {value: '01', viewValue: '1'},
        {value: '02', viewValue: '2'},
        {value: '03', viewValue: '3'},
        {value: '04', viewValue: '4'},
        {value: '05', viewValue: '5'},
        {value: '06', viewValue: '6'},
        {value: '07', viewValue: '7'},
        {value: '08', viewValue: '8'},
        {value: '09', viewValue: '9'},
        {value: '10', viewValue: '10'},
        {value: '11', viewValue: '11'},
        {value: '12', viewValue: '12'}
    ];

    years: viewValue[] = [
        {value: '1970', viewValue: '1970'},
        {value: '1971', viewValue: '1971'},
        {value: '1972', viewValue: '1972'},
        {value: '1973', viewValue: '1973'},
        {value: '1974', viewValue: '1974'},
        {value: '1975', viewValue: '1975'},
        {value: '1976', viewValue: '1976'},
        {value: '1977', viewValue: '1977'},
        {value: '1978', viewValue: '1978'},
        {value: '1979', viewValue: '1979'},

        {value: '1980', viewValue: '1980'},
        {value: '1981', viewValue: '1981'},
        {value: '1982', viewValue: '1982'},
        {value: '1983', viewValue: '1983'},
        {value: '1984', viewValue: '1984'},
        {value: '1985', viewValue: '1985'},
        {value: '1986', viewValue: '1986'},
        {value: '1987', viewValue: '1987'},
        {value: '1988', viewValue: '1988'},
        {value: '1989', viewValue: '1989'},

        {value: '1990', viewValue: '1990'},
        {value: '1991', viewValue: '1991'},
        {value: '1992', viewValue: '1992'},
        {value: '1993', viewValue: '1993'},
        {value: '1994', viewValue: '1994'},
        {value: '1995', viewValue: '1995'},
        {value: '1996', viewValue: '1996'},
        {value: '1997', viewValue: '1997'},
        {value: '1998', viewValue: '1998'},
        {value: '1999', viewValue: '1999'},

        {value: '2000', viewValue: '2000'},
        {value: '2001', viewValue: '2001'},
        {value: '2002', viewValue: '2002'},
        {value: '2003', viewValue: '2003'},
        {value: '2004', viewValue: '2004'},
        {value: '2005', viewValue: '2005'},
        {value: '2006', viewValue: '2006'},
        {value: '2007', viewValue: '2007'},
        {value: '2008', viewValue: '2008'},
        {value: '2009', viewValue: '2009'},

    ];
    selectedDboDay = "06";
    selectedDboMonth = "08";
    selectedDboYear = "2009";
    isDboValid = false;

    ngOnInit() {

        this.loading = true;

        this.voteRegistrationForm = this.fb.group({
            name: [null, [Validators.required]],
            ci: [null, [Validators.required]]
        })

        this.noteForm = this.fb.group({
            note: [null, [Validators.required]]
        })

        this.closeForm = this.fb.group({
            note: [null, [Validators.required]]
        })

        this.auth.getIdTokenClaims().subscribe(x => {
            this.token = x.__raw;
            this.findMyCrv();
        })
    }

    ngAfterViewInit() {
    }

    home() {
        this.navigate(0);
        this.loading = true;
    }

    findMyCrv() {
        this.myElectionApiService.findMyCrv(this.token).subscribe(crv => {
            console.log("CRV: " + JSON.stringify(crv))
            this.loading = false;
            this.myCrv = crv;
        })
    }

    openCrv() {
        this.myElectionApiService.openCrv(this.token).subscribe(x => {
            this.findMyCrv();
        })

    }

    navigate(number: number) {
        this.selected.setValue(number);
    }


    submitVoter() {

        this.myElectionApiService.voteRegistration(this.token, {
            dob: this.selectedDboYear + "-" + this.selectedDboMonth + "-" + this.selectedDboDay,
            ci: this.voteRegistrationForm.controls["ci"].value,
            fullName: this.voteRegistrationForm.controls["name"].value
        }).subscribe(response => {
                this.notificationService.show("votante registrado con exito !")
                this.voteRegistrationForm.reset()
                this.selectedDboDay = "05";
                this.selectedDboMonth = "11";
                this.selectedDboYear = "1991";
                this.navigate(0);
            }
        );
    }

    cancel() {
        this.goHome()
        this.voteRegistrationForm.reset();
        this.noteForm.reset();
        this.closeForm.reset();
    }

    goHome() {
        this.navigate(0);
    }

    findVotes() {
        this.myElectionApiService.findRegisteredVotes(this.token, this.pageInfo.pageIndex, this.pageInfo.pageSize).subscribe(response => {
            this.dataSource = new MatTableDataSource(response.votes);
            this.pageInfo.total = response.total;
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.setPaginatorActions();
            this.setSortActions();
            this.navigate(2);
        });
    }

    setPaginatorActions() {
        this.paginator.page.subscribe((evt: PageEvent) => {
            this.pageInfo.pageIndex = evt.pageIndex
            this.pageInfo.pageSize = evt.pageSize
            this.refreshVoteList()
        });
    }

    setSortActions() {
        this.sort.sortChange.subscribe(() => {
            // Paginator update
            this.paginator.pageIndex = 0;
            this.pageInfo.pageIndex = 0;

            // Sort update
            this.pageInfo.orderColumn = this.sort.direction && this.sort.active;
            this.pageInfo.orderDirection = this.sort.direction;
        });
    }

    private refreshVoteList() {
        this.myElectionApiService.findRegisteredVotes(this.token, this.pageInfo.pageIndex, this.pageInfo.pageSize).subscribe(response => {
            this.dataSource = new MatTableDataSource(response.votes);
            this.pageInfo.total = response.total;
        })
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    submitNote(noteForm: FormGroup) {
        if (noteForm.controls["note"] == null || noteForm.controls["note"].value == null || noteForm.controls["note"].value == undefined) {
            console.warn("why are u calling me !?")
        } else {
            this.myElectionApiService.addNote(this.token, {
                note: noteForm.controls["note"].value
            }).subscribe(response => {
                    this.notificationService.show("Nota agregada con exito !")
                    this.navigate(0);
                    noteForm.reset()
                }
            );
        }
    }

    submitCrvClose() {
        this.myElectionApiService.closeCrv(this.token, {
            note: this.closeForm.controls["note"].value
        }).subscribe(response => {
                this.notificationService.show("CRV cerrada con exito !")
                this.home()
                this.closeForm.reset()
            }
        );
    }

    tabClick(tabEvent: MatTabChangeEvent) {
        console.info("tab selected: " + tabEvent.index)
        if (tabEvent.index == 4) { // means cierre
            // TODO create an better endpoint for getting the totals
            this.myElectionApiService.findRegisteredVotes(this.token, 0, 1).subscribe(response => {
                this.dataSource = new MatTableDataSource(response.votes);
                this.pageInfo.total = response.total;
            })
        } else if (tabEvent.index == 0) {
            this.loading = true;
            this.findMyCrv();
        }
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;

    }

    minDate = new Date(1991, 11, 6);
    maxDate = new Date(2008, 11, 5);


    dobValid() {
        let selectedDate = new Date(Number(this.selectedDboYear), Number(this.selectedDboMonth), Number(this.selectedDboDay));
        this.isDboValid = selectedDate >= this.minDate && selectedDate <= this.maxDate;
        console.log("SELECTED DAY" + selectedDate.toISOString() + "is valid ? " + this.isDboValid)
    }
}

export interface viewValue {
    value: string;
    viewValue: string;
}


export interface PageInfo {
    pageIndex: number;
    pageSize: number;
    orderColumn?: string;
    orderDirection?: 'asc' | 'desc' | '';
    total: number;
}
