const chapterSelect = document.getElementById('chapterSelect');
const quizBox = document.getElementById('quizBox');
const questionBox = document.getElementById('questionBox');
const optionsList = document.getElementById('optionsList');
const timerBox = document.getElementById('timer');
const progressBox = document.getElementById('progressBox');
const currentQ = document.getElementById('currentQuestion');
const totalQ = document.getElementById('totalQuestions');
const resultBox = document.getElementById('resultBox');
const summaryList = document.getElementById('summaryList');

let questions = [];
let currentQuestionIndex = -1;
let userAnswers = [];
let timerInterval = null;
let timeLeft = 45;

chapterSelect.addEventListener('change', () => {
  const chapter = chapterSelect.value;
  if (!chapter) return;

  fetch(`api/${chapter}.json`)
    .then(res => {
      if (!res.ok) throw new Error("File not found");
      return res.json();
    })
    .then(data => {
      questions = shuffleArray(data);
      currentQuestionIndex = -1;
      userAnswers = [];
      totalQ.textContent = questions.length;
      resultBox.classList.add('hidden');
      showNextQuestion();
      quizBox.classList.remove('hidden');
      progressBox.classList.remove('hidden');
    })
    .catch(err => {
      alert('Failed to load questions!');
      console.error(err);
    });
});

function showNextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex >= questions.length) {
    showResults();
    return;
  }

  const q = questions[currentQuestionIndex];
  questionBox.textContent = `Q${currentQuestionIndex + 1}: ${q.question}`;
  optionsList.innerHTML = '';
  currentQ.textContent = currentQuestionIndex + 1;

  const shuffledOptions = shuffleArray([...q.options]);

  shuffledOptions.forEach(opt => {
    const li = document.createElement('li');
    li.textContent = opt;
    li.addEventListener('click', () => handleOptionClick(li, q.answer, q.question, opt));
    optionsList.appendChild(li);
  });

  questionBox.classList.add('fade-in');
  setTimeout(() => questionBox.classList.remove('fade-in'), 500);

  resetTimer();
}

function handleOptionClick(li, correctAnswer, questionText, selectedOption) {
  clearInterval(timerInterval); // stop timer after user answers

  const allOptions = optionsList.querySelectorAll('li');

  allOptions.forEach(option => {
    option.style.pointerEvents = 'none';
    if (option.textContent === correctAnswer) {
      option.style.backgroundColor = 'lightgreen';
    } else if (option.textContent === selectedOption) {
      option.style.backgroundColor = 'salmon';
    }
  });

  userAnswers.push({
    question: questionText,
    correct: correctAnswer,
    selected: selectedOption
  });

  setTimeout(showNextQuestion, 1000);
}

function showResults() {
  quizBox.classList.add('hidden');
  progressBox.classList.add('hidden');
  resultBox.classList.remove('hidden');

  summaryList.innerHTML = '';
  userAnswers.forEach((item, index) => {
    const isCorrect = item.correct === item.selected;
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Q${index + 1}:</strong> ${item.question}<br>
      ✅ Correct: <span style="color:lightgreen">${item.correct}</span><br>
      ${isCorrect ? "👍 Correct" : `❌ Your Answer: <span style="color:#ffb3b3">${item.selected}</span>`}
    `;
    li.style.marginBottom = "15px";
    summaryList.appendChild(li);
  });
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 45;
  timerBox.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerBox.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);

      const currentQ = questions[currentQuestionIndex];
      userAnswers.push({
        question: currentQ.question,
        correct: currentQ.answer,
        selected: "⏰ No Answer"
      });

      showNextQuestion();
    }
  }, 1000);
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
