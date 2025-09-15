// --- DOM Elements (Same as before) ---
// --- DOM Elements ---
const setupView = document.getElementById('setup-view');
const quizView = document.getElementById('quiz-view');
const resultsView = document.getElementById('results-view');

const quizSetupForm = document.getElementById('quiz-setup-form'); // This is the likely missing/incorrect line
const startBtn = document.getElementById('start-btn');

const questionCounter = document.getElementById('question-counter');
const scoreDisplay = document.getElementById('score-display');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');

const finalScore = document.getElementById('final-score');
// ... (all other element selections are the same)
const playAgainBtn = document.getElementById('play-again-btn');

// --- State Variables ---
let score = 0;
let currentQuestionIndex = 0; // This is the missing or incorrect line
let quizQuestions = [];

// --- Event Listeners (Same as before) ---
quizSetupForm.addEventListener('submit', startQuiz);
// ... (playAgainBtn listener is the same)


// --- UPDATED FUNCTION ---
/**
 * This function now makes a REAL API call to our Flask backend.
 */
async function fetchQuizQuestions(disasterType, standard, age) {
    console.log(`Fetching questions for: ${disasterType}, ${standard}, ${age}`);
    try {
        // The fetch URL is '/generate-quiz', which matches the route in app.py
        const response = await fetch('/generate-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Send the user's preferences in the request body
            body: JSON.stringify({
                disaster_type: disasterType,
                standard: standard,
                age: parseInt(age) // Ensure age is an integer
            }),
        });

        if (!response.ok) {
            // If the server responds with an error, show it
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }
        
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert(`Error fetching quiz: ${error.message}`);
        return null; // Return null on error
    }
}

// --- All other JavaScript functions are the same ---
// startQuiz, displayQuestion, handleOptionClick, updateScoreDisplay, showResults
// DO NOT CHANGE the other functions. They will work perfectly with the real data.

async function startQuiz(event) {
    event.preventDefault(); // Prevent form from submitting normally
    const disasterType = document.getElementById('disaster-type').value;
    const standard = document.getElementById('standard').value;
    const age = document.getElementById('age').value;

    startBtn.textContent = 'Loading Quiz...';
    startBtn.disabled = true;

    quizQuestions = await fetchQuizQuestions(disasterType, standard, age);
    
    startBtn.textContent = 'Start Quiz';
    startBtn.disabled = false;
    
    if (quizQuestions && quizQuestions.length > 0) {
        setupView.classList.add('hidden');
        quizView.classList.remove('hidden');
        updateScoreDisplay();
        displayQuestion();
    }
    // Error is now handled inside fetchQuizQuestions with an alert
}


function displayQuestion() {
    optionsContainer.innerHTML = '';
    feedback.textContent = '';
    feedback.className = '';
    const question = quizQuestions[currentQuestionIndex];
    questionText.textContent = question.question_text;
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    for (const key in question.options) {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = `${key}: ${question.options[key]}`;
        button.dataset.option = key;
        button.addEventListener('click', handleOptionClick);
        optionsContainer.appendChild(button);
    }
}

function handleOptionClick(event) {
    const selectedOption = event.target.dataset.option;
    const correctAnswer = quizQuestions[currentQuestionIndex].correct_answer;
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.option === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    if (selectedOption === correctAnswer) {
        score += 100;
        feedback.textContent = 'Correct! 🎉';
        feedback.classList.add('correct');
    } else {
        feedback.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
        feedback.classList.add('wrong');
        event.target.classList.add('wrong');
    }
    updateScoreDisplay();
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizQuestions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }, 2000);
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function showResults() {
    quizView.classList.add('hidden');
    resultsView.classList.remove('hidden');
    finalScore.textContent = `Your final score is: ${score} out of ${quizQuestions.length * 100}`;
}