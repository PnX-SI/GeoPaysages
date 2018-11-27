import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-photo',
  templateUrl: './add-photo.component.html',
  styleUrls: ['./add-photo.component.scss']
})

export class AddPhotoComponent implements OnInit {
  selectedFiles: any;
  photoForm: FormGroup;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.photoForm = this.formBuilder.group({
      notice: [null],
    });
  }

  openPhotoModal(content) {
    this.modalService.open(content, { windowClass: 'custom-modal', centered: true });
  }

  onFileSelected(event) {
    console.log('event', event);
    this.selectedFiles = event.target.files;
  }
}
