document.getElementById("security-question-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const userAnswer = document.getElementById("security-answer").value.trim();
    const correctAnswer = localStorage.getItem("security_answer");

    if (userAnswer === correctAnswer) {
        // Answer is correct, proceed to reset password page
        window.location.href = "reset_password.html";
    } else {
        alert("Incorrect answer. Please try again.");
    }
});

// Fetch security question from localStorage and display it
document.getElementById("security-question-label").textContent = localStorage.getItem("security_question");
