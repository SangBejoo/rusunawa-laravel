@extends('layouts.app')

@section('title', 'Documents')

@section('content')
<div class="container">
    <h1 class="mb-4">
        <i class="fas fa-file-alt me-2"></i> My Documents
    </h1>
    
    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-folder me-2"></i> Uploaded Documents
                    </h5>
                    <button type="button" class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#uploadDocumentModal">
                        <i class="fas fa-upload me-1"></i> Upload Document
                    </button>
                </div>
                <div class="card-body">
                    @if(count($documents) > 0)
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Filename</th>
                                        <th>Uploaded</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($documents as $document)
                                        <tr>
                                            <td>{{ $document['document_type']['name'] }}</td>
                                            <td>{{ $document['file_name'] }}</td>
                                            <td>{{ date('d M Y', strtotime($document['created_at'])) }}</td>
                                            <td>
                                                @if($document['status'] == 'pending')
                                                    <span class="badge bg-warning">Pending</span>
                                                @elseif($document['status'] == 'approved')
                                                    <span class="badge bg-success">Approved</span>
                                                @elseif($document['status'] == 'rejected')
                                                    <span class="badge bg-danger">Rejected</span>
                                                @else
                                                    <span class="badge bg-secondary">{{ ucfirst($document['status']) }}</span>
                                                @endif
                                            </td>
                                            <td>
                                                <div class="btn-group btn-group-sm">
                                                    <a href="{{ route('tenant.document.show', $document['doc_id']) }}" 
                                                       class="btn btn-info">
                                                        <i class="fas fa-eye"></i>
                                                    </a>
                                                    @if($document['status'] == 'rejected' || $document['status'] == 'pending')
                                                        <button type="button" class="btn btn-warning update-document-btn" 
                                                                data-id="{{ $document['doc_id'] }}" 
                                                                data-name="{{ $document['file_name'] }}"
                                                                data-description="{{ $document['notes'] ?? '' }}">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                    @endif
                                                    @if($document['status'] != 'approved')
                                                        <button type="button" class="btn btn-danger delete-document-btn"
                                                                data-id="{{ $document['doc_id'] }}"
                                                                data-name="{{ $document['file_name'] }}">
                                                            <i class="fas fa-trash-alt"></i>
                                                        </button>
                                                    @endif
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="text-center py-4">
                            <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                            <p class="mb-0">You haven't uploaded any documents yet.</p>
                            <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#uploadDocumentModal">
                                <i class="fas fa-upload me-1"></i> Upload Your First Document
                            </button>
                        </div>
                    @endif
                </div>
            </div>
        </div>
        
        <div class="col-lg-4">
            <div class="card shadow mb-4">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i> Document Information
                    </h5>
                </div>
                <div class="card-body">
                    <p>Please ensure all documents are:</p>
                    <ul>
                        <li>Clear and legible</li>
                        <li>Valid and not expired</li>
                        <li>Complete (no cropped information)</li>
                        <li>In JPG, PNG, or PDF format</li>
                        <li>Less than 5MB in size</li>
                    </ul>
                    
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Document verification may take up to 24 hours after submission.
                    </div>
                </div>
            </div>
            
            <div class="card shadow">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-check-circle me-2"></i> Required Documents
                    </h5>
                </div>
                <div class="card-body">
                    <div class="list-group">
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>ID Card</span>
                                @php
                                    $hasIDCard = collect($documents)->contains(function($document) {
                                        return $document['document_type']['name'] == 'ID Card' && $document['status'] == 'approved';
                                    });
                                @endphp
                                @if($hasIDCard)
                                    <span class="badge bg-success rounded-pill"><i class="fas fa-check"></i></span>
                                @else
                                    <span class="badge bg-danger rounded-pill"><i class="fas fa-times"></i></span>
                                @endif
                            </div>
                        </div>
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Student ID</span>
                                @php
                                    $hasStudentID = collect($documents)->contains(function($document) {
                                        return $document['document_type']['name'] == 'Student ID' && $document['status'] == 'approved';
                                    });
                                @endphp
                                @if($hasStudentID)
                                    <span class="badge bg-success rounded-pill"><i class="fas fa-check"></i></span>
                                @else
                                    <span class="badge bg-danger rounded-pill"><i class="fas fa-times"></i></span>
                                @endif
                            </div>
                        </div>
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <span>Guardian Letter</span>
                                @php
                                    $hasGuardianLetter = collect($documents)->contains(function($document) {
                                        return $document['document_type']['name'] == 'Guardian Letter' && $document['status'] == 'approved';
                                    });
                                @endphp
                                @if($hasGuardianLetter)
                                    <span class="badge bg-success rounded-pill"><i class="fas fa-check"></i></span>
                                @else
                                    <span class="badge bg-danger rounded-pill"><i class="fas fa-times"></i></span>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Upload Document Modal -->
