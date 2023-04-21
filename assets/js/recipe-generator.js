// declaration of global variables
const userMealPreference = $('#meal-preference');
const mealPlanDisplay = $('#meal-plan-container');

const dietPreferenceList = $('input[name="diet-preference"]');
const intoleranceList = $('input[name="intolerances"]');
let diet = 'vegetarian'; //to make vegetarian as default option
let intolerances = [];

const totalNutrientsChart = $('#total-nutrients-chart');

const apiKey = 'b44f68b50d4448e7b3a54be5dac3b0ab';

let mealListId = [];

// functions to write elements for each meal card which eventually will be called in order to write complete meal plan data  
function mealCardTitle(index) {
  let title;

  switch (index) {
    case 0:
      title = 'Breakfast';
      break;
    case 1:
      title = 'Lunch';
      break;
    case 2:
      title = 'Dinner';
      break;
    default:
      title = 'Anytime';
      break;
  }
  return title;
}

const writeMealCard = (data) => {
  let mealCardHtml = '';
  mealCardHtml = `
      <a class="row g-0" href="recipe-details.html" id="${data.id}">
        <div class="col-md-4 my-auto">
            <img src="${data.image}" class="w-100 h-auto px-3" alt="${data.title}">
        </div>
        <div class="col-md-8">
            <div class="card-body">
                <h4 class="card-title">${data.title}</h4>
                <p class="card-text">
                    <small class="text-muted">Ready in: ${data.readyInMinutes} minutes</small>
                    <small class="text-muted float-end">Servings: ${data.servings}</small>
                </p>
                <div class="row row-cols-2">
                    <div class="col text-center">
                        <span class="border py-2 px-3 d-block mb-2">Calories: ${findNutrientData('calories', data.nutrition.nutrients, 'mealData')}</span>
                        <span class="border py-2 px-3 d-block">Fat: ${findNutrientData('fat', data.nutrition.nutrients, 'mealData')}g</span>
                    </div>
                    <div class="col text-center">
                        <span class="border py-2 px-3 d-block mb-2">Protein: ${findNutrientData('protein', data.nutrition.nutrients, 'mealData')}g</span>
                        <span class="border py-2 px-3 d-block">Carbs: ${findNutrientData('carbohydrates', data.nutrition.nutrients, 'mealData')}g</span>
                    </div>
                </div>
            </div>
        </div>
      </a>
     `;
  return mealCardHtml;
}


// function to add 'click' event listener for meal card to store meal ID being clicked in order to load the correct data at recipe-details page
function viewRecipeDetails() {
  $('div.meal-card-data > a').each(function() {
    $(this).click(function() {
      saveToLocalStorage('recipeIdToDisplay', $(this).attr('id'));
    });
  });
}

function handleCatchError() {
  $('section#meal-plan').html(`
        <div class="text-center container mt-3">
          <h5>Ooops...</h5>
          <img src="assets/img/error.png" alt="error" class="img w-25">
          <p>Something went wrong under cooking. Please try again!<br>If the error persists, please send an email to <a href="mailto:damodarsubedi2015@gmail.com?subject=Zoro Recipe & Meal issue">our developer</a> and we will have it cooked!</p>
        </div>
  `);
}

// functions below to add click event to buttons to fetch new specific meal, and consequentially update nutrients data and caloric breakdown chart based on the new meal plan

