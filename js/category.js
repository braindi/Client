let container = document.querySelector('#container');

let categoriesArr = [];
let filteredArr = categoriesArr;
let attributesByCategory = [];
let attributesArr = [];
let attributesCategories = [];

let currentPage = 0;
const itemsPerPage = 5;

let searchInpt = document.createElement('input');

searchInpt.placeholder = 'חפש תחום.....';
searchInpt.addEventListener('input', () => {
    search(searchInpt.value);
})

container.appendChild(searchInpt);

let allCategories = document.createElement('div');
container.appendChild(allCategories);


fetch('https://localhost:7295/api/Category')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        categoriesArr = data;
        filteredArr = categoriesArr.slice();
        console.log(categoriesArr);
        displayCategories(categoriesArr);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });


fetch('https://localhost:7295/api/Attribute')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        attributesArr = data;
        console.log(attributesArr);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
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


function displayCategories(arr) {
    allCategories.innerHTML = '';
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = arr.slice(start, end);

    pageItems.forEach(item => oneCategory(item));

    addPaginationControls(arr.length);
}


function oneCategory(item) {
    let div = document.createElement('div');
    let categoryName = document.createElement('h3');
    let deleteBtn = document.createElement('button');
    let updateBtn = document.createElement('button');
    let allAttributesBtn = document.createElement('button');

    categoryName.innerHTML = item.categoryName;
    deleteBtn.innerHTML = '<span class="material-icons">delete</span>';
    updateBtn.innerHTML = '<span class="material-icons">edit</span>';
    allAttributesBtn.innerHTML = 'תכונות';

    deleteBtn.addEventListener('click', () => {
        deleteCategory(item);
    })
    updateBtn.addEventListener('click', () => {
        updateCategory(div, item);
    })
    allAttributesBtn.addEventListener('click', () => {
        getAllAttributes(item);
    })

    div.classList.add('one-category');

    let updateDeleteNameDiv = document.createElement('div');
    let updateDeleteDiv = document.createElement('div');

    updateDeleteNameDiv.classList.add('update-delete-name-div');
    updateDeleteDiv.classList.add('update-delete-div');
    allAttributesBtn.classList.add('attributes-button');
    updateDeleteDiv.appendChild(deleteBtn);
    updateDeleteDiv.appendChild(updateBtn);
    updateDeleteNameDiv.appendChild(categoryName);
    updateDeleteNameDiv.appendChild(updateDeleteDiv);


    div.appendChild(updateDeleteNameDiv);
    div.appendChild(allAttributesBtn);
    allCategories.appendChild(div);
}

