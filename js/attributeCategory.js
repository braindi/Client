let container = document.querySelector('#container');

let attributesCategoriesArr = [];
let filteredArr = attributesCategoriesArr;
let attributesArray = [];
let categoriesArr = [];
let currentPage = 0;
const itemsPerPage = 5;

let searchInpt = document.createElement('input');

searchInpt.placeholder = 'חפש תחום.....';
searchInpt.addEventListener('input', () => {
    search(searchInpt.value);
})

container.appendChild(searchInpt);

let allAttributesCategories = document.createElement('div');

container.appendChild(allAttributesCategories);


fetch('https://localhost:7295/api/AttributeCategory')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        attributesCategoriesArr = data;
        filteredArr = attributesCategoriesArr.slice();
        console.log(attributesCategoriesArr);
        displayAttributesCategories(attributesCategoriesArr)
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });


fetch('https://localhost:7295/api/Attribute')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        attributesArray = data;
        console.log(attributesArray);

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



function displayAttributesCategories(arr) {

    allAttributesCategories.innerHTML = '';
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = arr.slice(start, end);
    pageItems.forEach(item => oneAttributeCategory(item));

    addPaginationControls(arr.length);
}

function oneAttributeCategory(item) {
    let div = document.createElement('div');
    let attributeName = document.createElement('h3');
    let categoryName = document.createElement('h3');
    let isUnique = document.createElement('h3');
    let deleteBtn = document.createElement('button');

    div.classList.add('one-attribute-category');

    attributeName.innerHTML = item.attributeName;
    categoryName.innerHTML = item.categoryName;
    isUnique.innerHTML = item.isUnique;
    deleteBtn.innerHTML = '<span class="material-icons">delete</span>';

    deleteBtn.addEventListener('click', () => {
        deleteAttributeCategory(item)
    })

    div.appendChild(attributeName);
    div.appendChild(categoryName);
    div.appendChild(isUnique);
    div.appendChild(deleteBtn);

    allAttributesCategories.appendChild(div);


}


function deleteAttributeCategory(item) {

    const encodedAttributeName = encodeURIComponent(item.attributeName);
    const encodedCategoryName = encodeURIComponent(item.categoryName);

    const confirmationDialog = document.getElementById("confirmationDialog");
    const confirmButton = document.getElementById("confirmDelete");
    const cancelButton = document.getElementById("cancelDelete");

    confirmationDialog.style.display = "block";

    confirmButton.addEventListener('click', () => {

        confirmationDialog.style.display = "none";
        fetch(`https://localhost:7295/api/AttributeCategory?attributeName=${encodedAttributeName}&categoryName=${encodedCategoryName}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete attribute-category');
                }
                return response.json();
            })
            .then(isDeleted => {
                if (isDeleted) {
                    attributesCategoriesArr = attributesCategoriesArr.filter(ac => ac.attributeName !== item.attributeName && ac.categoryName !== item.categoryName);

                    filteredArr = attributesCategoriesArr.slice();
                    displayAttributesCategories(filteredArr);
                } else {
                    alert("לא ניתן היה למחוק זאת ");
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
    message.textContent = 'האם אתה בטוח שברצונך למחוק את החיבור של התכונה והתחום?';
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

let addAttributeCategoryDiv = document.createElement('div');
let addAttributeCategory = document.createElement('h3');

let attributeInpt = document.createElement('input');
let attributeH2 = document.createElement('h2');

let categoryInpt = document.createElement('input');
let categoryH2 = document.createElement('h2');

let isUniqueInpt = document.createElement('input');
let isUniqueH2 = document.createElement('h2');

isUniqueInpt.type = 'checkbox';

attributeH2.innerHTML = 'תכונה';
categoryH2.innerHTML = 'תחום';
isUniqueH2.innerHTML = 'האם יחודי?';

let isUniqeDiv = document.createElement('div');
isUniqeDiv.classList.add('is-uniqe-div');
isUniqeDiv.appendChild(isUniqueH2);
isUniqeDiv.appendChild(isUniqueInpt);

let addAttributeCategoryBtn = document.createElement('button');
let inptBtn = document.createElement('div');
inptBtn.classList.add('input-button');


addAttributeCategory.innerHTML = 'הוספת תכונה - תחום';
addAttributeCategoryBtn.innerHTML = 'שמירה';

addAttributeCategoryBtn.addEventListener('click', () => {
    addAttributeCategotyToDB(attributeInpt.value, categoryInpt.value)
})

inptBtn.appendChild(attributeH2);
inptBtn.appendChild(attributeInpt);
inptBtn.appendChild(categoryH2);
inptBtn.appendChild(categoryInpt);

inptBtn.appendChild(isUniqeDiv);
inptBtn.appendChild(addAttributeCategoryBtn);


addAttributeCategoryDiv.appendChild(addAttributeCategory);
addAttributeCategoryDiv.appendChild(inptBtn);

container.appendChild(addAttributeCategoryDiv);

function addAttributeCategotyToDB(attributeNameValue, categoryNameValue) {

    if (attributeNameValue == '' || categoryNameValue == '') {
        alert('יש למלא את השדות');
        return;
    }
    const requestBody = {
        attributeName: attributeNameValue,
        categoryName: categoryNameValue,
        isUnique: isUniqueInpt.checked ? 1 : 0
    };

    const existingAttributeCategory = attributesCategoriesArr.find(ac => ac.attributeName == attributeNameValue && ac.categoryName == categoryNameValue);

    if (existingAttributeCategory) {
        alert('התחום -תכונה האלו כבר קיימים');
        return;
    }

    const existingAttribute = attributesArray.find(a => a.attributeName == attributeNameValue);
    if (existingAttribute == null) {
        alert('התכונה לא קיימת במאגר');
        return;
    }
    const existingCategory = categoriesArr.find(c => c.categoryName == categoryNameValue);
    if (existingCategory == null) {
        alert('התחום  לא קיים במאגר');
        return;
    }
    const encodedAttributeName = encodeURIComponent(attributeNameValue);
    const encodedCategoryName = encodeURIComponent(categoryNameValue);
    const encodedIsUnique = encodeURIComponent(requestBody.isUnique);



    fetch(`https://localhost:7295/api/AttributeCategory?attributeName=${encodedAttributeName}&categoryName=${encodedCategoryName}&isUnique=${encodedIsUnique}`, {
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
            attributeInpt.value = '';
            categoryInpt.value = '';
            isUniqueInpt.checked = false;

            attributesCategoriesArr.push({ attributeName: attributeNameValue, categoryName: categoryNameValue, isUnique: requestBody.isUnique === 1 ? 'כן' : 'לא' });

            filteredArr = attributesCategoriesArr.slice();
            displayAttributesCategories(filteredArr);
        })
        .catch(error => {
            console.error('Error details:', error);
            alert('Error: ' + error.message);
        });
}




function search(string) {
    let newString = changeToHebrew(string);
    filteredArr = attributesCategoriesArr.filter(ac => ac.attributeName.includes(newString));
    currentPage = 0;
    displayAttributesCategories(filteredArr);
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
        displayAttributesCategories(filteredArr);
    });

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = 'דף הבא';
    nextBtn.disabled = currentPage >= totalPages - 1;
    nextBtn.addEventListener('click', () => {
        currentPage++;
        displayAttributesCategories(filteredArr);
    });

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(nextBtn);
    allAttributesCategories.appendChild(paginationDiv);
}

