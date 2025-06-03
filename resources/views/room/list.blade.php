@extends('layouts.app')

@section('title', 'Available Rooms - Rusunawa')

@section('content')
<!-- React Mount Point -->
<div id="room-list-root"></div>
@endsection

@section('scripts')
@vite(['public/js/room-app.jsx'])
@endsection
