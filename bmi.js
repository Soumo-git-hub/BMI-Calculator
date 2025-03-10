// Get references to elements
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const ageInput = document.getElementById("age");
const genderSelect = document.getElementById("gender");
const unitSelect = document.getElementById("unit-select");
const resultElement = document.getElementById("result");
const commentElement = document.querySelector(".comment"); // Access comment element

// Calculate BMI function, incorporating age and gender
function calculateBMI() {
   const height = parseFloat(heightInput.value);
   const weight = parseFloat(weightInput.value);
   const age = parseInt(ageInput.value);
   const gender = genderSelect.value;
   const unit = unitSelect.value;

   // Perform BMI calculation based on selected unit
   let bmi;
   if (unit === "metric") {
      bmi = weight / ((height / 100) ** 2); // kg/m², using height in cm
   } else {
      bmi = 703 * weight / (height * height); // lbs/in², using height in inches
   }

   // Determine status based on BMI
   let status = "";
   if (bmi < 18.5) {
      status = "Underweight";
   } else if (bmi >= 18.5 && bmi < 25) {
      status = "Healthy";
   } else if (bmi >= 25 && bmi < 30) {
      status = "Overweight";
   } else {
      status = "Obese";
   }

   // Display both BMI and status comment
   resultElement.textContent = bmi.toFixed(2);
   commentElement.innerHTML = `Comment: You are <span id="comment">${status}</span>`;
   
   // Apply color based on status
   const commentSpan = document.getElementById("comment");
   if (commentSpan) {
      // Reset classes
      commentSpan.className = "";
      
      // Apply appropriate class
      if (status === "Underweight") {
         commentSpan.classList.add("text-warning");
      } else if (status === "Healthy") {
         commentSpan.classList.add("text-success");
      } else if (status === "Overweight") {
         commentSpan.classList.add("text-warning");
      } else {
         commentSpan.classList.add("text-danger");
      }
   }
}

// Add event listener to calculate BMI on button click
const calculateButton = document.getElementById("calculate");
calculateButton.addEventListener("click", calculateBMI);

// Add event listener to handle input validation and unit changes
document.addEventListener("DOMContentLoaded", function() {
   // Handle unit change
   unitSelect.addEventListener("change", function() {
      const unit = unitSelect.value;
      
      // Update placeholders and labels based on selected unit
      if (unit === "metric") {
         heightInput.placeholder = "Height (cm)";
         weightInput.placeholder = "Weight (kg)";
         document.querySelector('label[for="height"]').textContent = "Height (cm)";
         document.querySelector('label[for="weight"]').textContent = "Weight (kg)";
      } else {
         heightInput.placeholder = "Height (in)";
         weightInput.placeholder = "Weight (lbs)";
         document.querySelector('label[for="height"]').textContent = "Height (in)";
         document.querySelector('label[for="weight"]').textContent = "Weight (lbs)";
      }
      
      // Clear current result when changing units
      resultElement.textContent = "";
      commentElement.innerHTML = "";
   });
   
   // Clear result when changing inputs
   const inputs = [heightInput, weightInput, ageInput, genderSelect];
   inputs.forEach(input => {
      input.addEventListener("input", function() {
         resultElement.textContent = "";
         commentElement.innerHTML = "";
      });
   });
   
   // Form validation
   const form = document.querySelector("form");
   form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      // Check if all required fields have values
      if (!heightInput.value || !weightInput.value || !ageInput.value) {
         alert("Please fill in all required fields");
         return;
      }
      
      calculateBMI();
   });
});

