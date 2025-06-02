@extends('layouts.app')

@section('title', 'Login - Rusunawa Tenant Portal')

@section('content')
<div id="login-root"></div>
@endsection

@section('scripts')
@vite(['public/js/login-app.jsx'])
@endsection
