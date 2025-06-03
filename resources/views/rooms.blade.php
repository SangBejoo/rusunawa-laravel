@extends('layouts.app')

@section('title', 'Available Rooms')

@section('content')
<!-- React Mount Point -->
<div id="room-list-root"></div>
@endsection

@section('scripts')
<!-- Pass any server data to React -->
<script>
    window.roomsData = {
        rooms: @json($rooms ?? []),
        totalCount: {{ $totalCount ?? 0 }},
        apiBaseUrl: "{{ env('API_BASE_URL', 'http://localhost:8001/v1') }}"
    };
    
    // Debug information
    console.log('Room data passed from server:', window.roomsData);
</script>

<!-- Load React Component -->
@vite(['public/js/room-app.jsx'])
@endsection
