import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {faLink} from '@fortawesome/free-solid-svg-icons';
import {AuthService} from "@auth0/auth0-angular";
import {CrvResponse, MyElectionApiService, Vote} from "../../services/my-election-api.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "../../services/notification.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

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
                private notificationService: NotificationService) {
    }

    myCrv: CrvResponse;
    token: string;
    selected = new FormControl(0);
    voteRegistrationForm: FormGroup = new FormGroup({});
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

    ngOnInit() {

        this.loading = true;

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

    ngAfterViewInit() {

    }

    findMyCrv() {
        this.loading = true;
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
        this.goHome()
        this.voteRegistrationForm.reset();
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

}


export interface PageInfo {
    pageIndex: number;
    pageSize: number;
    orderColumn?: string;
    orderDirection?: 'asc' | 'desc' | '';
    total: number;
}
