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
      bmi = 703 * weight / (height * 0.0254) ** 2; // lbs/in², converting height to inches
   }


   // Determine status based on BMI
   let status = "";
   if (bmi < 18.5) {
      status = "Underweight";
   } else if (bmi >= 18.5 && bmi < 25) {
      status = "Healthy";
   } else if (bmi >= 25 && bmi < 30) {
      status = "Overweight";
   } else if (bmi >= 30) {
      status = "Obese";
   }

   // Display both BMI and status comment
   resultElement.textContent = bmi.toFixed(2);
   commentElement.innerHTML = `Comment: You are <span id="comment">${status}</span>`;
}

// Add event listener to calculate BMI on button click
const calculateButton = document.getElementById("calculate");
calculateButton.addEventListener("click", calculateBMI);

// ... (rest of your code for clearing results)

