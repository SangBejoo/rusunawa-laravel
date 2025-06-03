@extends('layouts.app')

@section('title', 'Error')

@section('content')
<div class="container py-5">
    <div class="alert alert-danger">
        <h4 class="alert-heading">Error</h4>
        <p>{{ $message ?? 'An error occurred' }}</p>
        @if(isset($details))
            <hr>
            <p class="mb-0">{{ $details }}</p>
        @endif
    </div>
    
    <div class="mt-4">
        <a href="{{ url()->previous() }}" class="btn btn-outline-primary me-2">
            <i class="fas fa-arrow-left me-2"></i> Go Back
        </a>
        <a href="{{ route('landing') }}" class="btn btn-primary">
            <i class="fas fa-home me-2"></i> Return Home
        </a>
    </div>
</div>
@endsection
