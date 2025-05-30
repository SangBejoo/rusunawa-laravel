@extends('layouts.app')

@section('title', 'Register')

@section('content')
<div id="register-root"></div>
<script>
    window._config = window._config || {};
    // Tambahkan konfigurasi global jika perlu, misal:
    // window._config.apiBaseUrl = "{{ config('services.api.url') }}";
</script>
<script type="module" src="{{ asset('build/js/register-app.js') }}"></script>
@endsection
