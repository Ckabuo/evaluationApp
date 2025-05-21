// quiz.ts
interface Question {
    _id: string;
    type: 'checkbox' | 'radio';
    text: string;
    options: string[];
}

// Get question from the backend to render the view
let questions: Question[] = <%- JSON.stringify(questions) %>;

// Get DOM elements
const quizContainer = document.getElementById('quiz-container');
const submitButton = document.getElementById('submit-quiz');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const navigationContainer = document.querySelector('.Navigation-section');
const timerDisplay = document.getElementById("time");
const submitButtonContainer = document.querySelector(".Submit-button");


let currentQuestionIndex = 0;
let userAnswers: { [questionId: string]: string | string[] } = {};
let timerInterval: NodeJS.Timeout | null = null;
let timeRemaining = 0;
let answeredQuestions: Set<number> = new Set();


// Function to render the current question
function renderQuestion() {
    const questionPages = document.querySelectorAll('.question');
    questionPages.forEach((page, index) => {
        page.classList.toggle('hidden', index !== currentQuestionIndex);
    });

    // Update navigation buttons
    const navButtons = navigationContainer.querySelectorAll('button');
    navButtons.forEach((button, index) => {
        button.classList.remove('active');
        if (index === currentQuestionIndex) {
            button.classList.add('active');
        }
    });

    if (currentQuestionIndex >= questions.length) {
        submitButtonContainer.classList.remove("hidden");
        prevButton.classList.add("hidden");
        nextButton.classList.add("hidden");
    }
    else {
        submitButtonContainer.classList.add("hidden");
        prevButton.classList.remove("hidden");
        nextButton.classList.remove("hidden");
    }
    loadAnswer();
}

// Function to save the user's answer
function saveAnswer() {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === 'checkbox') {
        const selectedOptions: string[] = [];
        const checkboxes = document.querySelectorAll(`input[name="question-${currentQuestionIndex}"]:checked`);
        checkboxes.forEach((checkbox: any) => {
            selectedOptions.push(checkbox.value);
        });
        userAnswers[currentQuestion._id] = selectedOptions;
    } else if (currentQuestion.type === 'radio') {
        const selectedOption = document.querySelector(`input[name="question-${currentQuestionIndex}"]:checked`);
        if (selectedOption) {
            userAnswers[currentQuestion._id] = (selectedOption as HTMLInputElement).value;
        }
    }
    answeredQuestions.add(currentQuestionIndex);
    updateNavigationButtons();
}

function loadAnswer() {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === "checkbox") {
        const selectedOptions: string[] = userAnswers[currentQuestion._id] as string[] || [];
        const checkboxes = document.querySelectorAll(
            `input[name="question-${currentQuestionIndex}"]`
        );
        checkboxes.forEach((checkbox: any) => {
            checkbox.checked = selectedOptions.includes(checkbox.value);
        });
    } else if (currentQuestion.type === "radio") {
        const selectedOption: string = userAnswers[currentQuestion._id] as string;
        const radioButtons = document.querySelectorAll(
            `input[name="question-${currentQuestionIndex}"]`
        );
        radioButtons.forEach((radioButton: any) => {
            radioButton.checked = radioButton.value === selectedOption;
        });
    }
}

function updateNavigationButtons() {
    const navButtons = navigationContainer.querySelectorAll('button');
    navButtons.forEach((button, index) => {
        if (answeredQuestions.has(index)) {
            button.style.backgroundColor = 'rgba(0, 0, 255, 0.9)';
            button.style.color = 'white';
        } else {
            button.style.backgroundColor = 'lightgrey';
            button.style.color = 'black';
        }
    });
}

// Function to start the timer
function startTimer(duration: number) {
    timeRemaining = duration;
    if (timerInterval) {
        clearInterval(timerInterval); // Clear any existing timer
    }

    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
            clearInterval(timerInterval!);
            submitQuiz();
        }
    }, 1000);
}

// Function to fetch questions from the server and initialize the quiz
function fetchQuestions() {
    fetch('/quiz/questions') //  Use the correct route
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            // Add a type property to each question, default to checkbox, set first question to radio.
            questions.forEach((question, index) => {
                question.type = "checkbox"; // Default type
                if (index === 15) { // index 15 is question 16
                    question.type = "radio";
                }
            });
            renderQuestion(); // Render the first question
            startTimer(60 * 30);
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            // Handle error (e.g., display a message to the user)
            quizContainer.innerHTML = `<p>Failed to load quiz questions: ${error.message}</p>`;
        });
}

// Function to submit the quiz
function submitQuiz() {
    saveAnswer();
    if (timerInterval)
        clearInterval(timerInterval);

    const answersArray = Object.entries(userAnswers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
    }));

    fetch('/quiz/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            applicantId: '65d8f7cb17498778b4171784', // Replace with actual applicant ID
            answers: answersArray,
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            // Display the score
            quizContainer.innerHTML = `<p>Your score: ${result.score}</p>`;
            //  Redirect to a score page
            // window.location.href = '/score';
        })
        .catch(error => {
            console.error('Error submitting quiz:', error);
            quizContainer.innerHTML = `<p>Failed to submit quiz: ${error.message}</p>`;
        });
}

// Event Listeners
if (prevButton) {
    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            saveAnswer();
            currentQuestionIndex--;
            renderQuestion();
        }
    });
}

if (nextButton) {
    nextButton.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length) {
            saveAnswer();
            currentQuestionIndex++;
            renderQuestion();
        }
    });
}

navigationContainer.addEventListener('click', (event) => {
    const clickedButton = event.target as HTMLButtonElement;
    if (clickedButton.tagName === 'BUTTON') {
        const questionIndex = parseInt(clickedButton.dataset.questionIndex!, 10);
        if (!isNaN(questionIndex)) {
            saveAnswer();
            currentQuestionIndex = questionIndex;
            renderQuestion();
        }
    }
});

if (submitButton) {
    submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        submitQuiz();
    });
}

// Initialize the quiz
fetchQuestions();