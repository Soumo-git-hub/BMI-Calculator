// Nutrition page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize user info
  initUserInfo();
  
  // Set current date
  updateCurrentDate();
  
  // Initialize tabs
  initTabs();
  
  // Initialize food tracking
  initFoodTracking();
  
  // Initialize meal plan
  initMealPlan();
  
  // Initialize nutrition info search
  initNutritionSearch();
});

// Function to initialize user info
function initUserInfo() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userNameElement = document.getElementById('user-name');
  
  if (currentUser.name) {
    userNameElement.textContent = currentUser.name;
  }
  
  // Logout button functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      sessionStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }
}

// Function to update current date display
function updateCurrentDate() {
  const dateElement = document.getElementById('current-date-nutrition');
  if (!dateElement) return;
  
  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  dateElement.textContent = today.toLocaleDateString('en-US', options);
  
  // Add event listeners for date navigation
  const prevDayBtn = document.getElementById('prev-day-nutrition');
  const nextDayBtn = document.getElementById('next-day-nutrition');
  
  if (prevDayBtn) {
    prevDayBtn.addEventListener('click', function() {
      // Implement previous day functionality
      alert('Previous day functionality will be implemented in future updates');
    });
  }
  
  if (nextDayBtn) {
    nextDayBtn.addEventListener('click', function() {
      // Implement next day functionality
      alert('Next day functionality will be implemented in future updates');
    });
  }
}

// Function to initialize tabs
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button and corresponding pane
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Function to initialize food tracking
function initFoodTracking() {
  // Set calorie goal based on user's TDEE if available
  setNutritionGoals();
  
  // Load saved food data
  loadFoodData();
  
  // Add event listeners for add food buttons
  const addFoodButtons = document.querySelectorAll('.add-food-btn');
  addFoodButtons.forEach(button => {
    button.addEventListener('click', function() {
      const meal = this.getAttribute('data-meal');
      openAddFoodModal(meal);
    });
  });
  
  // Initialize add food modal
  initAddFoodModal();
}

// Function to set nutrition goals
function setNutritionGoals() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return;
  
  // Get TDEE from localStorage if available
  const tdeeData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_tdee`) || '[]');
  let calorieGoal = 2000; // Default
  
  if (tdeeData.length > 0) {
    calorieGoal = parseInt(tdeeData[tdeeData.length - 1].value);
  }
  
  // Set macronutrient goals (approximate distribution: 30% protein, 45% carbs, 25% fat)
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4); // 4 calories per gram of protein
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4); // 4 calories per gram of carbs
  const fatGoal = Math.round((calorieGoal * 0.25) / 9); // 9 calories per gram of fat
  
  // Update UI
  document.getElementById('protein-goal').textContent = proteinGoal;
  document.getElementById('carbs-goal').textContent = carbsGoal;
  document.getElementById('fat-goal').textContent = fatGoal;
  
  // Store goals in sessionStorage for easy access
  sessionStorage.setItem('nutritionGoals', JSON.stringify({
    calories: calorieGoal,
    protein: proteinGoal,
    carbs: carbsGoal,
    fat: fatGoal
  }));
  
  // Update calorie circle
  updateCalorieCircle(0, calorieGoal);
}

// Function to update calorie circle
function updateCalorieCircle(consumed, goal) {
  const circle = document.getElementById('calorie-progress');
  const caloriesConsumedElement = document.getElementById('calories-consumed');
  
  if (!circle || !caloriesConsumedElement) return;
  
  // Update consumed calories text
  caloriesConsumedElement.textContent = consumed;
  
  // Calculate percentage and update circle
  const percentage = Math.min(consumed / goal, 1);
  const circumference = 2 * Math.PI * 70; // 70 is the radius of the circle
  const offset = circumference * (1 - percentage);
  
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = offset;
  
  // Change color based on percentage
  if (percentage > 1) {
    circle.style.stroke = '#F44336'; // Red if over goal
  } else if (percentage > 0.9) {
    circle.style.stroke = '#FFC107'; // Yellow if close to goal
  } else {
    circle.style.stroke = '#4CAF50'; // Green otherwise
  }
}

// Function to load saved food data
function loadFoodData() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get food data for today
  const foodData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_food_${today}`) || '{}');
  
  // Initialize totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  // Process each meal
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
    const mealItems = foodData[meal] || [];
    const mealContainer = document.getElementById(`${meal}-items`);
    
    if (mealContainer) {
      if (mealItems.length > 0) {
        // Clear "No foods logged yet" message
        mealContainer.innerHTML = '';
        
        // Add each food item
        mealItems.forEach(food => {
          addFoodItemToUI(mealContainer, food, meal);
          
          // Add to totals
          totalCalories += food.calories;
          totalProtein += food.protein;
          totalCarbs += food.carbs;
          totalFat += food.fat;
        });
      }
    }
  });
  
  // Update nutrition summary
  updateNutritionSummary(totalCalories, totalProtein, totalCarbs, totalFat);
}

