// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize tabs
  initTabs();
  
  // Initialize login form
  initLoginForm();
  
  // Initialize signup form
  initSignupForm();
  
  // Check if session is expired
  checkSessionExpiration();
});

// Function to initialize tabs
function initTabs() {
  const tabButtons = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and forms
      tabButtons.forEach(btn => btn.classList.remove('active'));
      authForms.forEach(form => form.classList.remove('active'));
      
      // Add active class to clicked button and corresponding form
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab');
      document.getElementById(`${tabId}-form`).classList.add('active');
    });
  });
}

// Function to initialize login form
function initLoginForm() {
  const loginBtn = document.getElementById('login-btn');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const rememberMe = document.getElementById('remember-me').checked;
      
      // Validate inputs
      if (!email || !password) {
        showError('login-error', 'Please enter both email and password');
        return;
      }
      
      // Attempt login
      login(email, password, rememberMe);
    });
  }
}

// Function to initialize signup form
function initSignupForm() {
  const signupBtn = document.getElementById('signup-btn');
  
  if (signupBtn) {
    signupBtn.addEventListener('click', function() {
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;
      const termsAgreed = document.getElementById('terms-agree').checked;
      
      // Validate inputs
      if (!name || !email || !password || !confirmPassword) {
        showError('signup-error', 'Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        showError('signup-error', 'Passwords do not match');
        return;
      }
      
      if (!termsAgreed) {
        showError('signup-error', 'You must agree to the Terms of Service and Privacy Policy');
        return;
      }
      
      // Attempt signup
      signup(name, email, password);
    });
  }
}

// Function to show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide error after 3 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 3000);
  }
}

// Function to login
function login(email, password, rememberMe) {
  // In a real app, this would validate against a server
  // For this demo, we'll use localStorage to simulate a database
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Set session expiration time (1 hour from now)
    const expirationTime = new Date().getTime() + (60 * 60 * 1000); // 1 hour in milliseconds
    
    // Create session object
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      expirationTime: expirationTime,
      rememberMe: rememberMe
    };
    
    // Store session in sessionStorage (cleared when browser is closed)
    sessionStorage.setItem('currentUser', JSON.stringify(session));
    
    // If remember me is checked, also store in localStorage
    if (rememberMe) {
      localStorage.setItem('rememberedUser', JSON.stringify(session));
    } else {
      localStorage.removeItem('rememberedUser');
    }
    
    // Redirect to dashboard
    window.location.href = 'bmi.html';
  } else {
    showError('login-error', 'Invalid email or password');
  }
}

// Function to signup
function signup(name, email, password) {
  // In a real app, this would send data to a server
  // For this demo, we'll use localStorage to simulate a database
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    showError('signup-error', 'Email already in use');
    return;
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Save to localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // Show success message
  alert('Account created successfully! Please login.');
  
  // Switch to login tab
  document.querySelector('.auth-tab[data-tab="login"]').click();
}

// Function to check if session is expired
function checkSessionExpiration() {
  // Get current user from sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  
  // If no current user, check if there's a remembered user
  if (!currentUser) {
    const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser'));
    
    if (rememberedUser) {
      // Check if remembered user session is still valid
      if (new Date().getTime() < rememberedUser.expirationTime) {
        // Update expiration time (extend session)
        rememberedUser.expirationTime = new Date().getTime() + (60 * 60 * 1000);
        
        // Store updated session
        sessionStorage.setItem('currentUser', JSON.stringify(rememberedUser));
        
        // If remember me was checked, update localStorage too
        if (rememberedUser.rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify(rememberedUser));
        }
        
        // Redirect to dashboard if not already on login page
        if (!window.location.href.includes('login.html')) {
          window.location.href = 'bmi.html';
        }
      }
    }
  }
}

// Add this to all pages to check session expiration
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
      } else {
        // Update last activity time
        updateLastActivity();
      }
    }
  }, 60000); // Check every minute
  
  // Set up activity listeners to extend session
  ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, updateLastActivity, { passive: true });
  });
  
  // Check for expired session message
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('expired') === 'true') {
    alert('Your session has expired. Please login again.');
    // Remove the query parameter
    window.history.replaceState({}, document.title, 'login.html');
  }
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

// Call setupSessionTimeout on page load
setupSessionTimeout();