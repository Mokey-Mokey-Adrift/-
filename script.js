// ========== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ==========
let questions = [];              // массив вопросов
let currentIndex = 0;            // текущий вопрос
let score = 0;                   // количество правильных ответов

// DOM-элементы
const fileInput = document.getElementById('fileInput');
const fileNameSpan = document.getElementById('fileName');
const quizArea = document.getElementById('quizArea');
const resultArea = document.getElementById('resultArea');
const addForm = document.getElementById('addForm');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const nextBtn = document.getElementById('nextBtn');
const questionCounter = document.getElementById('questionCounter');
const scoreDisplay = document.getElementById('scoreDisplay');
const feedback = document.getElementById('feedbackMessage');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const addQuestionBtn = document.getElementById('addQuestionBtn');
const formError = document.getElementById('formError');

// Поля формы
const newQuestion = document.getElementById('newQuestion');
const opt1 = document.getElementById('opt1');
const opt2 = document.getElementById('opt2');
const opt3 = document.getElementById('opt3');
const opt4 = document.getElementById('opt4');
const correctRadio = document.querySelectorAll('input[name="correctOpt"]');

// ЗАГРУЗКА ИЗ JSON-ФАЙЛА 
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameSpan.textContent = file.name;
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            // Проверка на заполненость полей масива
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Файл должен содержать непустой массив вопросов');
            }
            questions = data;
            currentIndex = 0;
            score = 0;
            quizArea.style.display = 'block';
            resultArea.style.display = 'none';
            renderQuestion();
            updateScore();
        } catch (error) {
            alert('Ошибка чтения файла: ' + error.message);
        }
    };
    reader.readAsText(file);
});

// ОТРИСОВКА ТЕКУЩЕГО ВОПРОСА
function renderQuestion() {
    if (questions.length === 0) return;

    const q = questions[currentIndex];
    questionText.textContent = q.question;
    questionCounter.textContent = `Вопрос ${currentIndex + 1} из ${questions.length}`;

    // Создаём кнопки для вариантов ответов
    optionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = `${idx + 1}. ${opt}`;
        btn.dataset.index = idx;
        btn.addEventListener('click', () => checkAnswer(idx));
        optionsContainer.appendChild(btn);
    });

    // Активируем кнопки убираем подсветку
    nextBtn.disabled = true;
    feedback.textContent = '';
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = false;
    });
}

//ПРОВЕРКА ОТВЕТА
function checkAnswer(selectedIdx) {
    const q = questions[currentIndex];
    const correctIdx = q.correctAnswer;
    const allBtns = document.querySelectorAll('.option-btn');

    // Блокируем все кнопки и подсвечиваем
    allBtns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIdx) {
            btn.classList.add('correct');
        } else if (idx === selectedIdx && idx !== correctIdx) {
            btn.classList.add('incorrect');
        }
    });

    // Увеличиваем счёт, если ответ верный
    if (selectedIdx === correctIdx) {
        score++;
        feedback.textContent = 'Правильно!';
        feedback.style.color = 'green';
    } else {
        feedback.textContent = `Неправильно. Правильный ответ: ${q.options[correctIdx]}`;
        feedback.style.color = 'red';
    }

    updateScore();
    nextBtn.disabled = false;
}

// СЛЕДУЮЩИЙ ВОПРОС 
nextBtn.addEventListener('click', () => {
    if (currentIndex + 1 < questions.length) {
        currentIndex++;
        renderQuestion();
    } else {
        // Викторина окончена
        quizArea.style.display = 'none';
        resultArea.style.display = 'block';
        finalScore.textContent = `Вы набрали ${score} из ${questions.length} очков.`;
    }
});

// ОБНОВЛЕНИЕ СЧЁТЧИКА ОЧКОВ
function updateScore() {
    scoreDisplay.textContent = `Очки: ${score}`;
}

// ПЕРЕЗАПУСК ВИКТОРИНЫ 
restartBtn.addEventListener('click', () => {
    currentIndex = 0;
    score = 0;
    quizArea.style.display = 'block';
    resultArea.style.display = 'none';
    renderQuestion();
    updateScore();
});

// ПОКАЗ / СКРЫТИЕ ФОРМЫ ДОБАВЛЕНИЯ =
toggleFormBtn.addEventListener('click', () => {
    if (addForm.style.display === 'none' || addForm.style.display === '') {
        addForm.style.display = 'block';
        toggleFormBtn.textContent = '✖ Скрыть форму';
    } else {
        addForm.style.display = 'none';
        toggleFormBtn.textContent = 'Добавить новый вопрос';
    }
});

// ДОБАВЛЕНИЕ НОВОГО ВОПРОСА 
addQuestionBtn.addEventListener('click', () => {
    // Считываем значения
    const question = newQuestion.value.trim();
    const option1 = opt1.value.trim();
    const option2 = opt2.value.trim();
    const option3 = opt3.value.trim();
    const option4 = opt4.value.trim();

    // Получаем выбранный радио-индекс
    let correct = 0;
    for (let i = 0; i < correctRadio.length; i++) {
        if (correctRadio[i].checked) {
            correct = i;
            break;
        }
    }

    // Валидация: все поля должны быть заполнены
    if (!question || !option1 || !option2 || !option3 || !option4) {
        formError.textContent = 'Заполните все поля!';
        return;
    }

    // Создаём объект вопроса
    const newQ = {
        question: question,
        options: [option1, option2, option3, option4],
        correctAnswer: correct
    };

    // Добавляем в массив
    questions.push(newQ);

    // Очищаем форму
    newQuestion.value = '';
    opt1.value = '';
    opt2.value = '';
    opt3.value = '';
    opt4.value = '';
    formError.textContent = 'Вопрос добавлен!';
    formError.style.color = 'green';

    if (questions.length === 1 && quizArea.style.display !== 'block') {
        quizArea.style.display = 'block';
        renderQuestion();
        updateScore();
    }

    // Обновляем счётчик вопросов в заголовке, если викторина активна
    if (quizArea.style.display === 'block' && !resultArea.style.display === 'block') {
        questionCounter.textContent = `Вопрос ${currentIndex + 1} из ${questions.length}`;
    }
});