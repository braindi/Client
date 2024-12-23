let container = document.querySelector('#container');

let question = document.createElement('h3');
let veryGood = document.createElement('h3');
let good = document.createElement('h3');
let notGood = document.createElement('h3');
let bad = document.createElement('h3');

question.innerHTML = 'השאלה';
veryGood.innerHTML = 'מתאים מאוד';
good.innerHTML = 'מתאים';
notGood.innerHTML = 'ככה ככה';
bad.innerHTML = 'לא מתאים';

let allTitles = document.createElement('div');
allTitles.classList.add('all-titiles')
allTitles.appendChild(question);
allTitles.appendChild(bad);
allTitles.appendChild(notGood);
allTitles.appendChild(good);
allTitles.appendChild(veryGood);

container.appendChild(allTitles)


let questionDiv = document.createElement('div');
container.appendChild(questionDiv);
let attributesArr = [];
let categoriesArr = [];
let attributesCategoriesArr = [];
let questionsArr = [];
let itemsPerPage = 0;

// מערך עם התכונה הייחודית
let uniqueAttributesArr = [];
// מערך עם השאלות ההתחלתיות
let firstQuestions = [];
// שאר השאלות
let remainingQuestions = [];
// מערך שממנו בוחרים את השאלה הבא
let copyQuestions = [];
// כל השאלות - להצגה
let allQuestions = [];

let attributesWithSum = [];
let categoriesWithSum = [];
let currentPage = 1; // דף נוכחי
let totalPages = 0;  // מספר עמודים

let questionWithCoose = [];


async function fetchData() {
    try {
        // קבלת attributes
        const attributesResponse = await fetch('https://localhost:7295/api/Attribute');
        if (!attributesResponse.ok) {
            throw new Error('Network response was not ok ' + attributesResponse.statusText);
        }
        attributesArr = await attributesResponse.json();
        console.log(attributesArr);

        // קבלת categories
        const categoriesResponse = await fetch('https://localhost:7295/api/Category');
        if (!categoriesResponse.ok) {
            throw new Error('Network response was not ok ' + categoriesResponse.statusText);
        }
        categoriesArr = await categoriesResponse.json();
        console.log(categoriesArr);

        // קבלת attributesCategories
        const attributesCategoriesResponse = await fetch('https://localhost:7295/api/AttributeCategory');
        if (!attributesCategoriesResponse.ok) {
            throw new Error('Network response was not ok ' + attributesCategoriesResponse.statusText);
        }
        attributesCategoriesArr = await attributesCategoriesResponse.json();
        console.log(attributesCategoriesArr);

        // קבלת questions
        const questionsResponse = await fetch('https://localhost:7295/api/Question');
        if (!questionsResponse.ok) {
            throw new Error('Network response was not ok ' + questionsResponse.statusText);
        }
        questionsArr = await questionsResponse.json();
        console.log(questionsArr);

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }

    itemsPerPage = categoriesArr.length;
    console.log('Items per page:', itemsPerPage);

    attributesWithSum = attributesArr.map(item => {
        return {
            ...item,
            display: false,
            sum: 0
        }
    });

    categoriesWithSum = categoriesArr.map(item => {
        return {
            ...item,
            display: false,
            sum: 0
        }
    });

    // סינון התכונות הייחודיות
    uniqueAttributesArr = attributesCategoriesArr
        .filter(category => category.isUnique === 'כן') 
        .map(category => {
            const attribute = attributesArr.find(attr => attr.attributeName === category.attributeName);
            return attribute ? { attributeId: attribute.attributeId, attributeName: attribute.attributeName } : null;
        })
        .filter(item => item !== null);

    let questionsMix = questionsArr.map(item => {
        return {
            ...item
        }
    });

    for (let i = 0; i < uniqueAttributesArr.length; i++) {
        let flag = false;
        for (let j = 0; j < questionsMix.length && flag == false; j++) {
            if (uniqueAttributesArr[i].attributeId == questionsMix[j].attributeId) {
                flag = true;
                firstQuestions.push({ questionText: questionsMix[j].questionText, attributeId: questionsMix[j].attributeId, isUnique: true });
                questionsMix.splice(j, 1);
            }
        }
    }

    for (let i = 0; i < questionsMix.length; i++) {
        remainingQuestions.push({ questionText: questionsMix[i].questionText, attributeId: questionsMix[i].attributeId, isUnique: false });
    }

    copyQuestions = JSON.parse(JSON.stringify(remainingQuestions));

    allQuestions = JSON.parse(JSON.stringify(firstQuestions));

    while (copyQuestions.length > 0) {
        let randomIndex = Math.floor(Math.random() * copyQuestions.length);
        allQuestions.push(copyQuestions[randomIndex]);
        copyQuestions.splice(randomIndex, 1);
    }

    allQuestions.forEach(item => item.sum = 0);

    questionWithCoose = allQuestions.map(item => {
        return {
            questionText: item.questionText,
            score: -1
        }
    })
    console.log("questionWithCoose:", questionWithCoose);

    localStorage.setItem('allQuestions', JSON.stringify(questionWithCoose));
  
    totalPages = Math.ceil(allQuestions.length / itemsPerPage);
    console.log(totalPages);

    setupPagination(); 
    displayPage(currentPage); 
}

