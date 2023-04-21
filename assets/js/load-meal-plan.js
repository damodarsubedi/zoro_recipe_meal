// automatically load previously generated meal plan and user's diet and intolerances accordingly
function setDietPreference(diet) {
    if (!diet) {
        diet = 'vegetarian'; // set to default diet
        dietPreferenceList[0].checked = true;
        return;
    }

    dietPreferenceList.each(function() {
        if (this.id === diet) {
            this.checked = true;
        }
    });
    return;
}

function setIntolerances(intolerances) {
    if (!intolerances) {
        intolerances = []; // set to empty array as default to prevent intolerances variable being null
        return;
    }

    intoleranceList.each(function() {
        if (intolerances.includes(capitalizeFirstLetter(this.id))) {
            this.checked = true;
        }
    });
    return;
}

$(document).ready(function() {
    if (loadFromLocalStorage('loadMealPlan') === 'true') {
        let mealPlanNutrients = loadFromLocalStorage('totalNutrientBreakdown');
        $("#meal-plan").removeClass("d-none");
        diet = loadFromLocalStorage('userDiet');
        intolerances = loadFromLocalStorage('userIntolerances');

        setDietPreference(diet);
        setIntolerances(intolerances)

        mealPlanDisplay.html(loadFromLocalStorage('mealPlanDisplay'));
        viewRecipeDetails();

        drawNutrientBreakdownChart(mealPlanNutrients, 'mealPlanData');
        addNutrientsData(['calories', 'protein', 'fat', 'carbohydrates'], mealPlanNutrients, 'mealPlanData');
    }
});