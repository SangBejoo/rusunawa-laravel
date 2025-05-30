<?php

namespace App\Services;

class NotificationService extends ApiClient
{
    /**
     * Get user notifications
     *
     * @param int $userId
     * @param array $params
     * @return array
     */
    public function getUserNotifications(int $userId, array $params = [])
    {
        return $this->get('/v1/users/' . $userId . '/notifications', $params);
    }

    /**
     * Get all notifications (admin endpoint)
     *
     * @param array $params
     * @return array
     */
    public function getNotifications(array $params = [])
    {
        return $this->get('/v1/notifications', $params);
    }

    /**
     * Mark a notification as read
     *
     * @param int $notificationId
     * @return array
     */
    public function markAsRead(int $notificationId)
    {
        return $this->put('/v1/notifications/' . $notificationId . '/read', []);
    }

    /**
     * Mark all notifications as read for a user
     *
     * @param int $userId
     * @return array
     */
    public function markAllAsRead(int $userId)
    {
        return $this->put('/v1/users/' . $userId . '/notifications/read-all', []);
    }

    /**
     * Create a new notification
     *
     * @param int $userId
     * @param int $typeId
     * @param string $content
     * @return array
     */
    public function createNotification(int $userId, int $typeId, string $content)
    {
        return $this->post('/v1/notifications', [
            'user_id' => $userId,
            'type_id' => $typeId,
            'content' => $content
        ]);
    }

    /**
     * Delete a notification
     *
     * @param int $notificationId
     * @return array
     */
    public function deleteNotification(int $notificationId)
    {
        return $this->delete('/v1/notifications/' . $notificationId);
    }
}
