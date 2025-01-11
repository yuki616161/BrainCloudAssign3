document.addEventListener('DOMContentLoaded', function () {
    fetchGreeting();
});

async function fetchGreeting() {
    try {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const userId = user.id;

        if (!userId) {
            console.error('User ID not found in local storage');
            displayError('User ID is missing. Please log in.');
            return;
        }

        console.log(`Fetching greeting for user ID: ${userId}`);

        displayLoading();

        const response = await fetch(`https://braincloud.cmsa.digital/srphp/greeting.php?user_id=${userId}`);
        console.log('Fetch response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Parsed response JSON:', data);

        if (data.success) {
            displayGreeting(data.message); // Directly display the greeting message
        } else {
            displayError(data.message || 'An unknown error occurred.');
        }
    } catch (error) {
        console.error('Error during fetchGreeting:', error);
        displayError('An error occurred while loading the greeting.');
    }
}

function displayGreeting(message) {
    const greetingElement = document.getElementById('greeting-text');
    if (greetingElement) {
        greetingElement.innerText = message; // Directly display the message
    }
}

function displayError(message) {
    const greetingElement = document.getElementById('greeting-text');
    if (greetingElement) {
        greetingElement.innerText = message;
    }
}

function displayLoading() {
    const greetingElement = document.getElementById('greeting-text');
    if (greetingElement) {
        greetingElement.innerText = 'Loading...';
    }
}



// Main navigation menu toggle
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
        // Check the path of the login.html file and adjust the redirect
        window.location.href = 'login.html'; // Replace with the correct absolute path
    }
});

async function fetchWord() {
    const wordContent = document.getElementById('wordContent');
    wordContent.innerHTML = '<div class="loading">Loading word of the day...</div>';
     
    // Define a list of words
    const predefinedWords = [
        'ambrosial', 'labyrinthine', 'ineffable', 'ethereal', 'liminal', 
        'solitude', 'reverie', 'petrichor', 'euphoria', 'halcyon', 
        'nostalgia', 'sempiternal', 'resplendent', 'sonorous', 'elysian', 
        'effervescent', 'gossamer', 'mellifluous', 'paradisiacal', 'sublime', 
        'catharsis', 'aesthetic', 'enigma', 'inequable', 'diaphanous', 
        'evanescent', 'zenith', 'calliope', 'aurora', 'epiphany'
      ];
      
     const randomWord = predefinedWords[Math.floor(Math.random() * predefinedWords.length)];

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
        if (!response.ok) throw new Error('Failed to fetch word');
        const data = await response.json();
        const wordData = data[0];

        let html = `
            <div class="word-header">
                <h1 class="word-title">${wordData.word}</h1>
                ${wordData.phonetics[0]?.audio ? `
                    <button class="audio-btn" onclick="playAudio('${wordData.phonetics[0].audio}')">
                        <i class="fas fa-volume-up"></i>
                    </button>
                ` : ''}
            </div>
            ${wordData.phonetic ? `<p class="pronunciation">${wordData.phonetic}</p>` : ''}
        `;

        wordData.meanings.forEach(meaning => {
            html += `
                <div class="meaning">
                    <h3 class="part-of-speech">${meaning.partOfSpeech}</h3>
                    ${meaning.definitions.slice(0, 2).map(def => `
                        <div class="definition">
                            ${def.definition}
                            ${def.example ? `<p class="example">Example: ${def.example}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        });

        wordContent.innerHTML = html;
    } catch (error) {
        wordContent.innerHTML = `
            <div class="error">
                Sorry, we couldn't load the word of the day. Please try again later.
            </div>
        `;
    }
}

function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
}

// Fetch word when page loads
document.addEventListener('DOMContentLoaded', fetchWord);
