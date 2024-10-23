// API endpoints configuration
const API = {
  login: "https://localhost:3000/v1/auth/login",
  register: "https://localhost:3000/v1/auth/register",
  mfaSetup: "https://localhost:3000/v1/auth/mfa/setup",
  profile: "https://localhost:3000/v1/auth/info",
  security: "https://localhost:3000/v1/auth/security",
  mfaVerify: "https://localhost:3000/v1/auth/mfa/verify",
  mfaSetupSecond: "https://localhost:3000/v1/auth/mfa/setup/verify",
};

// Utility functions
function showError(message) {
  alert(message); // In a real application, you'd want to show this in a better way
}

function switchForm(form) {
  document.getElementById("loginForm").style.display =
    form === "login" ? "block" : "none";
  document.getElementById("registerForm").style.display =
    form === "register" ? "block" : "none";
  document.getElementById("dashboard").style.display =
    form === "dashboard" ? "flex" : "none";
}

function showSection(section) {
  // Remove active class from all nav items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Add active class to clicked nav item
  document.querySelector(`[href="#${section}"]`).classList.add("active");

  // Hide all sections
  document.querySelectorAll(".dashboard-section").forEach((s) => {
    s.style.display = "none";
  });

  // Show selected section
  document.getElementById(`${section}Section`).style.display = "flex";
}

function handleLogout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

// Profile management
async function loadUserData() {
  try {
    const response = await fetch(API.profile, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      document.getElementById("updateUsername").value = data.username;
      document.getElementById("updateFullname").value = data.name;
      document.getElementById("updateBirthdate").value = new Date(
        data.birthdate
      )
        .toISOString()
        .split("T")[0];

      // Update 2FA UI
      const twoFactorEnabled = data.multifactorEnabled;
      document.getElementById("enableTwoFactor").style.display =
        twoFactorEnabled ? "none" : "block";
      document.getElementById("disableTwoFactor").style.display =
        twoFactorEnabled ? "block" : "none";
    }
  } catch (error) {
    showError("Error loading user data");
    console.error(error);
  }
}

async function handleProfileUpdate(event) {}

// 2FA management
async function setupTwoFactor() {}

function showVerifyCode() {
  document.getElementById("qrStep").style.display = "none";
  document.getElementById("verifyStep").style.display = "block";
}

async function verifyTwoFactor() {}

async function disableTwoFactor() {}

// Password management
async function handlePasswordChange(event) {}

// API request helper
async function fetchWithAuth(url, options = {}) {}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    switchForm("dashboard");
    loadUserData();
  } else {
    switchForm("login");
    console.log("test");
  }
});

const toast = {
  element: document.getElementById("toast"),
  show(message, type = "success") {
    const icon =
      type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
    this.element.querySelector("i").className = `fas ${icon}`;
    this.element.className = `toast show ${type}`;
    document.getElementById("toastMessage").textContent = message;

    setTimeout(() => {
      this.element.className = "toast";
    }, 3000);
  },
};

// Utility functions
function showError(message) {
  toast.show(message, "error");
}

function showSuccess(message) {
  toast.show(message, "success");
}

function showSection(section) {
  document.querySelectorAll(".dashboard-section").forEach((s) => {
    s.style.display = "none";
    s.classList.remove("active");
  });
  const targetSection = document.getElementById(`${section}Section`);
  if (targetSection) {
    targetSection.style.display = "block";
    // Trigger reflow
    targetSection.offsetHeight;
    targetSection.classList.add("active");
  }
}

// Authentication handlers
async function handleLogin(event) {}

// Previous handle functions enhanced with loading states and better error handling
async function handleRegister(event) {}

function handleLogout() {
  localStorage.removeItem("token");
  showSuccess("Logged out successfully");
  switchForm("login");
}