const recalculateNewMealPlanNutrients = () => {
  let newMealPlan = loadFromLocalStorage('mealPlanData');
  let newTotalCarbs = 0;
  let newTotalProtein = 0;
  let newTotalFat = 0;
  let newTotalCalories = 0;
  let newMealPlanNutrients;

  newMealPlan.forEach(meal => {
    newTotalCarbs += findNutrientData('carbohydrates', meal.nutrition.nutrients, 'mealData');
    newTotalProtein += findNutrientData('protein', meal.nutrition.nutrients, 'mealData');
    newTotalFat += findNutrientData('fat', meal.nutrition.nutrients, 'mealData');
    newTotalCalories += findNutrientData('calories', meal.nutrition.nutrients, 'mealData');
  });

  newMealPlanNutrients = {
    carbohydrates: `${Math.round(newTotalCarbs)}`,
    protein: `${Math.round(newTotalProtein)}`,
    fat: `${Math.round(newTotalFat)}`,
    calories: `${Math.round(newTotalCalories)}`
  };
  saveToLocalStorage('totalNutrientBreakdown', newMealPlanNutrients); // for later use on load-meal-plan.js
  return newMealPlanNutrients;
}

function updateNewMealPlanNutrients() {
  const newMealPlanNutrients = recalculateNewMealPlanNutrients();
  drawNutrientBreakdownChart(newMealPlanNutrients, 'mealPlanData');
  addNutrientsData(['calories', 'protein', 'fat', 'carbohydrates'], newMealPlanNutrients, 'mealPlanData');
}

function findNewMeal(btn) {
  let retrievedMealPlan = loadFromLocalStorage('mealPlanData');
  let mealCardData = $(btn).parents('div.card div.row').next();
  let oldMeal = retrievedMealPlan.find(
    meal => meal.id === Number(mealCardData[0].firstElementChild.id)
  );

  mealCardData.empty(); // clear data on current meal card in order to write new data

  fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&diet=${diet}&intolerances=${intolerances.toString().toLowerCase()}&number=30&offset=3&addRecipeNutrition=true&type=${$(btn).closest('.meal-type-title').text().toLowerCase()}`)
    .then(response => response.json())
    .then(data => {
      let results = data.results;
      let newMeal = results[Math.floor(Math.random() * results.length)]; // new meal is picked by getting a random item from results array by generating a random index

      mealCardData.html(writeMealCard(newMeal));
      viewRecipeDetails();

      // update/save new meal plan and html to localStorage for use on load-meal-plan.js
      retrievedMealPlan.splice(retrievedMealPlan.indexOf(oldMeal), 1, newMeal);
      saveToLocalStorage('mealPlanData', retrievedMealPlan);
      saveToLocalStorage('mealPlanDisplay', mealPlanDisplay[0].innerHTML);
    })
    .catch(handleCatchError);

  updateNewMealPlanNutrients();
  // save user's diet preference and intoleraces in case they select new
  saveToLocalStorage('userDiet', diet);
  saveToLocalStorage('userIntolerances', intolerances);

}

function writeMealPlan(mealListId) {
  //use Promise.all() to get all the json data ready before looping the data to write meal cards in correct order (breakfast, lunch, dinner) based on data's index
  let breakfastResponse = fetch(`https://api.spoonacular.com/recipes/${mealListId[0]}/information?apiKey=${apiKey}&includeNutrition=true`),
    lunchResponse = fetch(`https://api.spoonacular.com/recipes/${mealListId[1]}/information?apiKey=${apiKey}&includeNutrition=true`),
    dinnerResponse = fetch(`https://api.spoonacular.com/recipes/${mealListId[2]}/information?apiKey=${apiKey}&includeNutrition=true`);

  Promise.all([breakfastResponse, lunchResponse, dinnerResponse])
    .then(responses => {
      return Promise.all(
        responses.map(response => {
          return response.json();
        })
      );
    })
    .then(dataArray => {
      saveToLocalStorage('mealPlanData', dataArray);
      dataArray.forEach(data => {
        let mealCardHtml = '';

        mealCardHtml = `
        <div class="card mb-3">
            <div class="row row-cols-2 pt-3 pb-2">
                <h3 class="col my-auto ps-4 meal-type-title">${mealCardTitle(dataArray.indexOf(data))}</h3>
                <div class="col text-end pe-4">
                    <button class="btn btn-secondary find-new-meal-btn" aria-label="Find new meal" onclick="findNewMeal($(this));"><i class="fas fa-random"></i></button>
                </div>
            </div>
            <div class="meal-card-data">
              ${writeMealCard(data)}
            </div>
        </div>
        `;
        mealPlanDisplay.append(mealCardHtml);
        //save meal plan html to localStorage for use on load-meal-plan.js
        saveToLocalStorage('loadMealPlan', 'true');
        saveToLocalStorage('mealPlanDisplay', mealPlanDisplay[0].innerHTML);
      });
      viewRecipeDetails();
    })
    .catch(handleCatchError);
}

