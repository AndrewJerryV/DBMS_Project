document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';
    const STAFF_ID = 1; // Assuming a logged-in user with ID 1 for demonstration

    // FIXED: Added theme logic to apply dark/light theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    const form = document.getElementById('settings-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const roleInput = document.getElementById('role');
    
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const profileStatus = document.getElementById('profile-status');


    // Fetch staff details and populate the form
    async function fetchAndPopulateStaffDetails() {
        try {
            const response = await fetch(`${API_BASE_URL}/staff/details/${STAFF_ID}`);
            if (!response.ok) {
                throw new Error('Failed to fetch staff details.');
            }
            const staff = await response.json();

            // Populate header
            profileName.textContent = staff.name;
            profileRole.textContent = staff.role.charAt(0).toUpperCase() + staff.role.slice(1);
            profileStatus.textContent = staff.status.charAt(0).toUpperCase() + staff.status.slice(1);
            profileAvatar.textContent = staff.name.split(' ').map(n => n[0]).join('').toUpperCase();


            // Populate form fields
            nameInput.value = staff.name;
            emailInput.value = staff.email;
            phoneInput.value = staff.phone;
            roleInput.value = staff.role.charAt(0).toUpperCase() + staff.role.slice(1);

        } catch (error) {
            console.error('Error:', error);
            showNotification('Could not load user data.', 'error');
        }
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            email: emailInput.value,
            phone: phoneInput.value,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/staff/${STAFF_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update profile.');
            }
            
            showNotification(result.message, 'success');

        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification(error.message, 'error');
        }
    });

    // Notification function
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageDiv = document.getElementById('notification-message');
        
        messageDiv.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'flex';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Initial load
    fetchAndPopulateStaffDetails();
});