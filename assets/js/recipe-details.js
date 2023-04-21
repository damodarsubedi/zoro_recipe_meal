function generateOrderedRecipeInstructions(recipeData) {
    let instructionArray = recipeData.analyzedInstructions;
    if (instructionArray.length !== 0) {
        let instructionSteps = '<ol>';
        instructionArray[0].steps.forEach(step => {
            instructionSteps += `<li>${step.step}</li>`;
        });
        instructionSteps += '</ol>';
        return instructionSteps;
    } else if (instructionArray.length === 0 && recipeData.sourceUrl) {
        return `<p>Detailed instructions can be found at <a href="${recipeData.sourceUrl}" target="_blank" rel="noopener">${recipeData.sourceName}</a></p>`;
    } else {
        return `<p>No detailed instructions found</p>`;
    }
}

function generateIngredientList(recipeData) {
    let ingredientImgBaseUrl = 'https://spoonacular.com/cdn/ingredients_100x100/';
    let ingredientRows = '';

    if (recipeData.extendedIngredients) {
        recipeData.extendedIngredients.forEach(ingredient => {
            ingredientRows += `
            <li class="row mb-3 g-0 align-items-center">
                <span class="col-1">
                    <button class="add-remove-item">
                        <i class="bi bi-plus-circle" aria-label="add item to grocery list"></i>    
                    </button>
                </span>
                <span class="ingredient-img col-3">
                    <img src="${ingredientImgBaseUrl}${ingredient.image}" width="50" alt="${ingredient.name}">
                </span>
                <span class="ingredient-name col-5 my-auto">${capitalizeFirstLetter(ingredient.name)}</span>
                <span class="ingredient-qty col-3 my-auto">${ingredient.amount} ${ingredient.unit}</span>
            </li>
            `;
        });
        return ingredientRows;
    }

    $('p.text-muted.ingredient-instruction').hide();
    return `<p>Ingredient list can be found at <a href="${recipeData.sourceUrl}" target="_blank" rel="noopener">${recipeData.sourceName}</a></p>`;
}

function writeRecipeData(recipeData) {
    let recipeInstructions = generateOrderedRecipeInstructions(recipeData);
    let ingredientList = generateIngredientList(recipeData);

    $('.recipe-title').text(recipeData.title);
    $('#cooking-duration').text(recipeData.readyInMinutes);
    $('.ingredient-list').html(ingredientList);
    $('#servings').text(recipeData.servings);
    $('.recipe-img').attr('src', recipeData.image);
    $('.recipe-img').attr('alt', recipeData.title);
    $('.recipe-instructions').append(recipeInstructions);
}

function loadRecipeDetails() {
    const recipeId = Number(loadFromLocalStorage('recipeIdToDisplay')); // convert Id from being a string loaded from localStorage to number
    const mealPlanData = loadFromLocalStorage('mealPlanData');
    const recipeData = mealPlanData.find(meal => meal.id === recipeId);

    writeRecipeData(recipeData);
    drawNutrientBreakdownChart(recipeData.nutrition.caloricBreakdown, 'mealData');
    addNutrientsData(['calories', 'protein', 'fat', 'carbohydrates'], recipeData.nutrition.nutrients, 'mealData');
}

function checkIfItemsAreAlreadyAdded() {
    const retrievedGroceryList = loadFromLocalStorage('groceryList');

    if (retrievedGroceryList) {
        $('.ingredient-name').each(function() {
            let name = $(this).text();
            let quantity = $(this).next().text();
            let ingredientItem = { name, quantity };
            let foundIndex = retrievedGroceryList.findIndex(groceryItem => {
                if (groceryItem.name === ingredientItem.name && groceryItem.quantity === ingredientItem.quantity)
                    return true;
            });

            if (foundIndex !== -1) {
                $(this).prev().prev().find('i.bi').removeClass('bi-plus-circle');
                $(this).prev().prev().find('i.bi').addClass('bi-dash-circle');
                $(this).prev().prev().find('i.bi').attr('aria-label', 'remove item from grocery list');
            }
        });
    }
}

function addOrRemoveFromGroceryList(item, action) {
    const name = item.closest('li.row').find('.ingredient-name').text();
    const quantity = item.closest('li.row').find('.ingredient-qty').text();
    const retrievedGroceryList = loadFromLocalStorage('groceryList');

    switch (action) {
        case 'add':
            if (!loadFromLocalStorage('groceryList')) {
                saveToLocalStorage('groceryList', [{ name, quantity }]);
                return;
            }
            retrievedGroceryList.push({ name, quantity });
            saveToLocalStorage('groceryList', retrievedGroceryList);
            break;

        case 'remove':
            const itemIndex = retrievedGroceryList.findIndex(element => element.name === name && element.quantity === quantity);
            retrievedGroceryList.splice(itemIndex, 1);
            saveToLocalStorage('groceryList', retrievedGroceryList);
            break;

        default:
            break;
    }
}

function activateAddRemoveButton() {
    checkIfItemsAreAlreadyAdded(); // by default, an ingredient item has "add" action to add the item to grocery list. If an item is already added in the list, give it 'remove' action

    $('button.add-remove-item').on('click', function() {
        let action = $(this).children();

        if (action.hasClass('bi-dash-circle')) {
            action.removeClass('bi-dash-circle');
            action.addClass('bi-plus-circle');
            action.attr('aria-label', 'add item to grocery list');
            addOrRemoveFromGroceryList(action, 'remove');
        } else {
            action.removeClass('bi-plus-circle');
            action.addClass('bi-dash-circle');
            action.attr('aria-label', 'remove item from grocery list');
            addOrRemoveFromGroceryList(action, 'add');
        }
    });
}

function displayEmptyRecipePage() {
    $('div.section-card-wrapper').html(`
    <div class="text-center container mt-3">
        <h5>Ooops...</h5>
        <img src="assets/img/error.png" alt="error" class="img w-25">
        <p>You haven't chosen any recipes to show yet. Please go back to <a href="recipe-generator.html">Recipe Randomizer page</a> to find something delicious for today</p>
    </div>        
    `);
}

$(document).ready(function() {
    // if user doesn't have any meal plan/data from previous visit and enters the application through direct link to recipe-details.html page, display empty recipe page. Else, load recipe details and activate buttons
    !loadFromLocalStorage('recipeIdToDisplay') ? displayEmptyRecipePage() : (loadRecipeDetails(), activateAddRemoveButton());

    $('.back-to-meal-plan').on('click', function() {
        window.location = 'recipe-generator.html';
    });
});