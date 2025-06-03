@extends('layouts.app')

@section('title', 'Room ' . ($room['name'] ?? 'Detail'))

@section('content')
<!-- React Mount Point -->
<div id="room-detail-root"></div>
@endsection

@section('scripts')
<!-- Pass room data to React -->
<script>
    window.roomData = {
        room: @json($room ?? []),
        isAuthenticated: {{ session('tenant_token') ? 'true' : 'false' }}
    };
</script>

<!-- Load React Component -->
@vite(['public/js/room-app.jsx'])
@endsection
