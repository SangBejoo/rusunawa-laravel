@extends('layouts.app')

@section('title', 'Tenant Portal')

@section('styles')
<!-- Add any additional styles needed for React app -->
<link rel="stylesheet" href="{{ asset('css/app.css') }}">
@endsection

@section('content')
<div id="app-root"></div>

<!-- Pass authentication data to the React application -->
<script type="text/javascript">
    window.appConfig = {
        csrfToken: "{{ csrf_token() }}",
        baseUrl: "{{ url('/') }}",
        tenant: {!! session('tenant_data') ?? 'null' !!},
        authToken: "{{ session('tenant_token') ?? '' }}",
        routes: {
            dashboard: "{{ route('tenant.dashboard') }}",
            profile: "{{ route('tenant.profile') }}",
            bookings: "{{ route('tenant.bookings') }}",
            invoices: "{{ route('tenant.invoices') }}",
            logout: "{{ route('tenant.logout') }}"
        }
    };
</script>

<!-- Load React application -->
<script src="{{ asset('js/react-app.js') }}" type="module"></script>
@endsection