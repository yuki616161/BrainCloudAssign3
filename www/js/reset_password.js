document.getElementById("reset-password-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const newPassword = document.getElementById("password").value.trim();
    const username = localStorage.getItem("username");

    const data = new FormData();
    data.append("username", username);
    data.append("password", newPassword);

    try {
        const response = await fetch("https://braincloud.cmsa.digital/reset_password.php", {
            method: "POST",
            body: data
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message || "Password reset successfully!");
            window.location.href = "login.html"; // Redirect to login page after reset
        } else {
            alert(result.message || "Error resetting password.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
});
