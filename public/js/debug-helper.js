// Add this script to your app.blade.php layout to help debug redirects
document.addEventListener('DOMContentLoaded', function() {
    // Get current URL
    const currentUrl = window.location.href;
    
    // Create a small debug element
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '10px';
    debugDiv.style.right = '10px';
    debugDiv.style.padding = '10px';
    debugDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    debugDiv.style.color = 'white';
    debugDiv.style.borderRadius = '5px';
    debugDiv.style.fontSize = '12px';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.maxWidth = '300px';
    debugDiv.style.maxHeight = '200px';
    debugDiv.style.overflow = 'auto';
    
    // Add content
    debugDiv.innerHTML = `
        <div><strong>URL:</strong> ${currentUrl}</div>
        <div><strong>Path:</strong> ${window.location.pathname}</div>
        <div><strong>Query:</strong> ${window.location.search}</div>
        <div><strong>Referrer:</strong> ${document.referrer}</div>
        <div><strong>localStorage:</strong> 
            tenant_token: ${localStorage.getItem('tenant_token') ? 'present' : 'missing'}<br>
            tenant_data: ${localStorage.getItem('tenant_data') ? 'present' : 'missing'}
        </div>
        <div><strong>sessionStorage:</strong>
            tenant_token: ${sessionStorage.getItem('tenant_token') ? 'present' : 'missing'}<br>
            tenant_data: ${sessionStorage.getItem('tenant_data') ? 'present' : 'missing'}
        </div>
        <div>
            <button id="debugToggleBtn" style="background: #333; border: none; color: white; padding: 3px 8px; border-radius: 3px; margin-top: 5px;">Hide</button>
            <button id="debugClearStorageBtn" style="background: #933; border: none; color: white; padding: 3px 8px; border-radius: 3px; margin-top: 5px;">Clear Storage</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(debugDiv);
    
    // Toggle visibility
    document.getElementById('debugToggleBtn').addEventListener('click', function() {
        if (debugDiv.style.display === 'none') {
            debugDiv.style.display = 'block';
            this.textContent = 'Hide';
        } else {
            debugDiv.style.display = 'none';
            this.textContent = 'Show';
        }
    });
    
    // Clear storage
    document.getElementById('debugClearStorageBtn').addEventListener('click', function() {
        localStorage.removeItem('tenant_token');
        localStorage.removeItem('tenant_data');
        sessionStorage.removeItem('tenant_token');
        sessionStorage.removeItem('tenant_data');
        this.textContent = 'Cleared!';
        setTimeout(() => {
            this.textContent = 'Clear Storage';
        }, 1000);
        
        // Update the display
        const lsInfo = debugDiv.querySelector('div:nth-child(5)');
        if (lsInfo) {
            lsInfo.innerHTML = `<strong>localStorage:</strong> 
                tenant_token: ${localStorage.getItem('tenant_token') ? 'present' : 'missing'}<br>
                tenant_data: ${localStorage.getItem('tenant_data') ? 'present' : 'missing'}
            `;
        }
        
        const ssInfo = debugDiv.querySelector('div:nth-child(6)');
        if (ssInfo) {
            ssInfo.innerHTML = `<strong>sessionStorage:</strong>
                tenant_token: ${sessionStorage.getItem('tenant_token') ? 'present' : 'missing'}<br>
                tenant_data: ${sessionStorage.getItem('tenant_data') ? 'present' : 'missing'}
            `;
        }
    });
});
