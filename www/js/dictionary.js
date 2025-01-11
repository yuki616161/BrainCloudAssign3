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

// Dictionary Functions
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        searchWord();
    }
}

async function searchWord() {
    const wordInput = document.getElementById('wordInput');
    const word = wordInput.value.trim();
    const resultDiv = document.getElementById('result');

    if (!word) {
        resultDiv.innerHTML = '<div class="error">Please type a word to search!</div>';
        return;
    }

    resultDiv.innerHTML = `        
        <div class="loading">
            Looking up the word... 
            <div class="loading-animation">
                <dotlottie-player 
                    src="https://lottie.host/3b66d56b-bc1e-4e4c-ab4d-14f9e536d4aa/3Uqw2XRCrU.lottie" 
                    background="transparent" 
                    speed="1" 
                    style="width: 150px; height: 150px" 
                    loop 
                    autoplay>
                </dotlottie-player>
            </div>
        </div>`;

    try {
        const wordData = await fetchWordData(word);

        if (!wordData || wordData.length === 0) {
            throw new Error('Word not found in dictionary');
        }

        const { word: foundWord, meanings } = wordData[0];

        let output = `
            <div class="word-header">
                <h2>${foundWord}</h2>
            </div>`;

        meanings.forEach((meaning) => {
            output += `<div class="part-of-speech">📖 ${meaning.partOfSpeech}</div>`;
            meaning.definitions.forEach(def => {
                output += `
                    <div class="definition">
                        <p>• ${def.definition}</p>
                        ${def.example ? `<div class="example">✏️ Example: "${def.example}"</div>` : ''}
                        ${def.synonyms?.length > 0 ? `<p class="synonyms">Similar words: ${def.synonyms.join(', ')}</p>` : ''}
                        ${def.antonyms?.length > 0 ? `<p class="antonyms">Opposite words: ${def.antonyms.join(', ')}</p>` : ''}
                    </div>`;
            });
        });

        resultDiv.innerHTML = output;
        wordInput.value = ''; // Clear the input field

        // Log activity
        await logActivity('Dictionary API', `Searched for the word "${word}"`);
    } catch (error) {
        console.error('Error:', error.message || error);
        resultDiv.innerHTML = `<div class="error">Oops! The word "${word}" was not found. Try another one! 🤔</div>`;
        wordInput.value = ''; // Clear the input field
    }
}

async function fetchWordData(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
        throw new Error('Word not found in dictionary');
    }
    return response.json();
}

async function logActivity(apiName, description) {
    try {
        const user = JSON.parse(localStorage.getItem('user')); // Get user info from localStorage
        const userId = user?.id || 'unknown'; // Use 'unknown' if no user ID is available

        const response = await fetch('https://braincloud.cmsa.digital/srphp/logActivity.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                api_used: apiName,
                activity_description: description,
            }),
        });

        const data = await response.json();
        if (!data.success) {
            console.error('Failed to log activity:', data.message);
        }
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Fetch and display user activities
async function fetchUserActivities() {
    try {
        const user = JSON.parse(localStorage.getItem('user')); // Get user info from localStorage
        const userId = user?.id || 'unknown'; // Use 'unknown' if no user ID is available

        const response = await fetch(`https://braincloud.cmsa.digital/srphp/fetchActivities.php?user_id=${userId}`);
        const data = await response.json();

        if (data.success) {
            const tableBody = document.getElementById('activities-body');
            tableBody.innerHTML = data.activities.map(activity => `
                <tr>
                    <td>${activity.activity_id}</td>
                    <td>${activity.api_name}</td>
                    <td>${activity.action_description}</td>
                    <td>${new Date(activity.activity_date).toLocaleString()}</td>
                </tr>
            `).join('');
        } else {
            console.error('Failed to fetch activities:', data.message);
        }
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
}

// Initialize activities on page load
document.addEventListener('DOMContentLoaded', fetchUserActivities);