// Function to update nutrition summary
function updateNutritionSummary(calories, protein, carbs, fat) {
  // Get nutrition goals
  const goals = JSON.parse(sessionStorage.getItem('nutritionGoals') || '{}');
  
  // Update calorie circle
  updateCalorieCircle(calories, goals.calories || 2000);
  
  // Update macronutrient values
  document.getElementById('protein-value').textContent = protein;
  document.getElementById('carbs-value').textContent = carbs;
  document.getElementById('fat-value').textContent = fat;
  
  // Update progress bars
  const proteinPercentage = Math.min(protein / (goals.protein || 150) * 100, 100);
  const carbsPercentage = Math.min(carbs / (goals.carbs || 225) * 100, 100);
  const fatPercentage = Math.min(fat / (goals.fat || 55) * 100, 100);
  
  document.getElementById('protein-progress').style.width = `${proteinPercentage}%`;
  document.getElementById('carbs-progress').style.width = `${carbsPercentage}%`;
  document.getElementById('fat-progress').style.width = `${fatPercentage}%`;
}

// Function to add food item to UI
function addFoodItemToUI(container, food, meal) {
  const foodItem = document.createElement('div');
  foodItem.className = 'food-item';
  foodItem.dataset.id = food.id;
  
  foodItem.innerHTML = `
    <div class="food-info">
      <div class="food-name">${food.name}</div>
      <div class="food-details">${food.serving} | P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g</div>
    </div>
    <div class="food-calories">${food.calories} kcal</div>
    <div class="food-actions">
      <button class="edit-food" data-meal="${meal}" data-id="${food.id}"><i class="fas fa-edit"></i></button>
      <button class="delete-food" data-meal="${meal}" data-id="${food.id}"><i class="fas fa-trash"></i></button>
    </div>
  `;
  
  container.appendChild(foodItem);
  
  // Add event listeners for edit and delete buttons
  const editBtn = foodItem.querySelector('.edit-food');
  const deleteBtn = foodItem.querySelector('.delete-food');
  
  editBtn.addEventListener('click', function() {
    const foodId = this.getAttribute('data-id');
    const meal = this.getAttribute('data-meal');
    editFoodItem(foodId, meal);
  });
  
  deleteBtn.addEventListener('click', function() {
    const foodId = this.getAttribute('data-id');
    const meal = this.getAttribute('data-meal');
    deleteFoodItem(foodId, meal);
  });
}

// Function to initialize add food modal
function initAddFoodModal() {
  const modal = document.getElementById('add-food-modal');
  const closeBtn = document.querySelector('.close-modal');
  const addFoodBtn = document.getElementById('add-food-btn');
  const searchBtn = document.getElementById('modal-search-btn');
  
  // Close modal when clicking the close button
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside the modal content
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Add food button functionality
  if (addFoodBtn) {
    addFoodBtn.addEventListener('click', function() {
      addFoodToMeal();
    });
  }
  
  // Search button functionality
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      searchFood();
    });
  }
}

