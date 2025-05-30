<?php

namespace App\Services;

class BookingService extends ApiClient
{
    /**
     * Get available rooms for booking
     */
    public function getAvailableRooms(array $params = [])
    {
        return $this->get('/v1/rooms', $params);
    }

    /**
     * Get rooms by gender
     */
    public function getRoomsByGender(string $gender, array $params = [])
    {
        return $this->get('/v1/rooms/by-gender/' . $gender, $params);
    }

    /**
     * Get rooms by student type
     */
    public function getRoomsByStudentType(string $tenantType, array $params = [])
    {
        return $this->get('/v1/rooms/by-student-type/' . $tenantType, $params);
    }

    /**
     * Check room availability
     */
    public function getRoomAvailability(int $roomId, string $startDate, string $endDate)
    {
        return $this->get('/v1/rooms/' . $roomId . '/availability', [
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
    }

    /**
     * Create a new booking
     */
    public function createBooking(int $tenantId, int $roomId, string $startDate, string $endDate)
    {
        return $this->post('/v1/bookings', [
            'tenant_id' => $tenantId,
            'room_id' => $roomId,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
    }

    /**
     * Get tenant bookings
     */
    public function getTenantBookings(int $tenantId, array $params = [])
    {
        return $this->get('/v1/tenants/' . $tenantId . '/bookings', $params);
    }

    /**
     * Get booking details
     */
    public function getBookingDetails(int $bookingId)
    {
        return $this->get('/v1/bookings/' . $bookingId);
    }

    /**
     * Cancel a booking
     */
    public function cancelBooking(int $bookingId)
    {
        return $this->put('/v1/bookings/' . $bookingId . '/status', [
            'status' => 'cancelled'
        ]);
    }
}
