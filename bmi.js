// Function to calculate BMI
function calculateBMI() {
   const height = parseFloat(document.getElementById('bmi-height').value);
   const weight = parseFloat(document.getElementById('bmi-weight').value);
   const age = parseFloat(document.getElementById('bmi-age').value);
   const gender = document.getElementById('bmi-gender').value;
   const unit = document.getElementById('bmi-unit').value;
   const resultElement = document.getElementById('bmi-result');
   const commentElement = document.getElementById('bmi-comment');
   
   if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
     alert('Please enter valid height and weight values.');
     return;
   }
   
   // Convert to metric if imperial
   let heightInM, weightInKg;
   if (unit === 'metric') {
     heightInM = height / 100; // cm to m
     weightInKg = weight;
   } else {
     heightInM = height * 0.0254; // inches to m
     weightInKg = weight * 0.453592; // lbs to kg
   }
   
   // Calculate BMI
   const bmi = weightInKg / (heightInM * heightInM);
   
   // Update result display
   resultElement.textContent = bmi.toFixed(2);
   
   // Update dashboard if it exists
   const dashboardBMI = document.getElementById('dashboard-bmi');
   if (dashboardBMI) {
     dashboardBMI.textContent = bmi.toFixed(2);
   }
   
   // Set BMI category and comment
   const category = getBMICategory(bmi);
   commentElement.textContent = `Category: ${category}`;
   
   const bmiStatus = document.getElementById('bmi-status');
   if (bmiStatus) {
     bmiStatus.textContent = category;
   }
   
   // Save to database/localStorage if needed
   saveCalculationResult('bmi', bmi.toFixed(2));
   
   // Show the result section if it's hidden
   const resultSection = document.querySelector('.calculator-result');
   if (resultSection) {
     resultSection.style.display = 'block';
   }
 }
 
 // Function to get BMI category
 function getBMICategory(bmi) {
   if (bmi < 18.5) return 'Underweight';
   if (bmi >= 18.5 && bmi < 25) return 'Normal weight';
   if (bmi >= 25 && bmi < 30) return 'Overweight';
   return 'Obese';
 }
 
 // Function to display "No Data" message in charts
 function displayNoDataMessage(ctx, message) {
   if (typeof ctx === 'object' && ctx.canvas) {
     ctx = ctx.canvas.getContext('2d');
   }
   
   // Clear the canvas
   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   
   // Set text properties
   ctx.textAlign = 'center';
   ctx.textBaseline = 'middle';
   ctx.font = '14px Arial';
   ctx.fillStyle = '#999';
   
   // Draw the message
   ctx.fillText(message || 'No Data Available', ctx.canvas.width / 2, ctx.canvas.height / 2);
 }
 
 // Function to check if this is the first login
 function checkIfFirstLogin() {
   // Get the current user from session storage
   const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
   
   // Check if the user has a firstLogin flag
   if (currentUser.id) {
     // Check if we've recorded this user's first visit
     const firstLoginFlag = localStorage.getItem(`user_${currentUser.id}_first_login`);
     
     if (!firstLoginFlag) {
       // Set the flag for future visits
       localStorage.setItem(`user_${currentUser.id}_first_login`, 'false');
       return true;
     }
     return false;
   }
   
   // Default to true if we can't determine
   return true;
 }
 
 // Function to navigate to calculator
 function navigateToCalculator() {
   window.location.href = 'calculators.html';
 }
 
 // Function to save calculation results to database and localStorage
 function saveCalculationResult(type, value) {
   // Get current user if available
   const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
 
   // If we have a user, save to their profile
   if (currentUser.id) {
     // Save to localStorage
     const key = `user_${currentUser.id}_${type}`;
     const data = {
       value: value,
       date: new Date().toISOString()
     };
 
     // Get existing data or create new array
     const existingData = JSON.parse(localStorage.getItem(key) || '[]');
     existingData.push(data);
 
     // Save updated data
     localStorage.setItem(key, JSON.stringify(existingData));
 
     // Update hasUserData flag to true
     localStorage.setItem(`user_${currentUser.id}_hasData`, 'true');
 
     // Update dashboard if we're on the dashboard page
     if (window.location.href.includes('dashboard')) {
       // Update the dashboard display
       const dashboardElement = document.getElementById(`dashboard-${type}`);
       if (dashboardElement) {
         dashboardElement.textContent = type === 'bodyfat' ? `${value}%` : value;
       }
 
       // Update charts
       updateDashboardCharts();
     }
   }
 }
 
 // Water Intake Calculator
 function calculateWaterIntake() {
   const weight = parseFloat(document.getElementById('water-weight').value);
   const activity = document.getElementById('water-activity').value;
   const climate = document.getElementById('water-climate').value;
   const unit = document.getElementById('water-unit').value;
   const resultElement = document.getElementById('water-result');
   const commentElement = document.getElementById('water-comment');
   const glassesCount = document.getElementById('water-glasses-count');
   const waterFill = document.querySelector('.water-fill');
 
   if (isNaN(weight) || weight <= 0) {
     alert('Please enter a valid weight.');
     return;
   }
 
   // Convert weight to kg if in imperial
   let weightInKg = weight;
   if (unit === 'imperial') {
     weightInKg = weight * 0.453592;
   }
 
   // Base calculation: 30ml per kg of body weight
   let waterIntake = weightInKg * 30;
 
   // Adjust for activity level
   const activityMultipliers = {
     'sedentary': 1,
     'light': 1.1,
     'moderate': 1.2,
     'active': 1.3,
     'very-active': 1.4
   };
   waterIntake *= activityMultipliers[activity] || 1;
 
   // Adjust for climate
   const climateMultipliers = {
     'moderate': 1,
     'hot': 1.2,
     'humid': 1.15,
     'cold': 0.95
   };
   waterIntake *= climateMultipliers[climate] || 1;
 
   // Round to nearest 50ml
   waterIntake = Math.round(waterIntake / 50) * 50;
 
   // Update result display
   resultElement.textContent = `${waterIntake} ml`;
   
   // Calculate glasses (250ml each)
   const glasses = Math.round(waterIntake / 250);
   if (glassesCount) {
     glassesCount.textContent = glasses;
   }
   
   // Update water bottle fill visualization
   if (waterFill) {
     // Max height is 100%, calculate percentage based on recommended daily intake
     // Assuming 3000ml is 100% full
     const fillPercentage = Math.min(100, (waterIntake / 3000) * 100);
     waterFill.style.height = `${fillPercentage}%`;
   }
   
   // Set comment based on intake
   if (commentElement) {
     if (waterIntake < 1500) {
       commentElement.textContent = "This seems low. Make sure to stay hydrated!";
     } else if (waterIntake > 4000) {
       commentElement.textContent = "This is quite high. Consult with a healthcare provider.";
     } else {
       commentElement.textContent = "This is a good target for optimal hydration.";
     }
   }
   
   // Update dashboard water intake display
   const dashboardWater = document.getElementById('dashboard-water');
   if (dashboardWater) {
     dashboardWater.textContent = waterIntake;
   }
   
   // Save water intake data
   saveCalculationResult('water', waterIntake);
   
   // Show the result section if it's hidden
   const resultSection = document.querySelector('#water-tab .calculator-result');
   if (resultSection) {
     resultSection.style.display = 'block';
   }
   
   // Update recommendations based on water intake
   updateWaterRecommendations(waterIntake);
 }
 
 // Function to update water recommendations
 function updateWaterRecommendations(waterIntake) {
   const recommendationsContent = document.getElementById('recommendations-content');
   if (!recommendationsContent) return;
   
   let waterRecommendation = '';
   
   if (waterIntake < 2000) {
     waterRecommendation = '<p>🚰 <strong>Hydration Alert:</strong> Your water intake is below recommended levels. Try to drink at least 2000ml of water daily.</p>';
   } else {
     waterRecommendation = '<p>🚰 <strong>Good Hydration:</strong> You\'re doing well with your water intake. Keep it up!</p>';
   }
   
   // Get existing content
   let content = recommendationsContent.innerHTML;
   
   // Check if there's already a water recommendation
   if (content.includes('Hydration Alert') || content.includes('Good Hydration')) {
     // Replace existing water recommendation
     content = content.replace(/<p>🚰.*?<\/p>/, waterRecommendation);
   } else {
     // Add new water recommendation
     content += waterRecommendation;
   }
   
   recommendationsContent.innerHTML = content;
 }
 
 // Function to save weight data
 function saveWeightData(weight, unit = 'kg') {
   // Convert to kg if in pounds
   let weightInKg = weight;
   if (unit === 'lbs' || unit === 'imperial') {
     weightInKg = weight * 0.453592;
   }
 
   // Save to localStorage
   saveCalculationResult('weight', weightInKg);
 }
 
 // Function to save body fat data
 function saveBodyFatData(bodyFat) {
   // Save to localStorage
   saveCalculationResult('bodyfat', bodyFat);
 }
 
 // Function to calculate body fat percentage
 function calculateBodyFat() {
   const gender = document.getElementById('bodyfat-gender').value;
   const age = parseFloat(document.getElementById('bodyfat-age').value);
   const height = parseFloat(document.getElementById('bodyfat-height').value);
   const weight = parseFloat(document.getElementById('bodyfat-weight').value);
   const neck = parseFloat(document.getElementById('bodyfat-neck').value);
   const waist = parseFloat(document.getElementById('bodyfat-waist').value);
   const hip = gender === 'female' ? parseFloat(document.getElementById('bodyfat-hip').value) : 0;
   const unit = document.getElementById('bodyfat-unit').value;
   const resultElement = document.getElementById('bodyfat-result');
   const commentElement = document.getElementById('bodyfat-comment');
 
   if (isNaN(age) || isNaN(height) || isNaN(weight) || isNaN(neck) || isNaN(waist) || 
       (gender === 'female' && isNaN(hip))) {
     resultElement.textContent = "Please enter valid values";
     commentElement.textContent = "";
     return;
   }
 
   // Convert to cm/kg if in imperial
   let heightInCm = height;
   let weightInKg = weight;
   let neckInCm = neck;
   let waistInCm = waist;
   let hipInCm = hip;
 
   if (unit === 'imperial') {
     heightInCm = height * 2.54;
     weightInKg = weight * 0.453592;
     neckInCm = neck * 2.54;
     waistInCm = waist * 2.54;
     hipInCm = hip * 2.54;
   }
 
   // Calculate body fat percentage using U.S. Navy method
   let bodyFat;
   if (gender === 'male') {
     bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waistInCm - neckInCm) + 0.15456 * Math.log10(heightInCm)) - 450;
   } else {
     bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waistInCm + hipInCm - neckInCm) + 0.22100 * Math.log10(heightInCm)) - 450;
   }
 
   // Ensure body fat is within reasonable range
   bodyFat = Math.max(3, Math.min(bodyFat, 50));
 
   // Update result display
   resultElement.textContent = bodyFat.toFixed(1) + "%";
 
   // Set comment based on gender and body fat percentage
   let category;
   if (gender === 'male') {
     if (bodyFat < 6) category = "Essential fat";
     else if (bodyFat < 14) category = "Athletic";
     else if (bodyFat < 18) category = "Fitness";
     else if (bodyFat < 25) category = "Average";
     else category = "Obese";
   } else {
     if (bodyFat < 14) category = "Essential fat";
     else if (bodyFat < 21) category = "Athletic";
     else if (bodyFat < 25) category = "Fitness";
     else if (bodyFat < 32) category = "Average";
     else category = "Obese";
   }
 
   commentElement.textContent = `Category: ${category}`;
 
   // Save weight and body fat data
   saveWeightData(weightInKg);
   saveBodyFatData(bodyFat);
 
   // Show the result section if it's hidden
   const resultSection = document.querySelector('#bodyfat-tab .calculator-result');
   if (resultSection) {
     resultSection.style.display = 'block';
   }
 }
 
 // Function to update dashboard charts with user data
 function updateDashboardCharts() {
   const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
   if (!currentUser.id) return;
   
   // Get weight chart context
   const weightChartCtx = document.getElementById('weightChart');
   // Get health chart context
   const healthChartCtx = document.getElementById('healthChart');
   
   if (!weightChartCtx && !healthChartCtx) return;
   
   // Get BMI data
   const bmiData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_bmi`) || '[]');
   
   // Get water intake data
   const waterData = JSON.parse(localStorage.getItem(`user_${currentUser.id}_water`) || '[]');
   
   // Process data for charts
   const allDates = new Set();
   const dateValueMap = {
     bmi: {},
     water: {}
   };
   
   // Process BMI data
   bmiData.slice(-7).forEach(entry => {
     const dateStr = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
     allDates.add(dateStr);
     dateValueMap.bmi[dateStr] = parseFloat(entry.value);
   });
   
   // Process water data
   waterData.slice(-7).forEach(entry => {
     const dateStr = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
     allDates.add(dateStr);
     dateValueMap.water[dateStr] = parseFloat(entry.value);
   });
   
   // Convert set to sorted array
   const dates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
   
   // Create arrays for chart data
   const bmiValues = dates.map(date => dateValueMap.bmi[date] || null);
   const waterValues = dates.map(date => dateValueMap.water[date] || null);
   
   // If we have data, update the charts
   if (dates.length > 0) {
     // Update BMI chart
     if (weightChartCtx) {
       if (window.weightChart) {
         window.weightChart.destroy();
       }
       
       if (bmiValues.some(value => value !== null)) {
         window.weightChart = new Chart(weightChartCtx.getContext('2d'), {
           type: 'line',
           data: {
             labels: dates,
             datasets: [{
               label: 'BMI',
               data: bmiValues,
               borderColor: 'rgba(75, 192, 192, 1)',
               backgroundColor: 'rgba(75, 192, 192, 0.2)',
               fill: true,
               tension: 0.4
             }]
           },
           options: {
             responsive: true,
             plugins: {
               legend: { position: 'top' },
               title: { display: true, text: 'BMI Trend' }
             },
             scales: {
               x: { display: true, title: { display: true, text: 'Date' } },
               y: { display: true, title: { display: true, text: 'BMI' } }
             }
           }
         });
       } else {
         displayNoDataMessage(weightChartCtx, 'No BMI Data Available');
       }
     }
     
     // Update water chart
     if (healthChartCtx) {
       if (window.healthChart) {
         window.healthChart.destroy();
       }
       
       if (waterValues.some(value => value !== null)) {
         window.healthChart = new Chart(healthChartCtx.getContext('2d'), {
           type: 'bar',
           data: {
             labels: dates,
             datasets: [{
               label: 'Water Intake (ml)',
               data: waterValues,
               backgroundColor: 'rgba(54, 162, 235, 0.2)',
               borderColor: 'rgba(54, 162, 235, 1)',
               borderWidth: 1
             }]
           },
           options: {
             responsive: true,
             plugins: {
               legend: { position: 'top' },
               title: { display: true, text: 'Water Intake' }
             },
             scales: {
               x: { display: true, title: { display: true, text: 'Date' } },
               y: { display: true, title: { display: true, text: 'Water (ml)' } }
             }
           }
         });
         
         // Update water recommendations based on latest water intake
         if (waterValues[waterValues.length - 1] !== null) {
           updateWaterRecommendations(waterValues[waterValues.length - 1]);
         }
       } else {
         displayNoDataMessage(healthChartCtx, 'No Water Intake Data Available');
       }
     }
   } else {
     // Display "No Data" message if there's no data
     if (weightChartCtx) displayNoDataMessage(weightChartCtx, 'No BMI Data Available');
     if (healthChartCtx) displayNoDataMessage(healthChartCtx, 'No Water Intake Data Available');
   }
 }
 
 // Function to calculate BMR (Basal Metabolic Rate)
 function calculateBMR() {
   const height = parseFloat(document.getElementById('bmr-height').value);
   const weight = parseFloat(document.getElementById('bmr-weight').value);
   const age = parseFloat(document.getElementById('bmr-age').value);
   const gender = document.getElementById('bmr-gender').value;
   const activityLevel = document.getElementById('bmr-activity').value;
   const unit = document.getElementById('bmr-unit').value;
   const resultElement = document.getElementById('bmr-result');
   const tdeeElement = document.getElementById('tdee-result');
   const commentElement = document.getElementById('bmr-comment');
   
   if (isNaN(height) || isNaN(weight) || isNaN(age) || height <= 0 || weight <= 0 || age <= 0) {
     alert('Please enter valid height, weight, and age values.');
     return;
   }
   
   // Convert to metric if imperial
   let heightInCm, weightInKg;
   if (unit === 'metric') {
     heightInCm = height;
     weightInKg = weight;
   } else {
     heightInCm = height * 2.54; // inches to cm
     weightInKg = weight * 0.453592; // lbs to kg
   }
   
   // Calculate BMR using Mifflin-St Jeor Equation
   let bmr;
   if (gender === 'male') {
     bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
   } else {
     bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
   }
   
   // Calculate TDEE (Total Daily Energy Expenditure)
   const activityMultipliers = {
     'sedentary': 1.2,
     'light': 1.375,
     'moderate': 1.55,
     'active': 1.725,
     'very-active': 1.9
   };
   
   const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
   
   // Update result display
   resultElement.textContent = Math.round(bmr) + " calories";
   tdeeElement.textContent = tdee + " calories";
   
   // Set comment based on gender and age
   let comment = "This is your estimated Basal Metabolic Rate (BMR) - the calories your body needs at complete rest.";
   commentElement.textContent = comment;
   
   // Save to database/localStorage
   saveCalculationResult('bmr', Math.round(bmr));
   saveCalculationResult('tdee', tdee);
   
   // Show the result section if it's hidden
   const resultSection = document.querySelector('#bmr-tab .calculator-result');
   if (resultSection) {
     resultSection.style.display = 'block';
   }
 }
 
 // Function to calculate ideal weight
 function calculateIdealWeight() {
   const gender = document.getElementById('idealweight-gender').value;
   const height = parseFloat(document.getElementById('idealweight-height').value);
   const unit = document.getElementById('idealweight-unit').value;
   const resultElement = document.getElementById('idealweight-result');
   const commentElement = document.getElementById('idealweight-comment');
   
   if (isNaN(height) || height <= 0) {
     alert('Please enter a valid height.');
     return;
   }
   
   // Convert to cm if in imperial
   let heightInCm = height;
   if (unit === 'imperial') {
     heightInCm = height * 2.54; // inches to cm
   }
   
   // Calculate ideal weight using different formulas
   let hamwi, devine, robinson, miller, average;
   
   if (gender === 'male') {
     // Hamwi formula
     hamwi = 48 + 2.7 * ((heightInCm - 152.4) / 2.54);
     
     // Devine formula
     devine = 50 + 2.3 * ((heightInCm - 152.4) / 2.54);
     
     // Robinson formula
     robinson = 52 + 1.9 * ((heightInCm - 152.4) / 2.54);
     
     // Miller formula
     miller = 56.2 + 1.41 * ((heightInCm - 152.4) / 2.54);
   } else {
     // Hamwi formula
     hamwi = 45.5 + 2.2 * ((heightInCm - 152.4) / 2.54);
     
     // Devine formula
     devine = 45.5 + 2.3 * ((heightInCm - 152.4) / 2.54);
     
     // Robinson formula
     robinson = 49 + 1.7 * ((heightInCm - 152.4) / 2.54);
     
     // Miller formula
     miller = 53.1 + 1.36 * ((heightInCm - 152.4) / 2.54);
   }
   
   // Calculate average
   average = (hamwi + devine + robinson + miller) / 4;
   
   // Convert to imperial if needed
   if (unit === 'imperial') {
     hamwi = Math.round(hamwi * 10) / 10;
     devine = Math.round(devine * 10) / 10;
     robinson = Math.round(robinson * 10) / 10;
     miller = Math.round(miller * 10) / 10;
     average = Math.round(average * 10) / 10;
     
     resultElement.innerHTML = `
       <div class="ideal-weight-results">
         <p><strong>Average:</strong> ${average} lbs</p>
         <p><strong>Hamwi:</strong> ${hamwi} lbs</p>
         <p><strong>Devine:</strong> ${devine} lbs</p>
         <p><strong>Robinson:</strong> ${robinson} lbs</p>
         <p><strong>Miller:</strong> ${miller} lbs</p>
       </div>
     `;
   } else {
     // Convert to kg
     hamwi = Math.round(hamwi * 0.453592 * 10) / 10;
     devine = Math.round(devine * 0.453592 * 10) / 10;
     robinson = Math.round(robinson * 0.453592 * 10) / 10;
     miller = Math.round(miller * 0.453592 * 10) / 10;
     average = Math.round(average * 0.453592 * 10) / 10;
     
     resultElement.innerHTML = `
       <div class="ideal-weight-results">
         <p><strong>Average:</strong> ${average} kg</p>
         <p><strong>Hamwi:</strong> ${hamwi} kg</p>
         <p><strong>Devine:</strong> ${devine} kg</p>
         <p><strong>Robinson:</strong> ${robinson} kg</p>
         <p><strong>Miller:</strong> ${miller} kg</p>
       </div>
     `;
   }
   
   // Set comment
   commentElement.textContent = "These are estimates based on different formulas. The ideal weight range varies based on body composition and other factors.";
   
   // Save to database/localStorage
   saveCalculationResult('idealweight', average);
   
   // Show the result section if it's hidden
   const resultSection = document.querySelector('#idealweight-tab .calculator-result');
   if (resultSection) {
     resultSection.style.display = 'block';
   }
 }
 
 // Add event listeners when DOM is loaded
 document.addEventListener('DOMContentLoaded', function() {
   // BMI calculator button
   const calculateBMIBtn = document.getElementById('calculate-bmi');
   if (calculateBMIBtn) {
     calculateBMIBtn.addEventListener('click', calculateBMI);
   }
   
   // Water intake calculator button
   const calculateWaterBtn = document.getElementById('calculate-water');
   if (calculateWaterBtn) {
     calculateWaterBtn.addEventListener('click', calculateWaterIntake);
   }
   
   // Body fat calculator button
   const calculateBodyFatBtn = document.getElementById('calculate-bodyfat');
   if (calculateBodyFatBtn) {
     calculateBodyFatBtn.addEventListener('click', calculateBodyFat);
   }
   
   // Initialize calculator result sections as hidden if they're empty
   document.querySelectorAll('.calculator-result').forEach(section => {
     const resultValue = section.querySelector('.result-value');
     if (resultValue && resultValue.textContent.trim() === '00.00') {
       section.style.display = 'none';
     }
   });
   
   // Initialize dashboard charts if we're on the dashboard page
   if (window.location.href.includes('dashboard')) {
     const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
     if (currentUser.id) {
       updateDashboardCharts();
     }
   }
 });
 
 // Add this at the beginning of your existing bmi.js file
 document.addEventListener('DOMContentLoaded', function() {
   // Check if user is logged in
   checkUserLogin();
   
   // Setup session timeout
   setupSessionTimeout();
   
   // Rest of your existing code...
 });

 // Function to check if user is logged in
 function checkUserLogin() {
   const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
   
   // If no user is logged in, redirect to login page
   if (!currentUser) {
     window.location.href = 'login.html';
     return;
   }
   
   // Check if session is expired
   if (new Date().getTime() > currentUser.expirationTime) {
     // Clear session
     sessionStorage.removeItem('currentUser');
     
     // Redirect to login page with expired session message
     window.location.href = 'login.html?expired=true';
   }
   
   // Update user name in the UI
   const userNameElement = document.getElementById('user-name');
   if (userNameElement && currentUser.name) {
     userNameElement.textContent = currentUser.name;
   }
 }

 // Function to setup session timeout
 function setupSessionTimeout() {
   // Check session every minute
   setInterval(() => {
     const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
     
     if (currentUser) {
       // Check if session is expired
       if (new Date().getTime() > currentUser.expirationTime) {
         // Clear session
         sessionStorage.removeItem('currentUser');
         
         // Redirect to login page with expired session message
         window.location.href = 'login.html?expired=true';
       }
     }
   }, 60000); // Check every minute
   
   // Set up activity listeners to extend session
   ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
     document.addEventListener(event, updateLastActivity, { passive: true });
   });
 }

 // Function to update last activity time
 function updateLastActivity() {
   const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
   
   if (currentUser) {
     // Only extend session if user is active (not just page refresh)
     currentUser.expirationTime = new Date().getTime() + (60 * 60 * 1000); // 1 hour from now
     sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
     
     // If remember me was checked, update localStorage too
     if (currentUser.rememberMe) {
       localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
     }
   }
 }