fetchData();

function oneQuestion(item, index) {


    let div = document.createElement('div');
    div.classList.add('one-question');
    let questionText = document.createElement('h4');
    questionText.innerHTML = item.questionText;
    div.appendChild(questionText);

    let allRadios = document.createElement('div');
    allRadios.classList.add('all-radios');
    let inpt1 = document.createElement('input');
    let inpt2 = document.createElement('input');
    let inpt3 = document.createElement('input');
    let inpt4 = document.createElement('input');

    inpt1.type = 'radio';
    inpt2.type = 'radio';
    inpt3.type = 'radio';
    inpt4.type = 'radio';

    inpt1.name = `scores_${index}`;
    inpt2.name = `scores_${index}`;
    inpt3.name = `scores_${index}`;
    inpt4.name = `scores_${index}`;

    inpt1.value = 0;
    inpt2.value = 1;
    inpt3.value = 3;
    inpt4.value = 5;

    questionWithCoose = localStorage.getItem('allQuestions');
    if (questionWithCoose && questionWithCoose !== '') {
        questionWithCoose = JSON.parse(questionWithCoose);
        for (let i = 0; i < questionWithCoose.length; i++) {
            if (questionWithCoose[i].questionText == item.questionText) {
                switch (questionWithCoose[i].score) {
                    case 0:
                        inpt1.checked = true;
                        break;
                    case 1:
                        inpt2.checked = true;
                        break;
                    case 3:
                        inpt3.checked = true;
                        break;
                    case 5: inpt4.checked = true;
                        break;
                }
            }
        }
    }

    inpt1.addEventListener('change', () => {

        questionWithCoose = localStorage.getItem('allQuestions');
        if (questionWithCoose && questionWithCoose !== '') {
            questionWithCoose = JSON.parse(questionWithCoose);
            for (let i = 0; i < questionWithCoose.length; i++) {
                if (questionWithCoose[i].questionText == item.questionText) {
                    questionWithCoose[i].score = 0;
                }
            }

            localStorage.setItem('allQuestions', JSON.stringify(questionWithCoose));
        }

        item.sum = parseInt(inpt1.value);

    });
    inpt2.addEventListener('change', () => {
        questionWithCoose = localStorage.getItem('allQuestions');
        if (questionWithCoose && questionWithCoose !== '') {
            questionWithCoose = JSON.parse(questionWithCoose);
            for (let i = 0; i < questionWithCoose.length; i++) {
                if (questionWithCoose[i].questionText == item.questionText) {
                    questionWithCoose[i].score = 1;
                }
            }
            localStorage.setItem('allQuestions', JSON.stringify(questionWithCoose));

        }
        item.sum = parseInt(inpt2.value);
    });
    inpt3.addEventListener('change', () => {
        questionWithCoose = localStorage.getItem('allQuestions');
        if (questionWithCoose && questionWithCoose !== '') {
            questionWithCoose = JSON.parse(questionWithCoose);
            for (let i = 0; i < questionWithCoose.length; i++) {
                if (questionWithCoose[i].questionText == item.questionText) {
                    questionWithCoose[i].score = 3;
                }
            }
            localStorage.setItem('allQuestions', JSON.stringify(questionWithCoose));

        }
        item.sum = parseInt(inpt3.value);
    });
    inpt4.addEventListener('change', () => {
        questionWithCoose = localStorage.getItem('allQuestions');
        if (questionWithCoose && questionWithCoose !== '') {
            questionWithCoose = JSON.parse(questionWithCoose);
            for (let i = 0; i < questionWithCoose.length; i++) {
                if (questionWithCoose[i].questionText == item.questionText) {
                    questionWithCoose[i].score = 5;
                }
            }
            localStorage.setItem('allQuestions', JSON.stringify(questionWithCoose));

        }
        item.sum = parseInt(inpt4.value);
    });

    allRadios.appendChild(inpt1);
    allRadios.appendChild(inpt2);
    allRadios.appendChild(inpt3);
    allRadios.appendChild(inpt4);

    div.appendChild(allRadios);
    questionDiv.appendChild(div);
}