// Function to open add food modal
function openAddFoodModal(meal) {
  const modal = document.getElementById('add-food-modal');
  const mealTitle = document.getElementById('meal-title');
  
  if (modal && mealTitle) {
    // Set meal title
    mealTitle.textContent = meal.charAt(0).toUpperCase() + meal.slice(1);
    
    // Store current meal in data attribute
    modal.dataset.meal = meal;
    
    // Clear previous inputs
    document.getElementById('modal-food-search').value = '';
    document.getElementById('food-name').value = '';
    document.getElementById('food-calories').value = '';
    document.getElementById('food-protein').value = '';
    document.getElementById('food-carbs').value = '';
    document.getElementById('food-fat').value = '';
    document.getElementById('food-serving').value = '';
    
    // Clear search results
    document.getElementById('modal-search-results').innerHTML = '';
    
    // Show modal
    modal.style.display = 'block';
  }
}

// Function to search for food
function searchFood() {
  const searchInput = document.getElementById('modal-food-search').value.trim();
  const resultsContainer = document.getElementById('modal-search-results');
  
  if (!searchInput || !resultsContainer) return;
  
  // In a real app, this would call a food database API
  // For this demo, we'll use some sample data
  const sampleFoods = [
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
    { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9, serving: '100g' },
    { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, serving: '100g' },
    { name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13, serving: '100g' },
    { name: 'Egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, serving: '1 large' },
    { name: 'Apple', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, serving: '100g' },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving: '100g' },
    { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, serving: '100g' },
    { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: '100g' },
    { name: 'Almonds', calories: 579, protein: 21, carbs: 21.6, fat: 49.9, serving: '100g' }
  ];
  
  // Filter foods based on search input
  const filteredFoods = sampleFoods.filter(food => 
    food.name.toLowerCase().includes(searchInput.toLowerCase())
  );
  
  // Display results
  if (filteredFoods.length > 0) {
    resultsContainer.innerHTML = '';
    
    filteredFoods.forEach(food => {
      const foodItem = document.createElement('div');
      foodItem.className = 'search-result-item';
      foodItem.innerHTML = `
        <div>${food.name} (${food.serving})</div>
        <div>${food.calories} kcal | P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g</div>
      `;
      
      foodItem.addEventListener('click', function() {
        // Fill in the form with the selected food
        document.getElementById('food-name').value = food.name;
        document.getElementById('food-calories').value = food.calories;
        document.getElementById('food-protein').value = food.protein;
        document.getElementById('food-carbs').value = food.carbs;
        document.getElementById('food-fat').value = food.fat;
        document.getElementById('food-serving').value = food.serving;
      });
      
      resultsContainer.appendChild(foodItem);
    });
  } else {
    resultsContainer.innerHTML = '<div class="search-result-item">No foods found. Try a different search term or add a custom food.</div>';
  }
}

// Function to add food to meal
function addFoodToMeal() {
  const modal = document.getElementById('add-food-modal');
  const meal = modal.dataset.meal;
  
  // Get food details from form
  const name = document.getElementById('food-name').value.trim();
  const calories = parseInt(document.getElementById('food-calories').value) || 0;
  const protein = parseFloat(document.getElementById('food-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('food-carbs').value) || 0;
  const fat = parseFloat(document.getElementById('food-fat').value) || 0;
  const serving = document.getElementById('food-serving').value.trim() || 'serving';
  
  // Validate inputs
  if (!name || calories === 0) {
    alert('Please enter at least a food name and calories');
    return;
  }
  
  // Create food object
  const food = {
    id: Date.now().toString(),
    name,
    calories,
    protein,
    carbs,
    fat,
    serving
  };
  
  // Save to localStorage
  saveFoodToStorage(food, meal);
  
  // Add to UI
  const mealContainer = document.getElementById(`${meal}-items`);
  if (mealContainer) {
    // Clear "No foods logged yet" message if it exists
    if (mealContainer.querySelector('.empty-meal')) {
      mealContainer.innerHTML = '';
    }
    
    addFoodItemToUI(mealContainer, food, meal);
  }
  
  // Update nutrition summary
  updateNutritionSummaryFromStorage();
  
  // Close modal
  modal.style.display = 'none';
}

// Function to save food to localStorage
function saveFoodToStorage(food, meal) {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get existing food data
  const foodData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_food_${today}`) || '{}');
  
  // Initialize meal array if it doesn't exist
  if (!foodData[meal]) {
    foodData[meal] = [];
  }
  
  // Add new food
  foodData[meal].push(food);
  
  // Save back to localStorage
  localStorage.setItem(`user_${currentUser.id}_food_${today}`, JSON.stringify(foodData));
}

// Function to update nutrition summary from storage
function updateNutritionSummaryFromStorage() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get food data for today
  const foodData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_food_${today}`) || '{}');
  
  // Calculate totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  // Process each meal
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
    const mealItems = foodData[meal] || [];
    
    mealItems.forEach(food => {
      totalCalories += food.calories;
      totalProtein += food.protein;
      totalCarbs += food.carbs;
      totalFat += food.fat;
    });
  });
  
  // Update nutrition summary
  updateNutritionSummary(totalCalories, totalProtein, totalCarbs, totalFat);
}