// The results from meal plan API call do not have data on the meals' image urls. After meal plan API call is finished, the function will extract IDs of all the meals into an array and then the meal ID array is parsed into another api call in order to get all the neccessary data to then finally write to document
function extractMealListId(mealList) {
  //empty previous mealListId array and then assign a new one for new meal plan
  mealListId = [];
  $.each(mealList, function(index, value) {
    mealListId.push(value.id);
  });
  return mealListId;
}

function fetchMealPlan() {
  fetch(
    `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&diet=${diet.toLowerCase()}&exclude=${intolerances.toString()},drinks,beverages,alcohol`
  )
    .then(response => response.json())
    .then(results => {
      let mealList = results.meals;

      extractMealListId(mealList);
      drawNutrientBreakdownChart(results.nutrients, 'mealPlanData'); // function from main.js
      addNutrientsData(['calories', 'protein', 'fat', 'carbohydrates'], results.nutrients, 'mealPlanData'); // function from main.js
      saveToLocalStorage('totalNutrientBreakdown', results.nutrients); // for later use on load-meal-plan.js
      writeMealPlan(mealListId);
    })
    .catch(handleCatchError);
}

// functions to gather user's diet preference and intolerances as query parameter to parse to API call
function getUserDiet(e) {
  if (this.checked) {
    diet = this.labels[0].innerText;
  }

  // set visual cues for vegan diet to include dairy and egg as intolerances by default. Since vegan diet parameter already returns results excluding dairy and egg, it's not needed to also set intolerance param in this case.
  if (diet === 'Vegan') {
    intoleranceList[0].checked = true;
    intoleranceList[1].checked = true;
    intoleranceList[0].disabled = true;
    intoleranceList[1].disabled = true;
  } else {
    intoleranceList[0].checked = false;
    intoleranceList[1].checked = false;
    intoleranceList[0].disabled = false;
    intoleranceList[1].disabled = false;
  }
  return diet;
}

function getUserIntolerances(e) {
  if (this.checked) {
    intolerances.push(this.labels[0].innerText);
  } else {
    intolerances.splice(intolerances.indexOf(this.labels[0].innerText), 1);
  }
  return intolerances;
}

// gather search query and then fetch data through API call
function handleUserMealPreferences() {
  $('#meal-plan').removeClass('d-none');
  mealPlanDisplay.empty();
  totalNutrientsChart.empty();
  location.href = '#meal-plan-container';
  fetchMealPlan();
  // save user's diet preference and intolerances being used to fetch meal plan so when they return to the page later, the selected will also load accordingly to the saved meal plan
  saveToLocalStorage('userDiet', diet);
  saveToLocalStorage('userIntolerances', intolerances);
}

function activateDietAndIntoleranceSelection() {
  dietPreferenceList.on('change', getUserDiet);
  intoleranceList.on('change', getUserIntolerances);
  userMealPreference.on('submit', e => {
    e.preventDefault();
    handleUserMealPreferences();
  });
}

function resetMealPlanData() {
  diet = 'vegetarian'; // by reset, make vegetarian as a default diet preference
  intolerances.splice(0);
  mealListId.splice(0);
  $('#meal-plan').addClass('d-none');
  resetLocalStorage();
}

$(document).ready(function() {
  activateDietAndIntoleranceSelection();
  $('button[type="reset"]').on('click', resetMealPlanData);
});