@extends('layouts.app')

@section('title', 'Page Not Found - Rusunawa')

@section('content')
<div id="not-found-root"></div>
@endsection

@section('scripts')
@vite(['public/js/NotFoundPage.jsx'])
@endsection