// Function to edit food item
function editFoodItem(foodId, meal) {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get food data for today
  const foodData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_food_${today}`) || '{}');
  
  // Find the food item
  const mealItems = foodData[meal] || [];
  const foodIndex = mealItems.findIndex(item => item.id === foodId);
  
  if (foodIndex !== -1) {
    const food = mealItems[foodIndex];
    
    // Open modal
    const modal = document.getElementById('add-food-modal');
    const mealTitle = document.getElementById('meal-title');
    
    if (modal && mealTitle) {
      // Set meal title
      mealTitle.textContent = meal.charAt(0).toUpperCase() + meal.slice(1);
      
      // Store current meal and food ID in data attributes
      modal.dataset.meal = meal;
      modal.dataset.editId = foodId;
      
      // Fill form with food data
      document.getElementById('food-name').value = food.name;
      document.getElementById('food-calories').value = food.calories;
      document.getElementById('food-protein').value = food.protein;
      document.getElementById('food-carbs').value = food.carbs;
      document.getElementById('food-fat').value = food.fat;
      document.getElementById('food-serving').value = food.serving;
      
      // Clear search results
      document.getElementById('modal-search-results').innerHTML = '';
      
      // Show modal
      modal.style.display = 'block';
    }
  }
}

// Function to delete food item
function deleteFoodItem(foodId, meal) {
  if (confirm('Are you sure you want to delete this food item?')) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) return;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get food data for today
    const foodData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_food_${today}`) || '{}');
    
    // Find and remove the food item
    const mealItems = foodData[meal] || [];
    const foodIndex = mealItems.findIndex(item => item.id === foodId);
    
    if (foodIndex !== -1) {
      mealItems.splice(foodIndex, 1);
      foodData[meal] = mealItems;
      
      // Save back to localStorage
      localStorage.setItem(`user_${currentUser.id}_food_${today}`, JSON.stringify(foodData));
      
      // Update UI
      const foodElement = document.querySelector(`.food-item[data-id="${foodId}"]`);
      if (foodElement) {
        foodElement.remove();
      }
      
      // If no more food items in this meal, show "No foods logged yet" message
      const mealContainer = document.getElementById(`${meal}-items`);
      if (mealContainer && mealContainer.children.length === 0) {
        mealContainer.innerHTML = '<p class="empty-meal">No foods logged yet</p>';
      }
      
      // Update nutrition summary
      updateNutritionSummaryFromStorage();
    }
  }
}

// Function to initialize meal plan
function initMealPlan() {
  const generateBtn = document.getElementById('generate-meal-plan');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateMealPlan);
  }
}

// Function to generate meal plan
function generateMealPlan() {
  const goal = document.getElementById('meal-plan-goal').value;
  const dietType = document.getElementById('meal-plan-diet').value;
  const allergies = document.getElementById('meal-plan-allergies').value.split(',').map(item => item.trim()).filter(item => item);
  
  const mealPlanContainer = document.getElementById('meal-plan-container');
  if (!mealPlanContainer) return;
  
  // Show loading state
  mealPlanContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Generating your meal plan...</div>';
  
  // In a real app, this would call an API to generate a meal plan
  // For this demo, we'll use some sample data
  setTimeout(() => {
    const mealPlan = generateSampleMealPlan(goal, dietType, allergies);
    displayMealPlan(mealPlan);
  }, 1500);
}

