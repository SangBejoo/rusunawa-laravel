<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type_id',
        'gender',
        'phone',
        'address',
        'nim',
        'home_latitude',
        'home_longitude',
        'distance_to_campus',
    ];

    public static function calculateDistanceToCampus($lat1, $lon1, $campusLat = -6.3713553, $campusLon = 106.8241857)
    {
        // Haversine formula
        $earthRadius = 6371; // km
        $dLat = deg2rad($campusLat - $lat1);
        $dLon = deg2rad($campusLon - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) +
            cos(deg2rad($lat1)) * cos(deg2rad($campusLat)) *
            sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return round($earthRadius * $c, 2); // in km, 2 decimal
    }
}