function setupPagination() {
    let paginationDiv = document.querySelector('#pagination');
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination';
        container.appendChild(paginationDiv);
    }

    paginationDiv.innerHTML = '';

    let prevBtn = document.createElement('button');
    prevBtn.id = 'prevBtn';
    prevBtn.innerHTML = 'קודם';
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    let nextBtn = document.createElement('button');
    nextBtn.id = 'nextBtn';
    nextBtn.innerHTML = 'הבא';
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
    });

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(document.createElement('span')); 
    paginationDiv.appendChild(nextBtn);

    updatePagination(); 
}


function displayPage(page) {
    questionDiv.innerHTML = '';

    let startIndex = (page - 1) * itemsPerPage;
    let endIndex = page * itemsPerPage;
    let questionsToDisplay = allQuestions.slice(startIndex, endIndex);

    questionsToDisplay.forEach((item, index) => {
        oneQuestion(item, index);
    });

    updatePagination(); 
}

function updatePagination() {
    let prevBtn = document.getElementById('prevBtn');
    let nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

let resultsBtn = document.createElement('button');
resultsBtn.innerHTML = 'תוצאות';
resultsBtn.addEventListener('click', () => {
    calculationOfResults();
})

container.appendChild(resultsBtn);


let div = document.createElement('div');
div.classList.add('result-div');
container.appendChild(div);

function calculationOfResults() {

    attributesWithSum.forEach(item => {
        item.display = false;
        item.sum = 0;
    })


    for (let i = 0; i < allQuestions.length; i++) {
        for (let j = 0; j < attributesWithSum.length; j++) {
            if (allQuestions[i].attributeId == attributesWithSum[j].attributeId) {
                if (allQuestions[i].isUnique == true && allQuestions[i].sum > 0)
                    attributesWithSum[j].display = true;
                attributesWithSum[j].sum += allQuestions[i].sum;
            }
        }
    }

    console.log(attributesWithSum);

    categoriesWithSum.forEach(item => {
        item.sum = 0;
        item.display = false;
    })



    for (let i = 0; i < categoriesWithSum.length; i++) {
        const category = categoriesWithSum[i];
        console.log(`תחום: ${category.categoryName}`);


        const categoryAttributes = attributesCategoriesArr
            .filter(link => link.categoryName === category.categoryName)
            .map(link => attributesWithSum.find(attr => attr.attributeName === link.attributeName))
            .filter(attr => attr !== undefined);

        for (let j = 0; j < categoryAttributes.length; j++) {
            const attribute = categoryAttributes[j];
            console.log(`תכונה: ${attribute.attributeName}`);

            category.sum += attribute.sum;

            if (attribute.display) {
                category.display = true;
            }
        }
        console.log(`תחום: ${category.categoryName}`);
        console.log(category.sum);
        console.log(category.display);

    }


    div.innerHTML = '';

    categoriesWithSum.sort((a, b) => b.sum - a.sum);

    let h2 = document.createElement('h2');
    h2.innerHTML = "התוצאות:"
    div.appendChild(h2);
    for (let i = 0; i < categoriesWithSum.length; i++) {
        if (categoriesWithSum[i].display) {
            let h4 = document.createElement('h4');
            h4.innerHTML = categoriesWithSum[i].categoryName;
            div.appendChild(h4);
        }
    }
}
