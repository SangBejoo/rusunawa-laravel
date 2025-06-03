<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LandingController extends Controller
{
    /**
     * Show the landing page
     */
    public function index()
    {
        return view('landing');
    }
    
    /**
     * Handle 404 errors
     */
    public function notFound()
    {
        return response()->view('errors.404', [], 404);
    }
}
