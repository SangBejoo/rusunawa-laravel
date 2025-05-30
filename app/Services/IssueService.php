<?php

namespace App\Services;

class IssueService extends ApiClient
{
    /**
     * Report a new issue
     *
     * @param int $bookingId
     * @param string $reportedBy
     * @param string $description
     * @return array
     */
    public function reportIssue(int $bookingId, string $reportedBy, string $description)
    {
        return $this->post('/v1/issues', [
            'booking_id' => $bookingId,
            'reported_by' => $reportedBy,
            'description' => $description
        ]);
    }

    /**
     * Get issue details
     *
     * @param int $issueId
     * @return array
     */
    public function getIssue(int $issueId)
    {
        return $this->get('/v1/issues/' . $issueId);
    }

    /**
     * Get all issues (for admin)
     *
     * @param array $params
     * @return array
     */
    public function getIssues(array $params = [])
    {
        return $this->get('/v1/issues', $params);
    }

    /**
     * Get tenant's issues
     *
     * @param int $tenantId
     * @param array $params
     * @return array
     */
    public function getTenantIssues(int $tenantId)
    {
        // Since API doesn't have a direct endpoint for tenant issues,
        // we'll fetch all issues and filter by tenant in the application
        $response = $this->getIssues([
            'limit' => 100 // Set a relatively high limit to get most issues
        ]);

        if (!$response['success']) {
            return $response;
        }

        // Filter issues by tenant
        $issues = array_filter($response['body']['issues'] ?? [], function($issue) use ($tenantId) {
            return isset($issue['booking']['tenant_id']) && $issue['booking']['tenant_id'] == $tenantId;
        });

        $response['body']['issues'] = array_values($issues); // Reset array keys
        $response['body']['total_count'] = count($issues);

        return $response;
    }

    /**
     * Update issue status
     *
     * @param int $issueId
     * @param string $status
     * @param string|null $resolvedAt
     * @return array
     */
    public function updateIssueStatus(int $issueId, string $status, ?string $resolvedAt = null)
    {
        $data = ['status' => $status];
        
        if ($resolvedAt) {
            $data['resolved_at'] = $resolvedAt;
        }
        
        return $this->put('/v1/issues/' . $issueId . '/status', $data);
    }
}
