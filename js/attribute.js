let container = document.querySelector('#container');

let attributesArray = [];
let categoriesArr = [];
let categoriesByAttribute = [];
let questionsArr = [];
let questionsByAttribute = [];
let attributesCategories = [];
let filteredArr = attributesArray;

let currentPage = 0;
const itemsPerPage = 5;

let searchInpt = document.createElement('input');

searchInpt.placeholder = 'חפש תכונה.....';
searchInpt.addEventListener('input', () => {
    search(searchInpt.value);
})

container.appendChild(searchInpt);

let allAttributes = document.createElement('div');

container.appendChild(allAttributes);


fetch('https://localhost:7295/api/Attribute')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        attributesArray = data;
        filteredArr = attributesArray.slice();
        console.log(attributesArray);
        displayAttributes(attributesArray)
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });

fetch('https://localhost:7295/api/Category')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        categoriesArr = data;
        console.log(categoriesArr);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });


fetch('https://localhost:7295/api/AttributeCategory')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        attributesCategories = data;
        console.log(attributesCategories);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });



fetch('https://localhost:7295/api/Question')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        questionsArr = data;
        console.log(questionsArr);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });


function displayAttributes(array) {
    allAttributes.innerHTML = '';
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = array.slice(start, end);

    pageItems.forEach(item => oneAttribute(item));

    addPaginationControls(array.length);
}

function oneAttribute(item) {
    let div = document.createElement('div');
    let attributeName = document.createElement('h3');
    let deleteBtn = document.createElement('button');
    let updateBtn = document.createElement('button');
    let allCategoriesBtn = document.createElement('button');
    let allQuestionsBtn = document.createElement('button');

    div.classList.add('one-attribute');

    attributeName.innerHTML = item.attributeName;
    deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
    updateBtn.innerHTML = '<span class="material-icons">edit</span>';
    allCategoriesBtn.innerHTML = 'תחומים';
    allQuestionsBtn.innerHTML = 'שאלות';

    let updateDeleteNameDiv = document.createElement('div');
    let updateDeleteDiv = document.createElement('div');
    let categoriesQuestionsDiv = document.createElement('div');

    updateDeleteNameDiv.classList.add('update-delete-name-div');
    updateDeleteDiv.classList.add('update-delete-div');
    categoriesQuestionsDiv.classList.add('categories-questions-div');

    updateDeleteDiv.appendChild(deleteBtn);
    updateDeleteDiv.appendChild(updateBtn);
    updateDeleteNameDiv.appendChild(attributeName);
    updateDeleteNameDiv.appendChild(updateDeleteDiv);

    categoriesQuestionsDiv.appendChild(allCategoriesBtn);
    categoriesQuestionsDiv.appendChild(allQuestionsBtn);

    div.appendChild(updateDeleteNameDiv);
    div.appendChild(categoriesQuestionsDiv);

    deleteBtn.addEventListener('click', () => {
        deleteAttribute(item);
    });

    updateBtn.addEventListener('click', () => {
        updateAttribute(div, item)
    });

    allCategoriesBtn.addEventListener('click', () => {
        getAllCategories(item);
    });

    allQuestionsBtn.addEventListener('click', () => {
        getAllQuestions(item);
    });

    allAttributes.appendChild(div);
}

function updateAttribute(div, item) {
    let oldAttribute = item.attributeName;

    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    let inpt = document.createElement('input');
    inpt.classList.add('input-update');
    inpt.value = oldAttribute;
    div.appendChild(inpt);

    let saveBtn = document.createElement('button');
    saveBtn.innerHTML = 'שמירה';
    saveBtn.classList.add('save-button-update');
    div.appendChild(saveBtn);

    saveBtn.addEventListener('click', () => {
        if (inpt.value === '') {
            alert('אנא הכנס שם');
            inpt.value = oldAttribute;

        }
        else if (inpt.value == oldAttribute) {
            filteredArr = attributesArray.slice();
            displayAttributes(filteredArr);
        }
        else if (inpt.value !== oldAttribute && attributesArray.find(c => c.attributeName === inpt.value)) {
            alert("התכונה כבר קיימת.");
            inpt.value = oldAttribute;
        }
        else {
            const encodedAttributeName = encodeURIComponent(oldAttribute);

            fetch(`https://localhost:7295/api/Attribute/${encodedAttributeName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inpt.value)
            })
                .then(response => {
                    console.log(response);
                    if (!response.ok) {
                        throw new Error('Failed to update attribute');
                    }
                    return response.json();
                })
                .then(isUpdated => {
                    console.log(isUpdated);
                    if (isUpdated) {
                        item.attributeName = inpt.value;

                        filteredArr = attributesArray.slice();
                        displayAttributes(filteredArr);
                    }
                    else {
                        alert(`לא ניתן היה לעדכן את התכונה "${oldAttribute}"`);
                    }
                })
                .catch(error => {
                    console.error('Error: ', error);
                });
        }
    });
}

function deleteAttribute(item) {
    const encodedAttributeName = encodeURIComponent(item.attributeName);
    const confirmationDialog = document.getElementById("confirmationDialog");
    const confirmButton = document.getElementById("confirmDelete");
    const cancelButton = document.getElementById("cancelDelete");


    confirmationDialog.style.display = "block";
    confirmButton.addEventListener('click', () => {
        confirmationDialog.style.display = "none";

        fetch(`https://localhost:7295/api/Attribute/${encodedAttributeName}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete attribute');
                }
                return response.json();
            })
            .then(isDeleted => {
                if (isDeleted) {
                    attributesArray = attributesArray.filter(attr => attr.attributeName !== item.attributeName);
                    filteredArr = attributesArray.slice();
                    displayAttributes(filteredArr);
                } else {
                    alert(`לא ניתן היה למחוק את התכונה "${item.attributeName}"`);
                }
            })
            .catch(error => {
                alert('Error: ' + error.message);
            });
    })

    cancelButton.addEventListener('click', () => {
        confirmationDialog.style.display = "none";
    });
}

