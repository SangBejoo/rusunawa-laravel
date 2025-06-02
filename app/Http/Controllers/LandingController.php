<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LandingController extends Controller
{
    /**
     * Display the landing page (SPA)
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        return view('landing');
    }

    /**
     * Handle 404 not found routes
     *
     * @return \Illuminate\View\View
     */
    public function notFound()
    {
        return view('landing', ['is404' => true]);
    }
}
