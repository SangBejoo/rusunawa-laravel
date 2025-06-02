@extends('layouts.app')

@section('title', 'Dashboard - Rusunawa Tenant Portal')

@section('content')
<div id="landing-root"></div>
@endsection

@section('scripts')
@vite(['public/js/landing-app.jsx'])
@endsection
