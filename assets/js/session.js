//functions to save and retrieve an item to local storage
function saveToLocalStorage(dataName, dataToSave) {
    //convert object into json string to save to local storage
    localStorage.setItem(dataName, JSON.stringify(dataToSave));
  }
  
  function loadFromLocalStorage(dataName) {
    //retrieve json string and parse it back to javascript object
    return JSON.parse(localStorage.getItem(dataName));
  }
  
  // clear all data in localStorage on reset button click
  function resetLocalStorage() {
    // delete saved items in local storage
    const localStorageKeys = ['userDiet', 'userIntolerances', 'mealPlanData', 'mealPlanDisplay', 'totalNutrientBreakdown', 'newMeal', 'loadMealPlan', 'groceryList', 'recipeIdToDisplay'];
    localStorageKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  
    if ($('#resumePrevSessionModal')) {
      $('#resumePrevSessionModal').modal('hide');
    }
  }
  // functions to trigger modal when a user returns and already have a meal plan generated from previous visit. User can then choose to resume previous session or reset to start from beginning
  function resumePreviousSession() {
    if (window.location.toString().includes('index.html') || !loadFromLocalStorage('groceryList')) {
      window.location = 'recipe-generator.html#meal-plan-container';
    } else {
      $('#resumePrevSessionModal').modal('hide');
    }
  }
  function showReturningUserModal() {
    if (loadFromLocalStorage('loadMealPlan') === 'true' && !sessionStorage.getItem('modalShown')) {
      $('div.returning-user-modal').html(
        `<div class="modal fade" id="resumePrevSessionModal" tabindex="-1" aria-labelledby="resumePrevSession" aria-hidden="true" data-backdrop="false">
          <div class="modal-dialog">
            <div class="modal-content card">
              <div class="modal-header">
                <h5 class="modal-title" id="resumePrevSessionModalLabel">Resume previous session?</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                You already have a meal plan generated from previous visit. Would you like to resume where you left off or reset to beginning?
              </div>
              <div class="modal-footer justify-content-center">
              <button class="btn btn-primary" onclick="resumePreviousSession()">Resume</button>
              <button class="btn btn-reset" onclick="resetLocalStorage()">Reset</button>
              </div>
            </div>
          </div>
        </div>`
      );
    }
    $('#resumePrevSessionModal').modal('show');
    sessionStorage.setItem('modalShown', 'true');
  }

$(document).ready(function() {
  showReturningUserModal();
});
  