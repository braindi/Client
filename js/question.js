let container = document.querySelector('#container');

let questionsArr = [];
let filteredArr = questionsArr;
let attributesArr = [];

let currentPage = 0;
const itemsPerPage = 5;

async function loadData() {
    try {
        const questionsResponse = await fetch('https://localhost:7295/api/Question');
        if (!questionsResponse.ok) {
            throw new Error('Network response was not ok');
        }
        questionsArr = await questionsResponse.json();
        filteredArr = questionsArr.slice();

        const attributesResponse = await fetch('https://localhost:7295/api/Attribute');
        if (!attributesResponse.ok) {
            throw new Error('Network response was not ok');
        }
        attributesArr = await attributesResponse.json();

        displayQuestions(filteredArr);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

loadData();


let searchInpt = document.createElement('input');

searchInpt.placeholder = 'חפש שאלה.....';
searchInpt.addEventListener('input', () => {
    search(searchInpt.value);
});
container.appendChild(searchInpt);


let allQuestions = document.createElement('div');
container.appendChild(allQuestions);

function displayQuestions(arr) {
    allQuestions.innerHTML = '';
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = arr.slice(start, end);

    pageItems.forEach(item => oneQuestion(item));

    addPaginationControls(arr.length);
}

function oneQuestion(item) {
    let div = document.createElement('div');
    let questionText = document.createElement('h3');
    let attribute = document.createElement('h3');
    let deleteBtn = document.createElement('button');
    let updateBtn = document.createElement('button');
    questionText.innerHTML = item.questionText;
    let attributeName = attributesArr.find(attr => attr.attributeId === item.attributeId);
    attribute.innerHTML = attributeName ? attributeName.attributeName : "לא ידוע";
    deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
    updateBtn.innerHTML = '<span class="material-icons">edit</span>';

    deleteBtn.addEventListener('click', () => {
        deleteQuestion(item)
    })

    updateBtn.addEventListener('click', () => {
        updateQuestion(div, item, attribute.innerHTML);
    })


    div.classList.add('one-question');
    div.appendChild(questionText);
    div.appendChild(attribute);
    div.appendChild(deleteBtn);
    div.appendChild(updateBtn);

    allQuestions.appendChild(div);
}

function updateQuestion(div, item, attributeNameForQuestion) {
    let oldQuestion = item.questionText;
    let oldAttribute = attributeNameForQuestion == "לא ידוע" ? "" : attributeNameForQuestion;

    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    let questionInpt = document.createElement('input');
    questionInpt.classList.add('question-input');
    questionInpt.value = oldQuestion;
    div.appendChild(questionInpt);

    let attributeInpt = document.createElement('input');
    attributeInpt.classList.add('attribute-input');
    attributeInpt.value = oldAttribute;
    div.appendChild(attributeInpt);

    let saveBtn = document.createElement('button');
    saveBtn.innerHTML = 'שמירה';
    saveBtn.classList.add('save-button-update');
    div.appendChild(saveBtn);

    saveBtn.addEventListener('click', () => {
        if (questionInpt.value === "") {
            alert("יש לכתוב את השאלה");
            questionInpt.value = oldQuestion;
            attributeInpt.value = oldAttribute;
        } else if (questionInpt.value === oldQuestion && attributeInpt.value === oldAttribute) {
            filteredArr = questionsArr.slice();
            displayQuestions(filteredArr);
        } else if (questionInpt.value !== oldQuestion && questionsArr.find(q => q.questionText === questionInpt.value)) {
            alert("שאלה זו כבר קיימת");
            questionInpt.value = oldQuestion;
        }
        else if (attributeInpt.value !== '' && !attributesArr.find(a => a.attributeName === attributeInpt.value)) {
            alert("תכונה זו לא קיימת");
            attributeInpt.value = oldAttribute;
        } else {
            const encodedQuestionText = encodeURIComponent(oldQuestion);
            const requestBody = {
                newQuestionText: questionInpt.value,
                attributeName: oldAttribute,
                newAttributeName: attributeInpt.value
            };

            fetch(`https://localhost:7295/api/Question/${encodedQuestionText}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update question');
                    }
                    return response.json();
                })
                .then(isUpdated => {
                    if (isUpdated) {
                        item.questionText = requestBody.newQuestionText;
                        item.attributeName = requestBody.newAttributeName;

                        div.innerHTML = '';

                        let questionText = document.createElement('h3');
                        questionText.innerHTML = item.questionText;
                        div.appendChild(questionText);

                        let attribute = document.createElement('h3');
                        attribute.innerHTML = item.attributeName ? item.attributeName : "לא ידוע";
                        div.appendChild(attribute);

                        let deleteBtn = document.createElement('button');
                        deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
                        let updateBtn = document.createElement('button');
                        updateBtn.innerHTML = '<span class="material-icons">edit</span>';

                        deleteBtn.addEventListener('click', () => deleteQuestion(item));
                        updateBtn.addEventListener('click', () => updateQuestion(div, item, attribute.innerHTML));

                        div.appendChild(deleteBtn);
                        div.appendChild(updateBtn);
                    } else {
                        alert(`לא ניתן היה לעדכן את השאלה "${oldQuestion}"`);
                    }
                })
                .catch(error => {
                    console.error('Error: ', error);
                });
        }
    });
}

function deleteQuestion(item) {
    const encodeQuestionText = encodeURIComponent(item.questionText);
    const confirmationDialog = document.getElementById("confirmationDialog");
    const confirmButton = document.getElementById("confirmDelete");
    const cancelButton = document.getElementById("cancelDelete");

    confirmationDialog.style.display = "block";

    confirmButton.onclick = () => {
        confirmationDialog.style.display = "none";

        fetch(`https://localhost:7295/api/Question/${encodeQuestionText}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete question');
                }
                return response.json();
            })
            .then(isDeleted => {
                if (isDeleted) {
                    questionsArr = questionsArr.filter(q => q.questionText !== item.questionText);
                    filteredArr = questionsArr.slice();
                    displayQuestions(filteredArr);
                } else {
                    alert("לא ניתן היה למחוק זאת ");
                }
            })
            .catch(error => {
                alert('Error: ' + error.message);
            });
    };

    cancelButton.onclick = () => {
        confirmationDialog.style.display = "none";
    };
}

function createConfirmationDialog() {

    const confirmationDialog = document.createElement('div');
    confirmationDialog.id = 'confirmationDialog';
    confirmationDialog.style.display = 'none';

    const message = document.createElement('p');
    message.textContent = 'האם אתה בטוח שברצונך למחוק את השאלה?';
    confirmationDialog.appendChild(message);

    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirmDelete';
    confirmButton.textContent = 'אישור';
    confirmationDialog.appendChild(confirmButton);

    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancelDelete';
    cancelButton.textContent = 'ביטול';
    confirmationDialog.appendChild(cancelButton);

    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.display = 'none';

    document.body.appendChild(confirmationDialog);
    document.body.appendChild(overlay);
}

createConfirmationDialog();

let addQuestionDiv = document.createElement('div');
let addQuestion = document.createElement('h3');
let question = document.createElement('h5');
let attribute = document.createElement('h5');
let addQuestionInpt = document.createElement('input');
let attribueName = document.createElement('input');
let addQuestionBtn = document.createElement('button');
let inptBtn = document.createElement('div');
inptBtn.classList.add('input-button');


addQuestion.innerHTML = 'הוספת שאלה + תכונה';
addQuestionBtn.innerHTML = 'שמירה';
question.innerHTML = 'שאלה';
attribute.innerHTML = 'תכונה';

addQuestionBtn.addEventListener('click', () => {
    addQuestionToDB(addQuestionInpt.value, attribueName.value);
})
inptBtn.appendChild(question);
inptBtn.appendChild(addQuestionInpt);
inptBtn.appendChild(attribute);
inptBtn.appendChild(attribueName);
inptBtn.appendChild(addQuestionBtn);


addQuestionDiv.appendChild(addQuestion);
addQuestionDiv.appendChild(inptBtn);

container.appendChild(addQuestionDiv);

addQuestionDiv.classList.add('add-question-div');

function addQuestionToDB(question, attribute) {

    const attributeId = attribute ? (attributesArr.find(attr => attr.attributeName === attribute)?.attributeId || null) : null;

    let existQuestion = questionsArr.find(q => q.questionText == question);
    if (existQuestion && existQuestion.attributeId > 0){
        alert('שאלה זו קימת במאגר עם תכונה');
        return;
    }
        const requestBody = {
            questionText: question,
            attributeName: attribute
        };

    fetch('https://localhost:7295/api/Question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 400) {
                    return response.text().then(text => { throw new Error(text); });
                } else if (response.status === 409) {
                    return response.text().then(text => { throw new Error(text); });
                }
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(message => {
            addQuestionInpt.value = '';
            attribueName.value = '';
            const existingQuestion = questionsArr.find(q => q.questionText === question);
            if (existingQuestion) {
                existingQuestion.attributeId = attributeId || 0;
            } else {
                questionsArr.push({ questionText: question, attributeId: attributeId || 0 });
            }

            filteredArr = questionsArr.slice();
            displayQuestions(filteredArr);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

function search(string) {
    let newString = changeToHebrew(string);
    filteredArr = questionsArr.filter(question => question.questionText.includes(newString));
    currentPage = 0;
    displayQuestions(filteredArr);
}

function changeToHebrew(text) {
    const keyboardMap = {
        'a': 'ש', 'b': 'נ', 'c': 'ב', 'd': 'ג', 'e': 'ק', 'f': 'כ', 'g': 'ע', 'h': 'י',
        'i': 'ן', 'j': 'ח', 'k': 'ל', 'l': 'ך', 'm': 'צ', 'n': 'מ', 'o': 'ם', 'p': 'פ',
        'q': '/', 'r': 'ר', 's': 'ד', 't': 'א', 'u': 'ו', 'v': 'ה', 'w': "'", 'x': 'ס',
        'y': 'ט', 'z': 'ז',
        ',': 'ת', '.': 'ץ', '/': '.',
        ';': 'ף', "'": ',', "[": "]", "]": "["
    };

    let hebrewText = '';
    for (let char of text) {
        hebrewText += keyboardMap[char.toLowerCase()] || char;
    }
    return hebrewText;
}

function addPaginationControls(totalItems) {
    const paginationDiv = document.createElement('div');
    paginationDiv.classList.add('pagination');

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = 'דף קודם';
    prevBtn.disabled = currentPage === 0;
    prevBtn.addEventListener('click', () => {
        currentPage--;
        displayQuestions(filteredArr);
    });

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = 'דף הבא';
    nextBtn.disabled = currentPage >= totalPages - 1;
    nextBtn.addEventListener('click', () => {
        currentPage++;
        displayQuestions(filteredArr);
    });

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(nextBtn);
    allQuestions.appendChild(paginationDiv);
}