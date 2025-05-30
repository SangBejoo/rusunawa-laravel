<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TenantAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Tenant;
use App\Models\TenantType;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class TenantRegisterController extends Controller
{
    protected $authService;

    public function __construct(TenantAuthService $authService)
    {
        $this->authService = $authService;
        $this->middleware('guest');
    }

    /**
     * Show the registration form
     */
    public function showRegistrationForm()
    {
        return view('auth.tenant-register');
    }

    /**
     * Handle the registration request
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|min:8|confirmed',
            'tenant_type' => 'required|string',
            'gender' => 'required|in:L,P',
            'phone' => 'required|string',
            'address' => 'required|string',
            'home_latitude' => 'required|numeric',
            'home_longitude' => 'required|numeric',
            'nim' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // 1. Kirim ke backend GoLang
        $response = $this->authService->register([
            'email' => $request->email,
            'password' => $request->password,
            'name' => $request->name,
            'tenant_type' => $request->tenant_type,
            'gender' => $request->gender,
            'phone' => $request->phone,
            'address' => $request->address,
            'home_latitude' => $request->home_latitude,
            'home_longitude' => $request->home_longitude,
            'nim' => $request->nim,
        ]);

        if (!$response['success']) {
            $message = $response['body']['message'] ?? 'Registration failed';
            return back()->withErrors(['email' => $message])->withInput();
        }

        // 2. Simpan ke database lokal
        DB::beginTransaction();
        try {
            // Cari role penyewa
            $role = Role::where('name', 'penyewa')->first();
            // Cari tenant_type_id
            $tenantType = TenantType::where('name', $request->tenant_type)->first();
            // Hitung jarak otomatis ke kampus
            $distance = Tenant::calculateDistanceToCampus($request->home_latitude, $request->home_longitude);
            // Simpan user
            $user = User::create([
                'role_id' => $role ? $role->role_id : 5, // fallback ke 5
                'full_name' => $request->name,
                'email' => $request->email,
                'password_hash' => bcrypt($request->password),
            ]);
            // Simpan tenant
            Tenant::create([
                'user_id' => $user->user_id,
                'type_id' => $tenantType ? $tenantType->type_id : 3,
                'gender' => $request->gender,
                'phone' => $request->phone,
                'address' => $request->address,
                'nim' => $request->nim,
                'home_latitude' => $request->home_latitude,
                'home_longitude' => $request->home_longitude,
                'distance_to_campus' => $distance,
            ]);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['email' => 'Registrasi gagal disimpan di database lokal: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('tenant.login')
            ->with('status', 'Registration successful! Please login with your credentials.');
    }
}
