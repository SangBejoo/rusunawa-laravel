<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class DocumentService extends ApiClient
{
    /**
     * Upload a new document for tenant
     */
    public function uploadDocument(int $tenantId, UploadedFile $file, int $docTypeId, string $description = '')
    {
        $content = base64_encode(file_get_contents($file->getRealPath()));
        
        return $this->post('/v1/tenants/' . $tenantId . '/documents', [
            'tenant_id' => $tenantId,
            'doc_type_id' => $docTypeId,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getMimeType(),
            'content' => $content,
            'description' => $description,
            'is_image' => str_contains($file->getMimeType(), 'image/')
        ]);
    }

    /**
     * Get tenant documents
     */
    public function getTenantDocuments(int $tenantId, array $params = [])
    {
        return $this->get('/v1/tenants/' . $tenantId . '/documents', $params);
    }

    /**
     * Get document details
     */
    public function getDocumentDetails(string $documentId)
    {
        return $this->get('/v1/documents/' . $documentId);
    }

    /**
     * Update an existing document
     */
    public function updateDocument(string $documentId, array $data, UploadedFile $file = null)
    {
        $requestData = $data;
        
        if ($file) {
            $requestData['content'] = base64_encode(file_get_contents($file->getRealPath()));
            $requestData['file_name'] = $file->getClientOriginalName();
            $requestData['file_type'] = $file->getMimeType();
        }
        
        return $this->put('/v1/documents/' . $documentId, $requestData);
    }

    /**
     * Delete a document
     */
    public function deleteDocument(string $documentId, int $tenantId)
    {
        return $this->delete('/v1/documents/' . $documentId, [
            'tenant_id' => $tenantId
        ]);
    }

    /**
     * Sign policy agreement
     */
    public function signPolicyAgreement(int $tenantId, string $policyId, string $policyVersion)
    {
        return $this->post('/v1/tenants/' . $tenantId . '/policies/sign', [
            'tenant_id' => $tenantId,
            'policy_id' => $policyId,
            'policy_version' => $policyVersion,
            'agreed' => true,
            'signed_at' => now()->toIso8601String()
        ]);
    }
}
