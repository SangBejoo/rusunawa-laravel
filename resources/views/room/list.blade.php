@extends('layouts.app')

@section('title', 'Available Rooms - Rusunawa')

@section('content')
<div id="landing-root"></div>
@endsection

@section('scripts')
@vite(['public/js/landing-app.jsx'])
@endsection