function createConfirmationDialog() {
    const confirmationDialog = document.createElement('div');
    confirmationDialog.id = 'confirmationDialog';
    confirmationDialog.style.display = 'none';

    const message = document.createElement('p');
    message.textContent = 'האם אתה בטוח שברצונך למחוק את התכונה?';
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

function getAllCategories(item) {
    categoriesByAttribute = [];
    console.log(attributesCategories)
    let idsArr = attributesCategories.filter(ac => ac.attributeName == item.attributeName)
        .map(ac => ac.categoryName)

    categoriesByAttribute = categoriesArr.filter(c => idsArr.includes(c.categoryName));

    createModal(item.attributeName);

    const list = document.getElementById('list');
    list.innerHTML = '';

    categoriesByAttribute.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q.categoryName;
        list.appendChild(li);
    });

    document.getElementById('questionsModal').style.display = 'block';


}

function getAllQuestions(item) {

    questionsByAttribute = [];
    for (let i = 0; i < questionsArr.length; i++) {
        if (questionsArr[i].attributeId == item.attributeId) {
            questionsByAttribute.push(questionsArr[i]);
        }
    }
    console.log(questionsByAttribute);

    createModal(item.attributeName);

    const list = document.getElementById('list');
    list.innerHTML = '';


    questionsByAttribute.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q.questionText;
        list.appendChild(li);
    });

    document.getElementById('questionsModal').style.display = 'block';
}

function createModal(attributeName) {
    let modal = document.getElementById('questionsModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'questionsModal';
        modal.className = 'modal';
        modal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.maxHeight = '400px';
        modalContent.style.overflowY = 'auto';


        const closeButton = document.createElement('span');
        closeButton.className = 'close';
        closeButton.style.cursor = 'pointer';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        })

        const title = document.createElement('h2');
        title.id = 'modalTitle';
        title.textContent = attributeName;

        const list = document.createElement('ul');
        list.id = 'list';

        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(list);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);
    } else {

        document.getElementById('modalTitle').textContent = attributeName;
    }

    modal.style.display = 'block';
}

let addAttributeDiv = document.createElement('div');
let addAttribute = document.createElement('h3');
let addAttributeInpt = document.createElement('input');
let addAttributeBtn = document.createElement('button');
let inptBtn = document.createElement('div');
inptBtn.classList.add('input-button');


addAttribute.innerHTML = 'הוספת תכונה';
addAttributeBtn.innerHTML = 'שמירה';

addAttributeBtn.addEventListener('click', () => {
    addAttributeToDB(addAttributeInpt.value);
})

inptBtn.appendChild(addAttributeInpt);
inptBtn.appendChild(addAttributeBtn);


addAttributeDiv.appendChild(addAttribute);
addAttributeDiv.appendChild(inptBtn);

container.appendChild(addAttributeDiv);

addAttributeDiv.classList.add('add-attribute-div');

function addAttributeToDB(attribute) {

    let existAttribute = attributesArray.find(a => a.attributeName ==addAttributeInpt.value)
    if(existAttribute){
        alert("תכונה זו קיימת");
        return;
    }
    addAttributeInpt.value = '';

    fetch('https://localhost:7295/api/Attribute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(attribute)
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
            attributesArray.push({ attributeName: attribute });
            filteredArr = attributesArray.slice();
            displayAttributes(filteredArr);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

function search(string) {
    let newString = changeToHebrew(string);
    filteredArr = attributesArray.filter(attribute => attribute.attributeName.includes(newString));
    currentPage = 0;
    displayAttributes(filteredArr);
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
        displayAttributes(filteredArr);
    });

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = 'דף הבא';
    nextBtn.disabled = currentPage >= totalPages - 1;
    nextBtn.addEventListener('click', () => {
        currentPage++;
        displayAttributes(filteredArr);
    });

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(nextBtn);
    allAttributes.appendChild(paginationDiv);
}
