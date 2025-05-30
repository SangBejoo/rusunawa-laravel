import React from 'react';
import { createRoot } from 'react-dom/client';
import DistancePicker from './DistancePicker.jsx';
import RegisterPage from './RegisterPage.jsx';

/**
 * Rusunawa Tenant Portal JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Setup CSRF Token for AJAX requests
    let token = document.head.querySelector('meta[name="csrf-token"]');
    
    if (token) {
        window.axios = require('axios');
        window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
    }
    
    // Toggle password visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = document.querySelector(this.getAttribute('data-target'));
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Handle notification updates
    function updateNotifications() {
        fetch('/notifications/unread-count', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const badge = document.querySelector('.notification-badge');
                const dropdown = document.getElementById('notificationDropdown');
                
                if (badge && dropdown) {
                    badge.textContent = data.unread_count;
                    badge.style.display = data.unread_count > 0 ? 'inline-block' : 'none';
                    
                    // Update dropdown content if there are notifications
                    if (data.unread_count > 0 && data.notifications && data.notifications.length > 0) {
                        dropdown.innerHTML = '';
                        
                        data.notifications.forEach(notification => {
                            const item = document.createElement('li');
                            item.className = 'dropdown-item';
                            
                            const title = document.createElement('div');
                            title.className = 'fw-bold small';
                            title.textContent = getNotificationTitle(notification.notification_type.name);
                            
                            const content = document.createElement('div');
                            content.className = 'text-truncate small';
                            content.textContent = notification.content;
                            
                            item.appendChild(title);
                            item.appendChild(content);
                            dropdown.appendChild(item);
                        });
                        
                        // Add link to all notifications
                        const separator = document.createElement('li');
                        separator.innerHTML = '<hr class="dropdown-divider">';
                        dropdown.appendChild(separator);
                        
                        const viewAll = document.createElement('li');
                        viewAll.className = 'dropdown-item text-center';
                        viewAll.innerHTML = '<a href="/notifications" class="text-decoration-none">View All Notifications</a>';
                        dropdown.appendChild(viewAll);
                    } else {
                        dropdown.innerHTML = '<li class="dropdown-item text-center">No new notifications</li>';
                    }
                }
            }
        })
        .catch(error => console.error('Error fetching notifications:', error));
    }
    
    function getNotificationTitle(type) {
        switch(type) {
            case 'booking_confirmation': return 'Booking Confirmation';
            case 'payment_reminder': return 'Payment Reminder';
            case 'payment_confirmation': return 'Payment Confirmation';
            case 'issue_update': return 'Maintenance Update';
            case 'document_status': return 'Document Status Update';
            default: return type.replace(/_/g, ' ');
        }
    }
    
    // Update notifications on page load
    if (document.querySelector('.notification-badge')) {
        updateNotifications();
        // Update every minute
        setInterval(updateNotifications, 60000);
    }
    
    // Handle payment method selection
    const paymentMethodCards = document.querySelectorAll('.payment-method-card');
    paymentMethodCards.forEach(card => {
        card.addEventListener('click', function() {
            const radioButton = this.querySelector('input[type="radio"]');
            if (radioButton) {
                radioButton.checked = true;
                
                // Remove active class from all cards
                paymentMethodCards.forEach(c => c.classList.remove('active'));
                // Add active class to selected card
                this.classList.add('active');
            }
        });
    });
    
    // Document upload preview
    const fileInputs = document.querySelectorAll('input[type="file"][data-preview]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const previewElement = document.querySelector(this.dataset.preview);
            if (previewElement && this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    if (previewElement.tagName === 'IMG') {
                        previewElement.src = e.target.result;
                    } else {
                        // For non-image files, just show the filename
                        previewElement.textContent = input.files[0].name;
                    }
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    });
    
    // Google Maps integration
    function initMap(elementId, lat = -6.200000, lng = 106.816666, editable = false) {
        if (!document.getElementById(elementId)) return;
        
        const mapOptions = {
            center: { lat: parseFloat(lat), lng: parseFloat(lng) },
            zoom: 14
        };
        
        const map = new google.maps.Map(document.getElementById(elementId), mapOptions);
        
        let marker = new google.maps.Marker({
            position: { lat: parseFloat(lat), lng: parseFloat(lng) },
            map: map,
            draggable: editable
        });
        
        if (editable) {
            // Update coordinates when marker is dragged
            google.maps.event.addListener(marker, 'dragend', function() {
                if (document.getElementById('home_latitude') && document.getElementById('home_longitude')) {
                    document.getElementById('home_latitude').value = marker.getPosition().lat();
                    document.getElementById('home_longitude').value = marker.getPosition().lng();
                }
            });
            
            // Add marker on click
            google.maps.event.addListener(map, 'click', function(event) {
                marker.setPosition(event.latLng);
                if (document.getElementById('home_latitude') && document.getElementById('home_longitude')) {
                    document.getElementById('home_latitude').value = event.latLng.lat();
                    document.getElementById('home_longitude').value = event.latLng.lng();
                }
            });
        }
        
        return { map, marker };
    }
    
    if (document.getElementById('register-root')) {
        createRoot(document.getElementById('register-root')).render(<RegisterPage />);
    }
});
