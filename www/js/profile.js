// Navigation Toggle
const toggleNav = document.getElementById('toggle-nav');
const leftNav = document.getElementById('left-nav');
const logoutBtn = document.getElementById('logout-btn');
const profileLogoutBtn = document.getElementById('profileLogoutBtn');

// Toggle navigation menu
toggleNav.addEventListener('click', () => {
    leftNav.classList.toggle('show');
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('user');
        alert('Logged out successfully.');
        window.location.href = 'login.html'; 
    }
});

profileLogoutBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to log out?")) {
        alert('Logged out successfully.');
        window.location.href = '../index.html'; // Redirect to the login page
    }
});

// Close navigation when clicking outside
document.addEventListener('click', (e) => {
    if (!leftNav.contains(e.target) && !toggleNav.contains(e.target)) {
        leftNav.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    setupEventListeners();
});

function setupEventListeners() {
    // Edit button click
    document.getElementById('editButton').addEventListener('click', () => {
        toggleViewMode(false); // Switch to edit mode
    });

    // Cancel button click
    document.getElementById('cancelEdit').addEventListener('click', () => {
        toggleViewMode(true); // Switch to view mode
        loadProfileData(); // Reload profile data to reset changes
    });

    // Form submission
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
}

async function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('user')); // Parse the stored 'user' object
    if (!user || !user.id) {
        alert("User not logged in!");
        window.location.href = '../index.html'; // Redirect to login if no user data
        return;
    }

    const user_id = user.id; // Retrieve the user_id from user object

    try {
        const response = await fetch(`https://braincloud.cmsa.digital/srphp/getProfile.php?user_id=${user_id}`);
        if (!response.ok) throw new Error('Failed to fetch profile data');

        const data = await response.json();
        if (data.success && data.users) {
            // Update display view with null checks
            const displayElements = {
                'displayUsername': data.users.username || '',
                'displayEmail': data.users.email || '',
                'displayGender': data.users.gender || '',
                'displayBirthday': data.users.birthday || ''
            };

            // Update form elements with null checks
            const formElements = {
                'username': data.users.username || '',
                'email': data.users.email || '',
                'gender': data.users.gender || '',
                'birthday': data.users.birthday || ''
            };

            // Update display elements
            Object.entries(displayElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });

            // Update form elements
            Object.entries(formElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = value;
                }
            });

            clearFieldErrors(); // Clear any existing error messages
        } else {
            showError(data.message || 'Failed to load profile data');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Error loading profile data');
    }
}

async function updateProfile() {
    clearFieldErrors(); // Clear previous error messages

    const user = JSON.parse(localStorage.getItem('user')); // Parse the stored 'user' object
    if (!user || !user.id) {
        alert("User not logged in!");
        window.location.href = '../index.html'; // Redirect to login if no user data
        return;
    }

    const user_id = user.id;
    const user_username = user.username;

    const formData = {
        user_id: user_id, // Get user_id from localStorage
        username: document.getElementById('username').value.trim(),
        original_username: user_username,
        email: document.getElementById('email').value.trim(),
        gender: document.getElementById('gender').value,
        birthday: document.getElementById('birthday').value
    };

    if (!validateFormData(formData)) return; // Basic validation

    try {
        const response = await fetch('https://braincloud.cmsa.digital/srphp/updateProfile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (data.success) {
            // Successfully updated profile
            toggleViewMode(true); // Switch back to view mode
            await loadProfileData(); // Reload updated profile data
            showSuccess('Profile updated successfully');

            // Update localStorage with the new data (username, email, gender, birthday)
            const updatedUser = { 
                ...user, 
                username: formData.username, 
                email: formData.email, 
                gender: formData.gender, 
                birthday: formData.birthday 
            };
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Update the 'user' object in localStorage
        } else {
            if (data.errors) {
                Object.keys(data.errors).forEach(field => {
                    showFieldError(`${field}Error`, data.errors[field]);
                });
            } else {
                showError(data.message || 'Failed to update profile');
            }
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Error updating profile');
    }
}

function toggleViewMode(isViewMode) {
    const viewProfile = document.getElementById('viewProfile');
    const editProfile = document.getElementById('editProfile');
    
    if (isViewMode) {
        viewProfile.style.display = 'block';
        editProfile.style.display = 'none';
        viewProfile.style.filter = 'none'; // Remove blur effect
        viewProfile.style.opacity = '1'; // Make fully visible
    } else {
        viewProfile.style.display = 'none';
        editProfile.style.display = 'block';
    }
}

function validateFormData(formData) {
    let isValid = true;

    if (!formData.username) {
        showFieldError('usernameError', 'Username is required');
        isValid = false;
    }

    if (!formData.email) {
        showFieldError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(formData.email)) {
        showFieldError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    if (!formData.birthday) {
        showFieldError('birthdayError', 'Birthday is required');
        isValid = false;
    }

    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldErrors() {
    const errorElements = document.querySelectorAll('[id$="Error"]');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

function showError(message) {
    alert(message); // Replace with a better notification system if desired
}

function showSuccess(message) {
    alert(message); // Replace with a better notification system if desired
}
