@extends('layouts.app')

@section('title', 'Welcome to Rusunawa - University Housing Portal')

@section('meta')
<meta name="description" content="Find comfortable and affordable university housing at Rusunawa. Browse available rooms and apply online.">
<meta name="keywords" content="rusunawa, university housing, student accommodation, campus housing">
@endsection

@section('content')
<div id="landing-root"></div>
@endsection

@section('scripts')
@vite(['public/js/landing-app.jsx'])
@endsection
