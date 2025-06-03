@extends('layouts.app')

@section('title', 'Login - Rusunawa Tenant Portal')

@section('meta')
<meta name="csrf-token" content="{{ csrf_token() }}">
@endsection

@section('content')
<div id="login-root"></div>
@endsection

@section('scripts')
@vite(['public/js/login-app.jsx'])
@endsection
