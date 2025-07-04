<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantType extends Model
{
    use HasFactory;
    protected $table = 'tenant_types';
    protected $fillable = ['name'];
}
