@extends('layouts.app')

@section('title', 'Available Rooms - Rusunawa')

@section('meta')
<meta name="description" content="Browse available rooms in our university housing. Find the perfect accommodation for your needs.">
<meta name="api-data" content="{{ isset($initialData) ? json_encode($initialData) : '{}' }}">
@if(isset($error))
<meta name="api-error" content="{{ $error }}">
@endif
@endsection

@section('content')
<div id="rooms-list-root"></div>
@endsection

@section('scripts')
@vite(['public/js/rooms-list-app.jsx'])
@endsection
