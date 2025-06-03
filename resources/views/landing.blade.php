@extends('layouts.app')

@section('title', 'Welcome to Rusunawa')

@section('content')
<!-- The React app will be mounted here -->
<div id="landing-root"></div>
@endsection

@section('scripts')
<!-- Load React dependencies first -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>

<!-- Then load the landing page app -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Make sure the navbar is loaded first
        if (window.loadNavbar) {
            window.loadNavbar();
        }
    });
</script>
@vite(['public/js/landing-app.jsx'])
@endsection
