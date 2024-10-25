// 2FA management
async function setupTwoFactor() {
  try {
    const response = await fetch(API.mfaSetup, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ code: "123456" }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      document.getElementById("qrCode").src = url;
      document.getElementById("enableTwoFactor").style.display = "none";
      document.getElementById("twoFactorFlow").style.display = "block";
      document.getElementById("qrStep").style.display = "block";
    }
  } catch (error) {
    showError("Error setting up 2FA");
  }
}

function showVerifyCode() {
  document.getElementById("qrStep").style.display = "none";
  document.getElementById("verifyStep").style.display = "block";
}

async function verifyTwoFactor() {
  const code = document.getElementById("verificationCode").value;

  try {
    const response = await fetch(API.mfaSetupSecond, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    let data = await response.json();

    if (response.ok) {
      document.getElementById("twoFactorFlow").style.display = "none";
      document.getElementById("disableTwoFactor").style.display = "block";
      showError("2FA enabled successfully");
    } else {
      showError("Invalid verification code");
    }
  } catch (error) {
    showError("Error verifying 2FA code");
  }
}

async function disableTwoFactor() {
  try {
    const response = await fetch(API.mfaSetup, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      document.getElementById("disableTwoFactor").style.display = "none";
      document.getElementById("enableTwoFactor").style.display = "block";
      showError("2FA disabled successfully");
    }
  } catch (error) {
    showError("Error disabling 2FA");
  }
}

// Password management
async function handlePasswordChange(event) {
  event.preventDefault();
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const response = await fetch(`${API.security}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (response.ok) {
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      showError("Password updated successfully");
    } else {
      const data = await response.json();
      showError(data.message);
    }
  } catch (error) {
    showError("Error changing password");
  }
}

async function fastAuthCheck() {
  try {
    const response = await fetch(API.profile, {
      method: "GET",
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Error during fast auth check:", error);
    return false;
  }
}

// Initial setup
document.addEventListener("DOMContentLoaded", async () => {
  const loggedIn = await fastAuthCheck();
  if (loggedIn) {
    switchForm("dashboard");
    loadUserData();
    document.getElementById("loadingScreen").style.display = "none";
  } else {
    switchForm("login");
    document.getElementById("loadingScreen").style.display = "none";
  }
});

// Authentication handlers
async function handleLogin(event) {
  // its fully done
}

// Previous handle functions enhanced with loading states and better error handling
async function handleRegister(event) {}

async function handleLogout() {}

// Password strength checker
function checkPasswordStrength(password) {
  let strength = 0;
  const requirements = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };

  // Update requirement indicators
  document
    .querySelectorAll(".password-requirements .requirement")
    .forEach((req) => {
      const type = req.textContent.toLowerCase();
      if (
        (type.includes("characters") && requirements.length) ||
        (type.includes("numbers") && requirements.number) ||
        (type.includes("special") && requirements.special) ||
        (type.includes("uppercase") && requirements.uppercase)
      ) {
        req.classList.add("met");
        req.querySelector("i").classList.replace("fa-times", "fa-check");
        strength++;
      } else {
        req.classList.remove("met");
        req.querySelector("i").classList.replace("fa-check", "fa-times");
      }
    });

  // Update strength meter
  const segments = document.querySelectorAll(".strength-segment");
  const strengthLabel = document.querySelector(".strength-label");
  segments.forEach((segment, index) => {
    segment.classList.toggle("active", index < strength);
  });

  const strengthLabels = ["Weak", "Medium", "Strong", "Very Strong"];
  strengthLabel.textContent = `Password strength: ${
    strengthLabels[strength - 1] || "Weak"
  }`;
}

document.getElementById("newPassword").addEventListener("input", function () {
  checkPasswordStrength(this.value);
});

// 2FA Setup Flow
let currentStep = "enableTwoFactor";

function showStep(step) {
  document.querySelectorAll(".setup-state").forEach((state) => {
    state.classList.remove("active");
  });
  document.getElementById(step).classList.add("active");
  currentStep = step;
}

function setupTwoFactor() {
  showStep("twoFactorFlow");
  // Add your QR code generation logic here
}

function showVerifyCode() {
  document.getElementById("qrStep").style.display = "none";
  document.getElementById("verifyStep").style.display = "block";
  startVerificationTimer();
}

// Handle verification code input
document.querySelectorAll(".code-input").forEach((input, index) => {
  input.addEventListener("input", function () {
    if (this.value.length === 1) {
      const nextInput = document.querySelectorAll(".code-input")[index + 1];
      if (nextInput) nextInput.focus();
    }
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value) {
      const prevInput = document.querySelectorAll(".code-input")[index - 1];
      if (prevInput) prevInput.focus();
    }
  });
});

function startVerificationTimer() {
  let timeLeft = 180; // 3 minutes
  const timerDisplay = document.querySelector(".verification-timer strong");

  const timer = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      // Handle expired code logic
    }
  }, 1000);
}

function verifyTwoFactor() {
  const code = Array.from(document.querySelectorAll(".code-input"))
    .map((input) => input.value)
    .join("");

  // Add your verification logic here
  console.log("Verifying code:", code); // Replace with actual API call
  showStep("disableTwoFactor");
}

function disableTwoFactor() {
  if (
    confirm(
      "Are you sure you want to disable two-factor authentication? This will make your account less secure."
    )
  ) {
    // Add your 2FA disable logic here
    console.log("Disabling 2FA..."); // Replace with actual API call
    showStep("enableTwoFactor");
  }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  showStep(currentStep);
  checkPasswordStrength(document.getElementById("newPassword").value);
});
