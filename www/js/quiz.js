// Navigation Toggle
const toggleNav = document.getElementById('toggle-nav');
const leftNav = document.getElementById('left-nav');
const logoutBtn = document.getElementById('logout-btn');

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

// Close navigation when clicking outside
document.addEventListener('click', (e) => {
    if (!leftNav.contains(e.target) && !toggleNav.contains(e.target)) {
        leftNav.classList.remove('show');
    }
});

// Quiz Elements
const categorySection = document.getElementById("category-section");
const quizSection = document.getElementById("quiz-section");
const resultSection = document.getElementById("result-section");

const categorySelect = document.getElementById("category-select");
const startBtn = document.getElementById("start-btn");
const questionEl = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");

const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const optionLabels = ["A", "B", "C", "D"];

// Enable Start Button on Category Selection
categorySelect.addEventListener("change", () => {
  startBtn.disabled = !categorySelect.value;
});

// Fetch Questions Based on Selected Category
async function fetchQuestions(category) {
  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=3&category=${category}&difficulty=medium&type=multiple`
    );
    const data = await response.json();
    questions = data.results;
    displayQuestion();
  } catch (error) {
    console.error("Error fetching questions:", error);
  }
}

// Display Current Question
function displayQuestion() {
  nextBtn.disabled = true;
  const question = questions[currentQuestionIndex];
  questionEl.innerHTML = question.question;

  // Randomize options
  const options = [...question.incorrect_answers, question.correct_answer].sort(
    () => Math.random() - 0.5
  );

  optionsContainer.innerHTML = "";
  options.forEach((option, index) => {
    const row = document.createElement("div");
    row.className = "option-row";

    const label = document.createElement("div");
    label.className = "option-label";
    label.textContent = optionLabels[index];

    const text = document.createElement("div");
    text.className = "option-text";
    text.textContent = option;

    row.appendChild(label);
    row.appendChild(text);
    row.onclick = () => handleAnswer(row, option);

    optionsContainer.appendChild(row);
  });

  progressEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  scoreEl.textContent = `Score: ${score}`;
}

// Handle Answer Selection
function handleAnswer(selectedRow, selectedAnswer) {
  const question = questions[currentQuestionIndex];
  const correctAnswer = question.correct_answer;

  // Highlight Correct and Incorrect Answers
  const rows = Array.from(optionsContainer.children);
  rows.forEach((row) => {
    const optionText = row.querySelector(".option-text").textContent;
    if (optionText === correctAnswer) {
      row.classList.add("correct");
    }
    if (optionText === selectedAnswer && selectedAnswer !== correctAnswer) {
      row.classList.add("incorrect");
    }
  });

  // Increment Score for Correct Answers
  if (selectedAnswer === correctAnswer) {
    score++;
  }

  // Update Score Display
  scoreEl.textContent = `Score: ${score}`;

  // Disable further clicks
  rows.forEach((row) => {
    row.onclick = null;
  });

  nextBtn.disabled = false;
}

nextBtn.addEventListener('click', async () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    await handleQuizCompletion(score, questions.length);
  }
});

// Show Result Section
function showResult() {
  quizSection.style.display = "none";
  resultSection.style.display = "block";

  const percentage = (score / questions.length) * 100;

  if (percentage === 100) {
    resultTitle.textContent = "Congratulations!";
    resultMessage.textContent = `You got all ${score} questions correct! Fantastic job!`;
  } else if (percentage >= 50) {
    resultTitle.textContent = "Well Done!";
    resultMessage.textContent = `You scored ${score} out of ${questions.length}. Keep it up!`;
  } else {
    resultTitle.textContent = "Good Try!";
    resultMessage.textContent = `You scored ${score} out of ${questions.length}. Better luck next time!`;
  }
}

// Start Quiz
function startQuiz() {
  const selectedCategory = categorySelect.value;

  // Reset and display the quiz section
  categorySection.style.display = "none";
  quizSection.style.display = "block";

  // Fetch questions based on the selected category
  fetchQuestions(selectedCategory);
}

// Reset Quiz
function resetQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  questions = [];
  questionEl.innerHTML = "";
  optionsContainer.innerHTML = "";
  progressEl.innerHTML = "";
  scoreEl.innerHTML = "";

  resultSection.style.display = "none";
  categorySection.style.display = "block";
}

function goToAnalysis() {
  // Replace with the actual URL of your analysis page
  window.location.href = "analysisQuiz.html";
}

async function logActivity(apiUsed, activityDescription) {
  try {
    const user = JSON.parse(localStorage.getItem('user')) || {}; // Get user info from localStorage
    const userId = user.id || 'unknown'; // Fallback to 'unknown' if no user ID exists

    const response = await fetch('https://braincloud.cmsa.digital/srphp/logActivity.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId, // Send user ID
        api_used: apiUsed,
        activity_description: activityDescription
      })
    });

    const data = await response.json();
    if (!data.success) {
      console.error('Failed to log activity:', data.message);
    } else {
      console.log('Activity logged successfully!');
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

async function handleQuizCompletion(score, totalQuestions) {
  const selectedCategory = categorySelect.value;  // Ensure the category is selected
  localStorage.setItem('quizResults', JSON.stringify({
    score: score,
    totalQuestions: totalQuestions,
    categoryName: selectedCategory
  }));

  const activityDescription = `Completed Quiz (${score}/${totalQuestions} Correct)`;
  const apiUsed = 'Quiz API';

  await logActivity(apiUsed, activityDescription); // Log activity to the database
  showResult(); // Display result section
}
