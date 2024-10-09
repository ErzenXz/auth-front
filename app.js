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
   document.getElementById("loginForm").style.display = form === "login" ? "block" : "none";
   document.getElementById("registerForm").style.display = form === "register" ? "block" : "none";
   document.getElementById("dashboard").style.display = form === "dashboard" ? "block" : "none";
}

function showSection(section) {
   document.querySelectorAll(".dashboard-section").forEach((s) => (s.style.display = "none"));
   document.getElementById(`${section}Section`).style.display = "block";
}

function handleLogout() {
   localStorage.removeItem("token");
   switchForm("login");
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
         document.getElementById("updateBirthdate").value = new Date(data.birthdate)
            .toISOString()
            .split("T")[0];

         // Update 2FA UI
         const twoFactorEnabled = data.multifactorEnabled;
         document.getElementById("enableTwoFactor").style.display = twoFactorEnabled
            ? "none"
            : "block";
         document.getElementById("disableTwoFactor").style.display = twoFactorEnabled
            ? "block"
            : "none";
      }
   } catch (error) {
      showError("Error loading user data");
      console.error(error);
   }
}

async function handleProfileUpdate(event) {
   event.preventDefault();
   const formData = {
      username: document.getElementById("updateUsername").value,
      fullname: document.getElementById("updateFullname").value,
      birthdate: document.getElementById("updateBirthdate").value,
   };

   try {
      const response = await fetch(API.profile, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
         },
         body: JSON.stringify(formData),
      });

      if (response.ok) {
         showError("Profile updated successfully");
      } else {
         const data = await response.json();
         showError(data.message);
      }
   } catch (error) {
      showError("Error updating profile");
   }
}

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
   console.log(code);

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

      console.log(data);

      if (response.ok) {
         document.getElementById("twoFactorFlow").style.display = "none";
         document.getElementById("disableTwoFactor").style.display = "block";
         showError("2FA enabled successfully");
      } else {
         showError("Invalid verification code");
      }
   } catch (error) {
      console.log(error);
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

// API request helper
async function fetchWithAuth(url, options = {}) {
   const token = localStorage.getItem("token");
   if (!token) {
      switchForm("login");
      throw new Error("No authentication token found");
   }

   const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
   };

   try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
         // Token expired or invalid
         localStorage.removeItem("token");
         switchForm("login");
         throw new Error("Session expired");
      }

      return response;
   } catch (error) {
      throw error;
   }
}

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
      const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
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
async function handleLogin(event) {
   event.preventDefault();
   const button = event.target.querySelector("button");
   button.disabled = true;
   button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

   try {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      const mfaCode = String(document.getElementById("mfaCode").value);

      const fetchOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include", // This will include cookies in the request
      };

      if (mfaCode) {
         const response = await fetch(API.mfaVerify, {
            ...fetchOptions,
            body: JSON.stringify({ email, password, code: mfaCode }),
         });

         const data = await response.json();

         if (response.ok) {
            localStorage.setItem("token", data.accessToken);
            showSuccess("Login successful!");
            switchForm("dashboard");
            //loadUserData();
         } else {
            showError(data.message);
         }
      } else {
         const response = await fetch(API.login, {
            ...fetchOptions,
            body: JSON.stringify({ email, password }),
         });

         const data = await response.json();
         console.log(data);

         if (data.message === "MFA is required") {
            document.getElementById("mfaGroup").style.display = "block";
            showError("Please enter your 2FA code");
            return;
         }

         if (response.ok) {
            localStorage.setItem("token", data.token);
            showSuccess("Login successful!");
            switchForm("dashboard");
            loadUserData();
         } else {
            showError(data.message);
         }
      }
   } catch (error) {
      showError("An error occurred during login");
   } finally {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
   }
}

// Previous handle functions enhanced with loading states and better error handling
async function handleRegister(event) {
   event.preventDefault();
   const button = event.target.querySelector("button");
   button.disabled = true;
   button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

   try {
      const formData = {
         username: document.getElementById("registerUsername").value,
         fullname: document.getElementById("registerFullname").value,
         email: document.getElementById("registerEmail").value,
         password: document.getElementById("registerPassword").value,
         birthdate: document.getElementById("registerBirthdate").value,
      };

      const response = await fetch(API.register, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
         showSuccess("Registration successful! Please login.");
         switchForm("login");
      } else {
         showError(data.message);
      }
   } catch (error) {
      showError("An error occurred during registration");
   } finally {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-user-plus"></i> Register';
   }
}

function handleLogout() {
   localStorage.removeItem("token");
   showSuccess("Logged out successfully");
   switchForm("login");
}