<div class="modal fade" id="uploadDocumentModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('tenant.document.upload') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Upload Document</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="doc_type_id" class="form-label">Document Type</label>
                        <select class="form-select @error('doc_type_id') is-invalid @enderror" id="doc_type_id" name="doc_type_id" required>
                            <option value="" selected disabled>Select document type</option>
                            @foreach($documentTypes as $type)
                                <option value="{{ $type['id'] }}">{{ $type['name'] }}</option>
                            @endforeach
                        </select>
                        @error('doc_type_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label for="file" class="form-label">Document File</label>
                        <input type="file" class="form-control @error('file') is-invalid @enderror" id="file" name="file" required>
                        @error('file')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <div class="form-text">Maximum file size: 5MB. Supported formats: JPG, PNG, PDF</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="description" class="form-label">Description (optional)</label>
                        <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description" rows="2"></textarea>
                        @error('description')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-upload me-1"></i> Upload Document
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Update Document Modal -->
<div class="modal fade" id="updateDocumentModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="updateDocumentForm" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Update Document</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Current File:</strong> <span id="currentFileName"></span></p>
                    
                    <div class="mb-3">
                        <label for="update_file" class="form-label">Upload New File (optional)</label>
                        <input type="file" class="form-control" id="update_file" name="file">
                        <div class="form-text">Leave empty to keep current file. Max size: 5MB</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="update_description" class="form-label">Description (optional)</label>
                        <textarea class="form-control" id="update_description" name="description" rows="2"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Update Document
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Delete Document Modal -->
<div class="modal fade" id="deleteDocumentModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="deleteDocumentForm" method="POST">
                @csrf
                @method('DELETE')
                <div class="modal-header">
                    <h5 class="modal-title">Delete Document</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this document: <strong id="deleteDocumentName"></strong>?</p>
                    <p class="text-danger">This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">
                        <i class="fas fa-trash-alt me-1"></i> Delete Document
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Handle document update
        const updateButtons = document.querySelectorAll('.update-document-btn');
        const updateModal = document.getElementById('updateDocumentModal');
        const updateForm = document.getElementById('updateDocumentForm');
        const currentFileName = document.getElementById('currentFileName');
        const updateDescription = document.getElementById('update_description');
        
        updateButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                const name = this.dataset.name;
                const description = this.dataset.description;
                
                updateForm.action = `/documents/${id}`;
                currentFileName.textContent = name;
                updateDescription.value = description;
                
                new bootstrap.Modal(updateModal).show();
            });
        });
        
        // Handle document deletion
        const deleteButtons = document.querySelectorAll('.delete-document-btn');
        const deleteModal = document.getElementById('deleteDocumentModal');
        const deleteForm = document.getElementById('deleteDocumentForm');
        const deleteDocumentName = document.getElementById('deleteDocumentName');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                const name = this.dataset.name;
                
                deleteForm.action = `/documents/${id}`;
                deleteDocumentName.textContent = name;
                
                new bootstrap.Modal(deleteModal).show();
            });
        });
    });
</script>
@endsection
