import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DocumentCategory, MedicalDocument } from '../../../core/models';
import { DocumentService } from '../../../core/services/document.service';
import { NotificationToastService } from '../../../core/services/notification-toast.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="file-upload-card">
      <div
        class="drop-zone"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          [accept]="acceptedExtensions"
          (change)="onFileSelected($event)"
          style="display: none"
        />

        <div class="upload-prompt">
          <div class="cloud-icon-circle">
            <mat-icon>cloud_upload</mat-icon>
          </div>
          <h4>Click to upload or drag & drop files</h4>
          <p class="file-limits">
            Supported formats: PDF, JPG, JPEG, PNG (Max {{ maxFileSizeMb }}MB)
          </p>
        </div>
      </div>

      <!-- Uploading state & Progress -->
      <div class="uploading-progress" *ngIf="isUploading">
        <div class="progress-details">
          <span class="filename">{{ currentFileName }}</span>
          <span class="pct">{{ uploadProgress }}%</span>
        </div>
        <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
      </div>

      <!-- Upload Error state -->
      <div class="upload-error" *ngIf="errorMessage">
        <mat-icon>error</mat-icon>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-card {
      width: 100%;
      margin: 1rem 0;
    }

    .drop-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.2s ease;

      &:hover,
      &.drag-over {
        border-color: #0284c7;
        background: #f0f9ff;
      }
    }

    .cloud-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0284c7;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .file-limits {
      font-size: 0.825rem;
      color: #64748b;
      margin: 0;
    }

    .uploading-progress {
      margin-top: 1rem;
      padding: 1rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;

      .progress-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
      }
    }

    .upload-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      color: #dc2626;
      font-size: 0.85rem;
      font-weight: 500;
    }
  `]
})
export class FileUploadComponent {
  @Input() patientId = 1;
  @Input() category: DocumentCategory = 'LAB_REPORT';
  @Input() maxFileSizeMb = 10;
  @Output() fileUploaded = new EventEmitter<MedicalDocument>();

  private docService = inject(DocumentService);
  private toast = inject(NotificationToastService);

  acceptedExtensions = '.pdf,.jpg,.jpeg,.png';
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  currentFileName = '';
  errorMessage = '';

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage = '';

    // Validate type
    if (!this.allowedTypes.includes(file.type)) {
      this.errorMessage = 'Unsupported file type. Please upload PDF, JPG, JPEG, or PNG.';
      this.toast.error(this.errorMessage);
      return;
    }

    // Validate size
    const maxBytes = this.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      this.errorMessage = `File exceeds maximum allowable size of ${this.maxFileSizeMb}MB.`;
      this.toast.error(this.errorMessage);
      return;
    }

    this.isUploading = true;
    this.currentFileName = file.name;
    this.uploadProgress = 15;

    this.docService.uploadDocument(file, this.patientId, this.category).subscribe({
      next: (res) => {
        this.uploadProgress = res.progress;
        if (res.document) {
          this.isUploading = false;
          this.toast.success(`Uploaded "${file.name}" successfully.`);
          this.fileUploaded.emit(res.document);
        }
      },
      error: () => {
        this.isUploading = false;
        this.errorMessage = 'Failed to upload document. Please retry.';
        this.toast.error(this.errorMessage);
      }
    });
  }
}