// Navigation and tab functionality
document.addEventListener("DOMContentLoaded", function() {
   // Navigation links
   const navLinks = document.querySelectorAll('.nav-links a');
   const sections = document.querySelectorAll('section');
   
   navLinks.forEach(link => {
     link.addEventListener('click', function(e) {
       e.preventDefault();
       const targetId = this.getAttribute('href').substring(1);
       
       // Update active nav link
       navLinks.forEach(link => link.classList.remove('active'));
       this.classList.add('active');
       
       // Show target section
       sections.forEach(section => section.classList.remove('active-section'));
       document.getElementById(targetId).classList.add('active-section');
     });
   });
   
   // Calculator tabs
   const tabBtns = document.querySelectorAll('.tab-btn');
   const tabContents = document.querySelectorAll('.tab-content');
   
   tabBtns.forEach(btn => {
     btn.addEventListener('click', function() {
       const tabId = this.getAttribute('data-tab');
       
       // Update active tab button
       tabBtns.forEach(btn => btn.classList.remove('active'));
       this.classList.add('active');
       
       // Show target tab content
       tabContents.forEach(content => content.classList.remove('active'));
       document.getElementById(tabId + '-tab').classList.add('active');
     });
   });
   
   // BMI Calculator
   const bmiHeight = document.getElementById('bmi-height');
   const bmiWeight = document.getElementById('bmi-weight');
   const bmiAge = document.getElementById('bmi-age');
   const bmiGender = document.getElementById('bmi-gender');
   const bmiUnit = document.getElementById('bmi-unit');
   const bmiResult = document.getElementById('bmi-result');
   const bmiComment = document.getElementById('bmi-comment');
   const calculateBmiBtn = document.getElementById('calculate-bmi');
   
   calculateBmiBtn.addEventListener('click', function() {
     // Validate inputs
     if (!bmiHeight.value || !bmiWeight.value || !bmiAge.value) {
       alert('Please fill in all required fields');
       return;
     }
     
     // Get values
     let height = parseFloat(bmiHeight.value);
     let weight = parseFloat(bmiWeight.value);
     const age = parseInt(bmiAge.value);
     const gender = bmiGender.value;
     const unit = bmiUnit.value;
     
     // Convert units if needed
     if (unit === 'imperial') {
       // Convert inches to cm for calculation
       height = height * 2.54;
       // Convert lbs to kg for calculation
       weight = weight * 0.453592;
     }
     
     // Calculate BMI
     const bmi = weight / ((height / 100) ** 2);
     
     // Determine status
     let status = '';
     if (bmi < 18.5) {
       status = 'Underweight';
     } else if (bmi >= 18.5 && bmi < 25) {
       status = 'Healthy Weight';
     } else if (bmi >= 25 && bmi < 30) {
       status = 'Overweight';
     } else {
       status = 'Obese';
     }
     
     // Display result
     bmiResult.textContent = bmi.toFixed(2);
     bmiComment.textContent = `You are classified as: ${status}`;
     
     // Update dashboard
     document.getElementById('dashboard-bmi').textContent = bmi.toFixed(2);
     document.getElementById('bmi-status').textContent = status;
   });
   
   // BMR Calculator
   const bmrHeight = document.getElementById('bmr-height');
   const bmrWeight = document.getElementById('bmr-weight');
   const bmrAge = document.getElementById('bmr-age');
   const bmrGender = document.getElementById('bmr-gender');
   const activityLevel = document.getElementById('activity-level');
   const bmrUnit = document.getElementById('bmr-unit');
   const bmrResult = document.getElementById('bmr-result');
   const tdeeValue = document.getElementById('tdee-value');
   const calculateBmrBtn = document.getElementById('calculate-bmr');
   
   calculateBmrBtn.addEventListener('click', function() {
     // Validate inputs
     if (!bmrHeight.value || !bmrWeight.value || !bmrAge.value) {
       alert('Please fill in all required fields');
       return;
     }
     
     // Get values
     let height = parseFloat(bmrHeight.value);
     let weight = parseFloat(bmrWeight.value);
     const age = parseInt(bmrAge.value);
     const gender = bmrGender.value;
     const activity = parseFloat(activityLevel.value);
     const unit = bmrUnit.value;
     
     // Convert units if needed
     if (unit === 'imperial') {
       // Convert inches to cm for calculation
       height = height * 2.54;
       // Convert lbs to kg for calculation
       weight = weight * 0.453592;
     }
     
     // Calculate BMR using Mifflin-St Jeor Equation
     let bmr;
     if (gender === 'male') {
       bmr = 10 * weight + 6.25 * height - 5 * age + 5;
     } else {
       bmr = 10 * weight + 6.25 * height - 5 * age - 161;
     }
     
     // Calculate TDEE (Total Daily Energy Expenditure)
     const tdee = bmr * activity;
     
     // Display results
     bmrResult.textContent = Math.round(bmr);
     tdeeValue.textContent = Math.round(tdee);
     
     // Update dashboard
     document.getElementById('dashboard-bmr').textContent = Math.round(bmr);
   });
   
   // Body Fat Calculator
   const bfHeight = document.getElementById('bf-height');
   const bfWeight = document.getElementById('bf-weight');
   const bfAge = document.getElementById('bf-age');
   const bfGender = document.getElementById('bf-gender');
   const bfNeck = document.getElementById('bf-neck');
   const bfWaist = document.getElementById('bf-waist');
   const bfHip = document.getElementById('bf-hip');
   const bfUnit = document.getElementById('bf-unit');
   const bfResult = document.getElementById('bodyfat-result');
   const bfComment = document.getElementById('bodyfat-comment');
   const calculateBfBtn = document.getElementById('calculate-bodyfat');
   
   // Show/hide hip measurement based on gender
   bfGender.addEventListener('change', function() {
     const femaleOnly = document.querySelector('.female-only');
     if (this.value === 'female') {
       femaleOnly.style.display = 'flex';
     } else {
       femaleOnly.style.display = 'none';
     }
   });
   
   calculateBfBtn.addEventListener('click', function() {
     // Validate inputs
     if (!bfHeight.value || !bfWeight.value || !bfAge.value || !bfNeck.value || !bfWaist.value) {
       alert('Please fill in all required fields');
       return;
     }
     
     if (bfGender.value === 'female' && !bfHip.value) {
       alert('Please enter hip measurement for female calculation');
       return;
     }
     
     // Get values
     let height = parseFloat(bfHeight.value);
     let weight = parseFloat(bfWeight.value);
     let neck = parseFloat(bfNeck.value);
     let waist = parseFloat(bfWaist.value);
     let hip = bfGender.value === 'female' ? parseFloat(bfHip.value) : 0;
     const gender = bfGender.value;
     const unit = bfUnit.value;
     
     // Convert units if needed
     if (unit === 'imperial') {
       // Convert inches to cm for calculation
       height = height * 2.54;
       neck = neck * 2.54;
       waist = waist * 2.54;
       if (gender === 'female') {
         hip = hip * 2.54;
       }
     }
     
     // Calculate body fat percentage using U.S. Navy method
     let bodyFat;
     if (gender === 'male') {
       bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
     } else {
       bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
     }
     
     // Determine status
     let status = '';
     if (gender === 'male') {
       if (bodyFat < 6) status = 'Essential fat';
       else if (bodyFat < 14) status = 'Athletic';
       else if (bodyFat < 18) status = 'Fitness';
       else if (bodyFat < 25) status = 'Average';
       else status = 'Obese';
     } else {
       if (bodyFat < 16) status = 'Essential fat';
       else if (bodyFat < 24) status = 'Athletic';
       else if (bodyFat < 31) status = 'Fitness';
       else if (bodyFat < 37) status = 'Average';
       else status = 'Obese';
     }
     
     // Display result
     bfResult.textContent = bodyFat.toFixed(1);
     bfComment.textContent = `Classification: ${status}`;
     
     // Update dashboard
     document.getElementById('dashboard-bodyfat').textContent = bodyFat.toFixed(1);
     document.getElementById('bodyfat-status').textContent = status;
   });
   
   // Ideal Weight Calculator
   const iwHeight = document.getElementById('iw-height');
   const iwGender = document.getElementById('iw-gender');
   const iwUnit = document.getElementById('iw-unit');
   const iwResult = document.getElementById('idealweight-result');
   const iwList = document.getElementById('idealweight-list');
   const calculateIwBtn = document.getElementById('calculate-idealweight');
   
   calculateIwBtn.addEventListener('click', function() {
     // Validate inputs
     if (!iwHeight.value) {
       alert('Please enter your height');
       return;
     }
     
     // Get values
     let height = parseFloat(iwHeight.value);
     const gender = iwGender.value;
     const unit = iwUnit.value;
     
     // Convert units if needed
     let heightInCm, heightInInches;
     if (unit === 'metric') {
       heightInCm = height;
       heightInInches = height / 2.54;
     } else {
       heightInInches = height;
       heightInCm = height * 2.54;
     }
     
     // Calculate ideal weight using different formulas
     const formulas = {
       'Robinson': gender === 'male' ? 52 + 1.9 * (heightInInches - 60) : 49 + 1.7 * (heightInInches - 60),
       'Miller': gender === 'male' ? 56.2 + 1.41 * (heightInInches - 60) : 53.1 + 1.36 * (heightInInches - 60),
       'Devine': gender === 'male' ? 50 + 2.3 * (heightInInches - 60) : 45.5 + 2.3 * (heightInInches - 60),
       'Hamwi': gender === 'male' ? 48 + 2.7 * (heightInInches - 60) : 45.5 + 2.2 * (heightInInches - 60),
       'BMI-based': gender === 'male' ? (21.75 * (heightInCm/100) ** 2).toFixed(1) + ' - ' + (23.75 * (heightInCm/100) ** 2).toFixed(1) : 
                                       (20.25 * (heightInCm/100) ** 2).toFixed(1) + ' - ' + (22.25 * (heightInCm/100) ** 2).toFixed(1)
     };
     
     // Calculate average (excluding BMI-based range)
     const values = Object.values(formulas).slice(0, 4);
     const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
     
     // Display results
     let resultUnit = unit === 'metric' ? 'kg' : 'lbs';
     if (unit === 'metric') {
       // Convert lbs to kg for display
       iwResult.textContent = `${(avg * 0.453592).toFixed(1)} ${resultUnit}`;
     } else {
       iwResult.textContent = `${avg.toFixed(1)} ${resultUnit}`;
     }
     
     // Display individual formulas
     iwList.innerHTML = '';
     for (const [name, value] of Object.entries(formulas)) {
       let displayValue;
       if (name === 'BMI-based') {
         displayValue = value + (unit === 'metric' ? ' kg' : ' lbs');
       } else if (unit === 'metric') {
         displayValue = (value * 0.453592).toFixed(1) + ' kg';
       } else {
         displayValue = value.toFixed(1) + ' lbs';
       }
       
       const li = document.createElement('li');
       li.innerHTML = `<span>${name}:</span> <span>${displayValue}</span>`;
       iwList.appendChild(li);
     }
   });
   
   // Water Intake Calculator
   const waterWeight = document.getElementById('water-weight');
   const waterActivity = document.getElementById('water-activity');
   const waterClimate = document.getElementById('water-climate');
   const waterUnit = document.getElementById('water-unit');
   const waterResult = document.getElementById('water-result');
   const waterComment = document.getElementById('water-comment');
   const waterGlassesCount = document.getElementById('water-glasses-count');
   const waterFill = document.querySelector('.water-fill');
   const calculateWaterBtn = document.getElementById('calculate-water');
   
   calculateWaterBtn.addEventListener('click', function() {
     // Validate inputs
     if (!waterWeight.value) {
       alert('Please enter your weight');
       return;
     }
     
     // Get values
     let weight = parseFloat(waterWeight.value);
     const activity = waterActivity.value;
     const climate = waterClimate.value;
     const unit = waterUnit.value;
     
     // Convert units if needed
     if (unit === 'imperial') {
       // Convert lbs to kg for calculation
       weight = weight * 0.453592;
     }
     
     // Base calculation: 30ml per kg of body weight
     let waterNeeds = weight * 30;
     
     // Adjust for activity level
     const activityFactors = {
       'sedentary': 1,
       'light': 1.1,
       'moderate': 1.2,
       'active': 1.3,
       'very-active': 1.4
     };
     
     // Apply activity factor
     waterNeeds *= activityFactors[activity];
     
     // Adjust for climate
     const climateFactors = {
       'moderate': 1,
       'hot': 1.2,
       'humid': 1.3,
       'cold': 0.9
     };
     
     // Apply climate factor
     waterNeeds *= climateFactors[climate];
     
     // Round to nearest 50ml
     waterNeeds = Math.round(waterNeeds / 50) * 50;
     
     // Display results
     waterResult.textContent = `${waterNeeds} ml`;
     
     // Calculate glasses (250ml each)
     const glasses = Math.round(waterNeeds / 250);
     waterGlassesCount.textContent = glasses;
     
     // Update water bottle fill visualization
     waterFill.style.height = `${Math.min(100, (waterNeeds / 3000) * 100)}%`;
     
     // Add comment based on amount
     if (waterNeeds < 1500) {
       waterComment.textContent = "This seems low. Make sure you're staying hydrated!";
     } else if (waterNeeds > 4000) {
       waterComment.textContent = "This is quite high. Consult with a healthcare professional.";
     } else {
       waterComment.textContent = "Stay hydrated throughout the day!";
     }
     
     // Update dashboard
     document.getElementById('dashboard-water').textContent = waterNeeds;
   });
   
   // Initialize any default states
   // Hide female-only fields initially
   document.querySelector('.female-only').style.display = 'none';
   
   // Set default active tab
   document.querySelector('.tab-btn[data-tab="bmi"]').click();
   
   // Set default active section
   document.querySelector('.nav-links a[href="#dashboard"]').classList.add('active');
   document.getElementById('dashboard').classList.add('active-section');
});