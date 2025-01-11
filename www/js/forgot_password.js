document.getElementById("forgot-password-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const gender = document.getElementById("gender").value.trim();
    const birthday = document.getElementById("birthday").value.trim();

    const data = new FormData();
    data.append("username", username);
    data.append("gender", gender);
    data.append("birthday", birthday);

    try {
        const response = await fetch("https://braincloud.cmsa.digital/forgot_password.php", {
            method: "POST",
            body: data
        });

        const result = await response.json();

        if (result.success) {
            // Store details in localStorage for later use
            localStorage.setItem("username", username);
            localStorage.setItem("gender", gender);
            localStorage.setItem("birthday", birthday);
            localStorage.setItem("security_question", result.security_question);
            localStorage.setItem("security_answer", result.security_answer);

            // Redirect to the security question page
            window.location.href = "security_question.html";
        } else {
            alert(result.message || "Error verifying user details.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
});
