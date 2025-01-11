const form = document.getElementById('loginForm');
const responseMessage = document.getElementById('responseMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Correct URL without duplicate 'login.php'
        const response = await fetch('https://braincloud.cmsa.digital/srphp/login.php?email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password));
        const data = await response.json();

        if (data.success) {
            // Display success message briefly
            responseMessage.style.color = 'green';
            responseMessage.textContent = 'Login successful! Redirecting...';
            
            // Redirect to the main page after a short delay
            setTimeout(() => {
                // Save user data to localStorage (optional)
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'mainPage.html';
            }, 1500); // 1.5-second delay
        } else {
            responseMessage.style.color = 'red';
            responseMessage.textContent = data.message;
        }
    } catch (error) {
        responseMessage.style.color = 'red';
        responseMessage.textContent = 'An error occurred. Please try again.';
        console.error('Error:', error);
    }
});