function updateCategory(div, item) {

    let oldCategoty = item.categoryName;

    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    let inpt = document.createElement('input');
    inpt.classList.add('input-update');
    inpt.value = oldCategoty;
    div.appendChild(inpt);

    let saveBtn = document.createElement('button');
    saveBtn.innerHTML = 'שמירה';
    saveBtn.classList.add('save-button-update');
    div.appendChild(saveBtn);

    saveBtn.addEventListener('click', () => {

        if (inpt.value === '') {
            alert('אנא הכנס שם');
            inpt.value = oldCategoty;
        }
        else if (inpt.value == oldCategoty) {
            filteredArr = categoriesArr.slice();
            displayCategories(filteredArr);
        }
        else if (inpt.value !== oldCategoty && categoriesArr.find(c => c.categoryName === inpt.value)) {
            alert("התחום כבר קים");
            inpt.value = oldCategoty;
        }
        else {
            const encodedCategoryName = encodeURIComponent(oldCategoty);


            fetch(`https://localhost:7295/api/Category/${encodedCategoryName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inpt.value)
            })
                .then(response => {
                    console.log(response);
                    if (!response.ok) {
                        throw new Error('Failed to update category');
                    }
                    return response.json();
                })
                .then(isUpdated => {
                    console.log(isUpdated);
                    if (isUpdated) {
                        item.categoryName = inpt.value;

                        filteredArr = categoriesArr.slice();
                        displayCategories(filteredArr);
                    }
                    else {
                        alert(`לא ניתן היה לעדכן את התחום "${oldCategoty}"`);
                    }
                })
                .catch(error => {
                    console.error('Error: ', error);
                });
        }
    });
}

function deleteCategory(item) {
    const encodedCategoryName = encodeURIComponent(item.categoryName);
    const confirmationDialog = document.getElementById("confirmationDialog");
    const confirmButton = document.getElementById("confirmDelete");
    const cancelButton = document.getElementById("cancelDelete");

    confirmationDialog.style.display = "block";

    confirmButton.addEventListener('click', () => {

        confirmationDialog.style.display = "none";

        fetch(`https://localhost:7295/api/Category/${encodedCategoryName}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete category');
                }
                return response.json();
            })
            .then(isDeleted => {
                if (isDeleted) {
                    categoriesArr = categoriesArr.filter(cat => cat.categoryName !== item.categoryName);
                    filteredArr = categoriesArr.slice();
                    displayCategories(filteredArr);
                } else {
                    alert(`לא ניתן היה למחוק את הקטגוריה "${item.categoryName}"`);
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
    message.textContent = 'האם אתה בטוח שברצונך למחוק את התחום?';
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

function getAllAttributes(item) {
    attributesByCategory = [];
    let idsArr = attributesCategories.filter(ac => ac.categoryName == item.categoryName)
        .map(ac => ac.attributeName);

    attributesByCategory = attributesArr.filter(a => idsArr.includes(a.attributeName));

    createModal(item.categoryName);
    const list = document.getElementById('list');
    list.innerHTML = '';

    attributesByCategory.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q.attributeName;
        list.appendChild(li);
    });

    document.getElementById('questionsModal').style.display = 'block';
}

function createModal(categoryName) {
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
        title.textContent = categoryName;

        const list = document.createElement('ul');
        list.id = 'list';

        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(list);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);
    } else {
        document.getElementById('modalTitle').textContent = categoryName;
    }

    modal.style.display = 'block';
}

let addCategoryDiv = document.createElement('div');
let addCategory = document.createElement('h3');
let addCategoryInpt = document.createElement('input');
let addCategoryBtn = document.createElement('button');
let inptBtn = document.createElement('div');
inptBtn.classList.add('input-button');


addCategory.innerHTML = 'הוספת תחום';
addCategoryBtn.innerHTML = 'שמירה';

addCategoryBtn.addEventListener('click', () => {
    addCategoryToDB(addCategoryInpt.value);
})

inptBtn.appendChild(addCategoryInpt);
inptBtn.appendChild(addCategoryBtn);


addCategoryDiv.appendChild(addCategory);
addCategoryDiv.appendChild(inptBtn);

container.appendChild(addCategoryDiv);

addCategoryDiv.classList.add('add-category-div');

function addCategoryToDB(category) {

    let existCategory = categoriesArr.find(c => c.categoryName == addCategoryInpt.value);
if(existCategory){
    alert('תחום זה קיים');
    return;
}

addCategoryInpt.value = '';


    fetch('https://localhost:7295/api/Category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
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
            categoriesArr.push({ categoryName: category });
            filteredArr = categoriesArr.slice();
            displayCategories(filteredArr);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

function search(string) {
    let newString = changeToHebrew(string);
    filteredArr = categoriesArr.filter(category => category.categoryName.includes(newString));
    currentPage = 0;
    displayCategories(filteredArr);
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
        displayCategories(filteredArr);
    });

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = 'דף הבא';
    nextBtn.disabled = currentPage >= totalPages - 1;
    nextBtn.addEventListener('click', () => {
        currentPage++;
        displayCategories(filteredArr);
    });

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(nextBtn);
    allCategories.appendChild(paginationDiv);
}