// Function to generate sample meal plan
function generateSampleMealPlan(goal, dietType, allergies) {
  // Sample meal plans based on goals and diet types
  const mealPlans = {
    'weight-loss': {
      'regular': {
        calories: 1500,
        meals: [
          { name: 'Breakfast', foods: ['Oatmeal with berries', 'Greek yogurt', 'Coffee'] },
          { name: 'Lunch', foods: ['Grilled chicken salad', 'Whole grain bread', 'Apple'] },
          { name: 'Dinner', foods: ['Baked salmon', 'Steamed broccoli', 'Quinoa'] },
          { name: 'Snacks', foods: ['Almonds', 'Protein shake'] }
        ]
      },
      'vegetarian': {
        calories: 1500,
        meals: [
          { name: 'Breakfast', foods: ['Oatmeal with berries', 'Greek yogurt', 'Coffee'] },
          { name: 'Lunch', foods: ['Lentil soup', 'Whole grain bread', 'Apple'] },
          { name: 'Dinner', foods: ['Tofu stir-fry', 'Brown rice', 'Steamed vegetables'] },
          { name: 'Snacks', foods: ['Almonds', 'Protein shake'] }
        ]
      },
      'vegan': {
        calories: 1500,
        meals: [
          { name: 'Breakfast', foods: ['Oatmeal with berries', 'Almond milk', 'Coffee'] },
          { name: 'Lunch', foods: ['Lentil soup', 'Whole grain bread', 'Apple'] },
          { name: 'Dinner', foods: ['Tofu stir-fry', 'Brown rice', 'Steamed vegetables'] },
          { name: 'Snacks', foods: ['Almonds', 'Plant-based protein shake'] }
        ]
      }
    },
    'weight-gain': {
      'regular': {
        calories: 2800,
        meals: [
          { name: 'Breakfast', foods: ['Eggs with toast', 'Avocado', 'Protein shake'] },
          { name: 'Lunch', foods: ['Chicken and rice bowl', 'Mixed vegetables', 'Fruit smoothie'] },
          { name: 'Dinner', foods: ['Steak', 'Sweet potato', 'Asparagus', 'Whole milk'] },
          { name: 'Snacks', foods: ['Trail mix', 'Peanut butter sandwich', 'Protein bar'] }
        ]
      }
    }
  };
  
  // Default meal plan if specific combination not found
  const defaultMealPlan = {
    calories: 2000,
    meals: [
      { name: 'Breakfast', foods: ['Oatmeal with fruit', 'Eggs', 'Coffee'] },
      { name: 'Lunch', foods: ['Sandwich', 'Salad', 'Apple'] },
      { name: 'Dinner', foods: ['Protein of choice', 'Vegetables', 'Rice or potato'] },
      { name: 'Snacks', foods: ['Nuts', 'Yogurt', 'Fruit'] }
    ]
  };
  
  // Get meal plan based on goal and diet type
  let mealPlan = mealPlans[goal]?.[dietType] || defaultMealPlan;
  
  // Filter out allergies if any
  if (allergies.length > 0) {
    mealPlan = JSON.parse(JSON.stringify(mealPlan)); // Deep clone
    mealPlan.meals.forEach(meal => {
      meal.foods = meal.foods.filter(food => 
        !allergies.some(allergy => 
          food.toLowerCase().includes(allergy.toLowerCase())
        )
      );
    });
  }
  
  return mealPlan;
}

// Function to display meal plan
function displayMealPlan(mealPlan) {
  const mealPlanContainer = document.getElementById('meal-plan-container');
  if (!mealPlanContainer) return;
  
  mealPlanContainer.innerHTML = `
    <div class="card meal-plan">
      <div class="card-header">
        <h2 class="card-title">Your Personalized Meal Plan</h2>
        <p>Total calories: ${mealPlan.calories} kcal</p>
      </div>
      <div class="meal-plan-content">
        ${mealPlan.meals.map(meal => `
          <div class="meal-plan-section">
            <h3>${meal.name}</h3>
            <ul>
              ${meal.foods.map(food => `<li>${food}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      <div class="card-footer">
        <button id="save-meal-plan" class="btn btn-primary">Save Meal Plan</button>
        <button id="print-meal-plan" class="btn btn-outline">Print</button>
      </div>
    </div>
  `;
  
  // Add event listeners for save and print buttons
  const saveBtn = document.getElementById('save-meal-plan');
  const printBtn = document.getElementById('print-meal-plan');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      alert('Meal plan saved successfully!');
    });
  }
  
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      window.print();
    });
  }
}

