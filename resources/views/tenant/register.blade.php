@extends('layouts.app')

@section('title', 'Register - Rusunawa Tenant Portal')

@section('content')
<div id="register-root"></div>
@endsection

@section('scripts')
@vite(['public/js/register-app.jsx'])
@endsection
