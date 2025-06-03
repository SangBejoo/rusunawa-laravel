@extends('layouts.app')

@section('title', isset($initialData['room']['name']) ? $initialData['room']['name'] . ' - Rusunawa' : 'Room Details - Rusunawa')

@section('meta')
<meta name="description" content="{{ isset($initialData['room']['description']) ? $initialData['room']['description'] : 'View room details and book your accommodation.' }}">
<meta name="api-data" content="{{ isset($initialData) ? json_encode($initialData) : '{}' }}">
@endsection

@section('content')
<div id="room-detail-root"></div>
@endsection

@section('scripts')
@vite(['public/js/room-detail-app.jsx'])
@endsection
