document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;

    // Create a FormData object from the form
    const formData = new FormData(form);

    // Send the form data to the server using fetch
    fetch('https://braincloud.cmsa.digital/srphp/register.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        const messageContainer = document.getElementById('message-container');

        if (data.success) {
            // Show success message and redirect after 3 seconds
            showMessage(messageContainer, 'Registration successful! You will be redirected to the login page.', 'success');

            setTimeout(() => {
                window.location.href = 'login.html'; // Redirect after 3 seconds
            }, 1000); // Delay of 3 seconds before redirection
        } else {
            // Show error message if registration fails (e.g., email already registered)
            showMessage(messageContainer, data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const messageContainer = document.getElementById('message-container');
        showMessage(messageContainer, 'An error occurred. Please try again.', 'error');
    });
});

// Function to show message (success or error)
function showMessage(container, message, type) {
    container.innerHTML = ''; // Clear any existing messages

    const messageElement = document.createElement('div');
    messageElement.classList.add(type === 'success' ? 'success-message' : 'error-message');
    messageElement.textContent = message;

    // Append the message element to the container
    container.appendChild(messageElement);
}

// Set max and min attributes for the birthday input field
const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
const currentDate = yyyy + '-' + mm + '-' + dd;
const minDate = (yyyy - 100) + '-' + mm + '-' + dd;

const birthdayInput = document.getElementById('birthday');
birthdayInput.setAttribute('max', currentDate);
birthdayInput.setAttribute('min', minDate);
