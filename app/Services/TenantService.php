<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class TenantService extends ApiClient
{
    /**
     * Update tenant profile
     */
    public function updateTenant(array $data)
    {
        return $this->put('/v1/tenants/' . $data['tenant_id'], $data);
    }

    /**
     * Update tenant location coordinates
     */
    public function updateTenantLocation(int $tenantId, float $latitude, float $longitude)
    {
        return $this->put('/v1/tenants/' . $tenantId . '/location', [
            'home_latitude' => $latitude,
            'home_longitude' => $longitude
        ]);
    }

    /**
     * Update student ID (NIM)
     */
    public function updateTenantNIM(int $tenantId, string $nim)
    {
        return $this->put('/v1/tenants/' . $tenantId . '/nim', [
            'nim' => $nim
        ]);
    }

    /**
     * Get current tenant information
     */
    public function getTenant(int $tenantId)
    {
        return $this->get('/v1/tenants/' . $tenantId);
    }
    
    /**
     * Get waiting list status
     */
    public function getWaitingListStatus(int $tenantId)
    {
        return $this->get('/v1/tenants/' . $tenantId . '/waiting-list');
    }
    
    /**
     * Add tenant to waiting list
     */
    public function addToWaitingList(int $tenantId, string $notes = '')
    {
        return $this->post('/v1/tenants/' . $tenantId . '/waiting-list', [
            'notes' => $notes
        ]);
    }
    
    /**
     * Remove tenant from waiting list
     */
    public function removeFromWaitingList(int $waitingId, string $reason = '')
    {
        return $this->delete('/v1/waiting-list/' . $waitingId, [
            'reason' => $reason
        ]);
    }
    
    /**
     * Validate student information
     */
    public function validateStudentInfo(int $tenantId, string $nim, string $schoolName = '')
    {
        return $this->post('/v1/tenants/' . $tenantId . '/validate-student', [
            'nim' => $nim,
            'school_name' => $schoolName
        ]);
    }
    
    /**
     * Recalculate distance to campus
     */
    public function recalculateDistanceToCampus(int $tenantId)
    {
        return $this->post('/v1/tenants/' . $tenantId . '/recalculate-distance', []);
    }
}
