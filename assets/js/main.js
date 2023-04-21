
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// functions to find the needed nutrient from a list and then write that nutrient's absolute value which can be used in recipe-generator.html and recipe-details.html
function findNutrientData(nutrient, nutrientList, dataType) {
  if (dataType === 'mealPlanData') {
    return nutrientList[nutrient];
  } else if (dataType === 'mealData') {
    let found = nutrientList.find(element => element.name === capitalizeFirstLetter(nutrient));
    return found.amount;
  }
}

function addNutrientsData(nutrients, nutrientList, dataType) {
  nutrients.forEach(nutrient => {
    let amount = findNutrientData(nutrient, nutrientList, dataType);
    $(`.${nutrient}`).each(function() {
      $(this).text('');
      return $(this).text(amount);
    });
  });
}

// get background colors for the 3 nutrients accordingly to the theme chosen from css variables
function getNutrientBackgroundColors() {
  let carbsColor = getComputedStyle(document.body).getPropertyValue('--carbs-color');
  let fatColor = getComputedStyle(document.body).getPropertyValue('--fat-color');
  let proteinColor = getComputedStyle(document.body).getPropertyValue('--protein-color');
  return [carbsColor, fatColor, proteinColor];
}

// functions to compile neccesary configurations and then draw pie chart using chart.js to show caloric percentage breakdown of nutrients
function compilePieChartConfigs(nutrients, dataType) {
  let carbohydratesCalories, proteinCalories, fatCalories;

  if (dataType === 'mealPlanData') {
    carbohydratesCalories = nutrients.carbohydrates * 4 / nutrients.calories * 100;
    proteinCalories = nutrients.protein * 4 / nutrients.calories * 100;
    fatCalories = nutrients.fat * 9 / nutrients.calories * 100;
  } else if (dataType === 'mealData') {
    carbohydratesCalories = nutrients.percentCarbs;
    proteinCalories = nutrients.percentProtein;
    fatCalories = nutrients.percentFat;
  }

  const chartData = {
    labels: ['Carbs', 'Fat', 'Protein'],
    datasets: [{
      label: 'Caloric Breakdown',
      data: [Math.round(Number(carbohydratesCalories)), Math.round(Number(fatCalories)), Math.round(Number(proteinCalories))],
      backgroundColor: getNutrientBackgroundColors(),
      borderColor: [
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)'
      ],
      borderWidth: 1,
      hoverOffset: 3
    }]
  };

  const chartConfigs = {
    type: 'pie',
    data: chartData,
    plugins: [ChartDataLabels],
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Caloric percentage breakdown',
          color: 'rgb(255, 255, 255)'
        },
        datalabels: {
          color: 'rgb(255, 255, 255)',
        }
      },
    }
  };
  return chartConfigs;
}

function drawNutrientBreakdownChart(nutrients, dataType) {

  // Compile chart configuration based on nutrient data and data type
  let chartConfigs = compilePieChartConfigs(nutrients, dataType);

  // Draw pie chart in chart container element
  $('.chart-container').html('<canvas class="nutrients-chart mx-auto" width="200" height="200"></canvas>');
  let ctx = $('.nutrients-chart');
  ctx.each(function() {
    nutrientChart = new Chart($(this), chartConfigs);
  });
}