// Function to initialize nutrition info search
function initNutritionSearch() {
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', searchNutritionInfo);
  }
  
  // Add event listener for enter key in search input
  const searchInput = document.getElementById('food-search');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchNutritionInfo();
      }
    });
  }
}

// Function to search nutrition info
function searchNutritionInfo() {
  const searchInput = document.getElementById('food-search').value.trim();
  const resultsContainer = document.getElementById('search-results');
  const nutritionDetails = document.getElementById('nutrition-details');
  
  if (!searchInput || !resultsContainer || !nutritionDetails) return;
  
  // Show loading state
  resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
  
  // In a real app, this would call a food database API
  // For this demo, we'll use some sample data
  setTimeout(() => {
    const sampleFoods = [
      { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
      { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9, serving: '100g' },
      { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, serving: '100g' },
      { name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13, serving: '100g' },
      { name: 'Egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, serving: '1 large' },
      { name: 'Apple', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, serving: '100g' },
      { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving: '100g' },
      { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, serving: '100g' },
      { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: '100g' },
      { name: 'Almonds', calories: 579, protein: 21, carbs: 21.6, fat: 49.9, serving: '100g' }
    ];
    
    // Filter foods based on search input
    const filteredFoods = sampleFoods.filter(food => 
      food.name.toLowerCase().includes(searchInput.toLowerCase())
    );
    
    // Display results
    if (filteredFoods.length > 0) {
      resultsContainer.innerHTML = '';
      
      filteredFoods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'search-result-item';
        foodItem.innerHTML = `
          <div>${food.name} (${food.serving})</div>
          <div>${food.calories} kcal</div>
        `;
        
        foodItem.addEventListener('click', function() {
          displayNutritionDetails(food);
        });
        
        resultsContainer.appendChild(foodItem);
      });
    } else {
      resultsContainer.innerHTML = '<div class="search-result-item">No foods found. Try a different search term.</div>';
    }
  }, 500);
}

// Function to display nutrition details
function displayNutritionDetails(food) {
  const nutritionDetails = document.getElementById('nutrition-details');
  if (!nutritionDetails) return;
  
  nutritionDetails.innerHTML = `
    <h3>${food.name}</h3>
    <p>Serving size: ${food.serving}</p>
    <div class="nutrition-facts">
      <div class="nutrition-fact">
        <div class="fact-label">Calories</div>
        <div class="fact-value">${food.calories}</div>
      </div>
      <div class="nutrition-fact">
        <div class="fact-label">Protein</div>
        <div class="fact-value">${food.protein}g</div>
      </div>
      <div class="nutrition-fact">
        <div class="fact-label">Carbs</div>
        <div class="fact-value">${food.carbs}g</div>
      </div>
      <div class="nutrition-fact">
        <div class="fact-label">Fat</div>
        <div class="fact-value">${food.fat}g</div>
      </div>
    </div>
    <button id="add-to-meal" class="btn btn-primary">Add to Today's Log</button>
  `;
  
  // Add event listener for add to meal button
  const addToMealBtn = document.getElementById('add-to-meal');
  if (addToMealBtn) {
    addToMealBtn.addEventListener('click', function() {
      openAddFoodModal('breakfast');
      
      // Pre-fill form with food data
      document.getElementById('food-name').value = food.name;
      document.getElementById('food-calories').value = food.calories;
      document.getElementById('food-protein').value = food.protein;
      document.getElementById('food-carbs').value = food.carbs;
      document.getElementById('food-fat').value = food.fat;
      document.getElementById('food-serving').value = food.serving;
    });
  }
}