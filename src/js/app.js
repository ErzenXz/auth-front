function handleRedirectAfterLogin() {
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get("return_to");

  console.log("Redirecting to:", returnTo);
  if (returnTo) {
    window.location.href = decodeURIComponent(returnTo);
  }
}

let loggedIn = false;

// API endpoints configuration
const API = {
  login: "https://apis.erzen.xyz/v1/auth/login",
  register: "https://apis.erzen.xyz/v1/auth/register",
  mfaSetup: "https://apis.erzen.xyz/v1/auth/mfa/setup",
  profile: "https://apis.erzen.xyz/v1/auth/info",
  security: "https://apis.erzen.xyz/v1/user/active-sessions",
  mfaVerify: "https://apis.erzen.xyz/v1/auth/mfa/verify",
  mfaSetupSecond: "https://apis.erzen.xyz/v1/auth/mfa/setup/verify",
  refresh: "https://apis.erzen.xyz/v1/auth/refresh",
  logout: "https://apis.erzen.xyz/v1/auth/logout",
  password: "https://apis.erzen.xyz/v1/auth/change-password",
  events: "https://apis.erzen.xyz/v1/user/events",
  forgotPassword: "https://apis.erzen.xyz/v1/auth/reset-password",
};

let eventsArray = [];

// Fetch User Events
async function fetchUserEvents() {
  try {
    const response = await fetch(API.events, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      eventsArray = data.map((event) => ({
        ...event,
        data: JSON.parse(event.data),
      }));
      displayUserEvents(eventsArray);
    } else {
      showError("Failed to load user events.");
    }
  } catch (error) {
    showError("Error fetching user events.");
    console.error(error);
  }
}

// Display User Events Styled Like Connected Devices
function displayUserEvents(events) {
  const eventsList = document.getElementById("eventsList");
  eventsList.innerHTML = "";

  if (events.length === 0) {
    eventsList.innerHTML = "<p>No recent events.</p>";
    return;
  }

  events.forEach((event) => {
    const eventItem = document.createElement("div");
    eventItem.className = "app-card";

    const eventIcon = getEventIcon(event.eventType);

    eventItem.innerHTML = `
       <div class="app-icon">
         <i class="${eventIcon}"></i>
       </div>
       <div class="app-info">
         <h4>${capitalizeFirstLetter(event.eventType.replace(".", " "))}</h4>
         <p>${formatTimeAgo(event.createdAt)}</p>
       </div>
     `;

    eventsList.appendChild(eventItem);
  });
}

// Format Event Details
function formatEventDetails(details) {
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

// Helper Function to Get Icon Based on Event Type
function getEventIcon(eventType) {
  switch (eventType) {
    case "password.reset":
      return "fas fa-key"; // Key icon for password reset
    case "login.success":
      return "fas fa-sign-in-alt"; // Sign-in icon
    case "login.failure":
      return "fas fa-exclamation-triangle"; // Warning icon
    case "auth.token.revoke":
      return "fas fa-ban"; // Ban icon for token revoke
    case "mfa.enable":
      return "fas fa-shield-alt"; // Shield icon for MFA enable
    case "mfa.login":
      return "fas fa-lock"; // Lock icon for MFA login
    case "password.change":
      return "fas fa-unlock-alt"; // Unlock icon for password change
    // Add more cases as needed
    default:
      return "fas fa-info-circle"; // Info icon for unknown events
  }
}

// Helper Function to Capitalize First Letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const uap = new UAParser();

function switchForm(form) {
  document.getElementById("loginForm").style.display =
    form === "login" ? "block" : "none";
  document.getElementById("registerForm").style.display =
    form === "register" ? "block" : "none";
  document.getElementById("dashboard").style.display =
    form === "dashboard" ? "flex" : "none";

  if (form === "dashboard") {
    document.title = "TrustPort - Dashboard";
  } else {
    document.title = "TrustPort - Login";
  }

  document.getElementById("loadingScreen").style.display = "none";
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
  document.getElementById(`${section}Section`).style.display = "block";

  switch (section) {
    // case "profile":
    //   loadUserData();
    //   break;
    // case "security":
    //   fetchConnectedDevices();
    //   break;
    // case "applications":
    //   loadConnectedApps();
    //   break;
    case "developer":
      initializeDeveloperSection();
      break;
  }
}

// Add this utility function at the beginning of the file, after the API configuration

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

// Add this function to calculate the security score
function calculateSecurityScore(data) {
  let score = 0;

  // Check if the account is verified (assuming there's a 'verified' field)
  if (data.verified) {
    score += 50;
  }

  // Check if MFA is enabled
  if (data.multifactorEnabled) {
    score += 50;
  }

  return score;
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
      document.getElementById("updateUsername").value = data.username;
      document.getElementById("updateFullname").value = data.name;
      document.getElementById("updateBirthdate").value = new Date(
        data.birthdate
      )
        .toISOString()
        .split("T")[0];

      document.getElementById("lastLogin").textContent = formatRelativeTime(
        data.lastLogin
      );

      document.getElementById("userName").textContent = String(data.name);
      document.getElementById("userName2").textContent = String(data.name);
      document.getElementById("userRole").textContent = String(data.role);
      document.getElementById("userImage").src =
        data.image ??
        encodeURI(
          `https://ui-avatars.com/api/?name=${data.name}&background=random&length=2&format=svg`
        );
      document.getElementById("userPhoto2").src =
        data.image ??
        encodeURI(
          `https://ui-avatars.com/api/?name=${data.name}&background=random&length=2&format=svg`
        );

      // Calculate and display the security score
      const securityScore = calculateSecurityScore(data);
      document.getElementById(
        "securityScore"
      ).textContent = `${securityScore}%`;

      // Update 2FA UI
      const twoFactorEnabled = data.multifactorEnabled;
      document.getElementById("enableTwoFactor").style.display =
        twoFactorEnabled ? "none" : "block";
      document.getElementById("disableTwoFactor").style.display =
        twoFactorEnabled ? "block" : "none";

      handleRedirectAfterLogin();
      fetchConnectedDevices();
      fetchUserEvents();
    }
  } catch (error) {
    showError("Error loading user data");
    console.error(error);
  }
}

let devicesArray = [];

async function fetchConnectedDevices() {
  try {
    const response = await fetch(API.security, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      devicesArray = await response.json();
      const connectedDevicesContainer =
        document.getElementById("connectedDevices");
      connectedDevicesContainer.innerHTML = ""; // Clear existing content

      devicesArray.forEach((device) => {
        const deviceCard = createDeviceCard(device);
        connectedDevicesContainer.appendChild(deviceCard);
      });
    }
  } catch (error) {
    showError("Error fetching connected devices");
    console.error(error);
  }
}

function createDeviceCard(device) {
  const card = document.createElement("div");
  card.className = "app-card";

  const icon = document.createElement("div");
  icon.className = "app-icon";
  icon.innerHTML = `<i class="${getDeviceIcon(device.userAgent)}"></i>`;

  let lastUsed;

  if (device.lastUsed) {
    lastUsed = device.lastUsed;
  } else {
    lastUsed = device.created;
  }

  const info = document.createElement("div");
  info.className = "app-info";
  info.innerHTML = `
    <h4>${parseUserAgent(device.userAgent)}</h4>
    <p>Last active: ${formatRelativeTime(lastUsed)} • ${device.createdByIp}</p>
  `;

  const actions = document.createElement("div");
  actions.className = "app-actions";
  actions.innerHTML = `<button class="btn btn-secondary" onclick="showDeviceDetails(${device.id})">Details</button>`;

  card.appendChild(icon);
  card.appendChild(info);
  card.appendChild(actions);

  return card;
}

function getDeviceIcon(userAgent) {
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return "fas fa-mobile-alt";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    return "fas fa-tablet-alt";
  } else if (ua.includes("windows")) {
    return "fa-brands fa-windows";
  } else if (ua.includes("mac")) {
    return "fa-brands fa-apple";
  } else if (ua.includes("linux")) {
    return "fa-brands fa-linux";
  }
  return "fas fa-laptop";
}

function parseUserAgent(userAgent) {
  const currentUserAgent = window.navigator.userAgent;
  const results = uap.setUA(userAgent).getResult();

  let deviceInfo = "Unknown device";
  let isCurrentDevice = userAgent === currentUserAgent;

  if (results.device.model) {
    deviceInfo = results.device.model;
  } else if (results.os.name) {
    deviceInfo = `${results.os.name}`;
    if (results.os.version) {
      deviceInfo += ` ${results.os.version}`;
    }
  }

  let browserInfo = results.browser.name || "Unknown browser";
  if (results.browser.version) {
    browserInfo += ` ${results.browser.version}`;
  }

  if (isCurrentDevice) {
    return `This device • ${deviceInfo} • ${browserInfo}`;
  } else {
    return `${deviceInfo} • ${browserInfo}`;
  }
}

function showDeviceDetails(deviceId) {
  const device = devicesArray.find((d) => d.id === deviceId);
  if (!device) {
    showError("Device not found");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal";

  // Get device icon based on user agent
  const deviceIcon = getDeviceIcon(device.userAgent);

  let activeStatus = true;

  if (device.lastUsed) {
    const lastUsedDate = new Date(device.lastUsed);
    const now = new Date();
    const diffInMinutes = (now - lastUsedDate) / 1000 / 60;

    if (diffInMinutes > 10) {
      activeStatus = false;
    }
  }

  const statusText = activeStatus ? "Active" : "Offline";
  const statusBadge = activeStatus
    ? '<span class="badge badge-success">Active</span>'
    : '<span class="badge badge-offline">Offline</span>';

  modal.innerHTML = `
      <div class="modal-content">
          <div class="modal-header">
              <div style="display: flex; align-items: center;">
                  <div class="app-logo" style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center;">
                      <i class="${deviceIcon} fa-2x"></i>
                  </div>
                  <h2 class="modal-title">Device Details</h2>
              </div>
              <button class="close" aria-label="Close modal">
                  <i class="fas fa-times"></i>
              </button>
          </div>
          
          <div class="modal-body">
              <div class="detail-group">
                  <span class="detail-label">Device Name</span>
                  <span class="detail-value">${parseUserAgent(
                    device.userAgent
                  )}</span>
              </div>

              <div class="detail-group">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">
                  ${
                    device.revoked
                      ? '<span class="badge badge-danger">Revoked</span>'
                      : statusBadge
                  }
                  </span>
              </div>

              <div class="detail-group">
                  <span class="detail-label">IP Address</span>
                  <span class="detail-value">${device.createdByIp}</span>
              </div>

              <div class="detail-group">
                  <span class="detail-label">Created</span>
                  <span class="detail-value">${new Date(
                    device.created
                  ).toLocaleString()}</span>
              </div>

              <div class="detail-group">
                  <span class="detail-label">Expires</span>
                  <span class="detail-value">${new Date(
                    device.expires
                  ).toLocaleString()}</span>
              </div>

              <div class="detail-group">
                  <span class="detail-label">Last Used</span>
                  <span class="detail-value">${
                    device.lastUsed
                      ? new Date(device.lastUsed).toLocaleString()
                      : "N/A"
                  }</span>
              </div>

              <div class="detail-group">
                  <span class="detail-label">Device ID</span>
                  <span class="detail-value">
                      <code style="background: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 4px;">
                          ${device.id}
                      </code>
                  </span>
              </div>

              <div class="detail-group">
                  <span class="detail-label">User Agent</span>
                  <span class="detail-value" style="font-size: 0.875rem; color: var(--text-secondary);">
                      ${device.userAgent}
                  </span>
              </div>

              ${
                device.revoked
                  ? `
                  <div style="margin-top: 1.5rem; padding: 1rem; background: #fef2f2; border-radius: 8px;">
                      <div class="detail-group" style="margin-bottom: 0.5rem;">
                          <span class="detail-label">Revoked By IP</span>
                          <span class="detail-value">${
                            device.revokedByIp
                          }</span>
                      </div>
                      <div class="detail-group" style="margin-bottom: 0;">
                          <span class="detail-label">Reason</span>
                          <span class="detail-value">${
                            device.revocationReason || "N/A"
                          }</span>
                      </div>
                  </div>
              `
                  : ""
              }
          </div>
          
          <div class="modal-footer">
              <button class="btn btn-secondary" onclick="closeModal(this)">
                  Close
              </button>
              ${
                device.revoked
                  ? ""
                  : `
                                  <button class="btn btn-danger" onclick="revokeAccess('${
                                    device.id
                                  }', '${parseUserAgent(device.userAgent)}')">
                                      Revoke Access
                                  </button>
                              `
              }
          </div>
      </div>
  `;

  // Add modal to body and show it
  document.body.appendChild(modal);
  // Force reflow
  modal.offsetHeight;
  modal.classList.add("show");

  // Setup close handlers
  const closeBtn = modal.querySelector(".close");
  closeBtn.onclick = () => closeModal(modal);
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  };
}

async function revokeAccess(deviceId, modal) {
  try {
    const response = await fetch(`${API.security}/${deviceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    });

    if (response.ok) {
      showSuccess("Device access revoked successfully");
      document.body.removeChild(modal);
      fetchConnectedDevices(); // Refresh the device list
    } else {
      const data = await response.json();
      showError(data.message || "Failed to revoke access");
    }
  } catch (error) {
    console.error("Error revoking access:", error);
    showError("An error occurred while revoking access");
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

let currentStep = "disableTwoFactor";

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
      showStep("twoFactorFlow");
      document.getElementById("qrStep").style.display = "block";
    }
  } catch (error) {
    showError("Error setting up 2FA");
  }
}

function showStep(step) {
  document.querySelectorAll(".setup-state").forEach((state) => {
    state.classList.remove("active");
  });
  document.getElementById(step).classList.add("active");
  currentStep = step;

  if (step === "enableTwoFactor") {
    document.getElementById("2faStatus").textContent = "Disabled";
    document.getElementById("2faStatus").style.backgroundColor = "#ff4d4f";
    document.getElementById("2faStatus").style.color = "#fff";
  } else if (step === "twoFactorFlow") {
    document.getElementById("2faStatus").textContent = "Setup";
    document.getElementById("2faStatus").style.backgroundColor = "#faad14";
    document.getElementById("2faStatus").style.color = "#000";
    document.getElementById("secButton").style.display = "none";
  } else if (step === "disableTwoFactor") {
    document.getElementById("2faStatus").textContent = "Enabled";
    document.getElementById("2faStatus").style.backgroundColor = "#52c41a";
    document.getElementById("2faStatus").style.color = "#fff";
    document.getElementById("secButton").style.display = "none";
  }
}

function showVerifyCode() {
  document.getElementById("qrStep").style.display = "none";
  document.getElementById("verifyStep").style.display = "block";
}

async function verifyTwoFactor() {
  const code = Array.from(document.querySelectorAll(".code-input"))
    .map((input) => input.value)
    .join("");

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
      showStep("disableTwoFactor");
      showError("2FA enabled successfully");
    } else {
      showError("Invalid verification code");
    }
  } catch (error) {
    showError("Error verifying 2FA code");
  }
}

async function disableTwoFactor() {
  if (
    confirm(
      "Are you sure you want to disable two-factor authentication? This will make your account less secure."
    )
  ) {
    try {
      const response = await fetch(API.mfaSetup, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        showStep("enableTwoFactor");
        showError("2FA disabled successfully");
      }
    } catch (error) {
      showError("Error disabling 2FA");
    }
  }
}

// Password management
async function handlePasswordChange(event) {
  event.preventDefault();
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const response = await fetch(`${API.password}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        oldPassword: currentPassword,
        newPassword,
      }),
    });

    if (response.ok) {
      localStorage.removeItem("tokenExpiry");
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

async function fastAuthCheck() {
  try {
    const response = await fetch(API.profile, {
      method: "GET",
      credentials: "include",
    });
    loggedIn = true;
    return response.ok;
  } catch (error) {
    console.error("Error during fast auth check:", error);
    return false;
  }
}

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

// Authentication handlers
async function handleLogin(event) {
  document.getElementById("loadingScreen").style.display = "flex";
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
      credentials: "include",
    };

    if (mfaCode) {
      const response = await fetch(API.mfaVerify, {
        ...fetchOptions,
        body: JSON.stringify({ email, password, code: mfaCode }),
      });

      const data = await response.json();
      if (data) {
        localStorage.setItem("token", data.accessToken);
        const newExpiryTime = new Date(new Date().getTime() + 10 * 60000);
        localStorage.setItem("tokenExpiry", newExpiryTime.toISOString());
        showSuccess("Login successful!");
        switchForm("dashboard");
        loadUserData();
        handleRedirectAfterLogin();
        document.getElementById("loadingScreen").style.display = "none";
        console.log("Login successful 111");
      } else {
        showError(data.message);
        document.getElementById("loadingScreen").style.display = "none";
      }
    } else {
      const response = await fetch(API.login, {
        ...fetchOptions,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (data.message === "MFA is required") {
        document.getElementById("mfaGroup").style.display = "block";
        showError("Please enter your 2FA code");
        return;
      }

      if (data.statusCode === 200 || data.statusCode === 201) {
        localStorage.setItem("token", data.accessToken);
        const newExpiryTime = new Date(new Date().getTime() + 10 * 60000);
        localStorage.setItem("tokenExpiry", newExpiryTime.toISOString());

        showSuccess("Login successful!");

        switchForm("dashboard");
        loadUserData();
        handleRedirectAfterLogin();
      } else {
        showError(data.message);
        document.getElementById("loadingScreen").style.display = "none";
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
  button.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Creating account...';

  try {
    const formData = {
      username: document.getElementById("registerUsername").value,
      name: document.getElementById("registerFullname").value,
      email: document.getElementById("registerEmail").value,
      password: document.getElementById("registerPassword").value,
      birthdate: new Date(
        document.getElementById("registerBirthdate").value
      ).toISOString(),
      language: window.navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const response = await fetch(API.register, {
      method: "POST",
      credentials: "include",
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

async function handleLogout() {
  try {
    const response = await fetch(API.logout, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("userId");

      showSuccess("Logged out successfully");
      switchForm("login");
    } else {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    showError("An error occurred during logout");
  }
}

let img1 = document.getElementById("img1");
let img2 = document.getElementById("img2");

let desktopImages = [
  "../../src/content/images/1big (Large).png",
  "../../src/content/images/2big (Large).png",
  "../../src/content/images/3big (Large).png",
  "../../src/content/images/4big (Large).png",
  "../../src/content/images/5big (Large).png",
  "../../src/content/images/6big (Large).png",
  "../../src/content/images/7big (Large).png",
];

let mobileImages = [
  "../../src/content/images/1big (Small).png",
  "../../src/content/images/2big (Small).png",
  "../../src/content/images/3big (Small).png",
  "../../src/content/images/4big (Small).png",
  "../../src/content/images/5big (Small).png",
  "../../src/content/images/6big (Small).png",
  "../../src/content/images/7big (Small).png",
];

let images = window.innerWidth <= 768 ? mobileImages : desktopImages;
let randomImage = images[Math.floor(Math.random() * images.length)];
img1.src = randomImage;
img2.src = randomImage;

// Update images on window resize
window.addEventListener("resize", () => {
  images = window.innerWidth <= 768 ? mobileImages : desktopImages;
  randomImage = images[Math.floor(Math.random() * images.length)];
  img1.src = randomImage;
  img2.src = randomImage;
});

// Function to refresh the token
async function refreshToken() {
  const currentToken = localStorage.getItem("token");
  const tokenExpiry = localStorage.getItem("tokenExpiry");

  // Check if the current token is still valid or is about to expire in the next 1 minute
  const expiryDate = new Date(tokenExpiry);
  const now = new Date();
  const timeDiff = expiryDate - now;

  if (expiryDate > now && timeDiff > 60000) {
    console.log("Current token is still valid");
    return;
  }

  console.log("Attempting token refresh");
  try {
    const response = await fetch(API.refresh, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Token refresh response:", data);
      localStorage.setItem("token", data.accessToken);
      const newExpiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes from now
      localStorage.setItem("tokenExpiry", newExpiryTime.toISOString());
      console.log("Token refreshed successfully");
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}

// Function to check and refresh token periodically
function setupTokenRefresh() {
  // Check token validity and refresh if necessary on setup
  refreshToken();

  // Then check every minute
  setInterval(refreshToken, 60000);
}

let connectedAppsArray = [];

// Function to fetch and display connected applications
async function loadConnectedApps() {
  try {
    const response = await fetch("https://apis.erzen.xyz/oauth/applications", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch applications");
    }

    connectedAppsArray = await response.json();
    displayConnectedApps(connectedAppsArray);
  } catch (error) {
    console.error("Error loading applications:", error);
    // You might want to show an error message to the user
  }
}

// Function to format the date
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
}

// Function to display the applications
function displayConnectedApps(apps) {
  const container = document.getElementById("oauthAppsList");
  container.innerHTML = ""; // Clear existing content

  apps.forEach((app) => {
    const appCard = document.createElement("div");
    appCard.className = "app-card";

    appCard.innerHTML = `
    <div class="app-icon">
    ${
      app.logoUrl
        ? `<img src="${app.logoUrl}" alt="${app.applicationName}" style="width: 32px; height: 32px;">`
        : `<i class="fas fa-cube"></i>`
    }
    </div>
    <div class="app-info">
    <h4>${app.applicationName}</h4>
    <p>Connected ${formatRelativeTime(app.grantedAt)}</p>
    <div class="permissions">
    ${app.grantedScopes
      .map((scope) => `<span class="permission-badge">${scope}</span>`)
      .join("")}
      </div>
      </div>
      <div class="app-actions">
      <button class="btn btn-secondary" onclick="viewAppDetails('${
        app.clientId
      }')">View Details</button>
      <button class="btn btn-danger" onclick="revokeAccess('${
        app.clientId
      }', '${app.applicationName}')">Revoke Access</button>
      </div>
      `;

    container.appendChild(appCard);
  });
}

// Function to handle revoking access
async function revokeAccess(clientId, appName) {
  if (!confirm(`Are you sure you want to revoke access for ${appName}?`)) {
    return;
  }

  try {
    const response = await fetch("https://apis.erzen.xyz/oauth/revoke", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ client_id: clientId }),
    });

    if (!response.ok) {
      throw new Error("Failed to revoke access");
    }

    // Reload the apps list after successful revocation
    loadConnectedApps();
  } catch (error) {
    console.error("Error revoking access:", error);
    // You might want to show an error message to the user
  }
}

function viewAppDetails(clientId) {
  const app = connectedAppsArray.find((app) => app.clientId === clientId);
  if (!app) {
    showError("Application not found");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
  <div class="modal-content">
  <div class="modal-header">
  <div style="display: flex; align-items: center;">
  ${
    app.logoUrl
      ? `<img src="${app.logoUrl}" alt="${app.applicationName}" class="app-logo">`
      : `<div class="app-logo" style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center;">
    <i class="fas fa-cube fa-2x"></i>
    </div>`
  }
  <h2 class="modal-title">${app.applicationName}</h2>
  </div>
  <button class="close" aria-label="Close modal">
  <i class="fas fa-times"></i>
  </button>
  </div>
  
          <div class="modal-body">
          <div class="detail-group">
          <span class="detail-label">Client ID</span>
          <span class="detail-value">${app.clientId}</span>
          </div>
          
          <div class="detail-group">
          <span class="detail-label">Connected</span>
          <span class="detail-value">${formatRelativeTime(app.grantedAt)}</span>
          </div>
          
          
          <div class="detail-group">
          <span class="detail-label">Description</span>
          <span class="detail-value">${
            app.description || "No description provided"
          }</span>
          </div>
          
          <div class="detail-group">
          <span class="detail-label">Permissions</span>
          <div class="scope-list">
          ${app.grantedScopes
            .map((scope) => `<span class="scope-badge">${scope}</span>`)
            .join("")}
            </div>
            </div>
            
            </div>
            
            <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal(this)">
            Close
            </button>
              <button class="btn btn-danger" onclick="revokeAccess('${
                app.clientId
              }', '${app.applicationName}')">
              Revoke Access
              </button>
              </div>
              </div>
              `;

  // Add modal to body and show it
  document.body.appendChild(modal);
  // Force reflow
  modal.offsetHeight;
  modal.classList.add("show");

  // Setup close handlers
  const closeBtn = modal.querySelector(".close");
  closeBtn.onclick = () => closeModal(modal);
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  };
}

// Helper function to close modal
function closeModal(element) {
  const modal = element.closest(".modal");
  modal.classList.remove("show");
  setTimeout(() => modal.remove(), 300);
}

// Load connected apps when the section becomes visible
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.style.display !== "none") {
      loadConnectedApps();
    }
  });
});

// Start observing the section for display changes
const connectedAppsSection = document.getElementById("connectedAppsSection");
observer.observe(connectedAppsSection, {
  attributes: true,
  attributeFilter: ["style"],
});

async function forgotPassword() {
  const email = document.getElementById("loginEmail").value;

  if (!email || !email.includes("@")) {
    showError("Please enter your email address");
    return;
  }

  try {
    const response = await fetch(API.forgotPassword, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      showSuccess("Password reset link sent successfully");
    } else {
      const data = await response.json();
      showError(data.message);
    }
  } catch (error) {
    showError("Error sending password reset link");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const loggedIn = await fastAuthCheck();
  if (loggedIn) {
    switchForm("dashboard");
    loadUserData();
    document.getElementById("loadingScreen").style.display = "none";

    setupTokenRefresh();
    initializePrivacySettings();

    // Add event listener for create button
    document
      .querySelector(".create-app")
      .addEventListener("click", showCreateModal);

    // Global event delegation for modal close buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches(".modal") || e.target.matches(".close")) {
        closeModal(e.target.closest(".modal"));
      }
    });

    // Initialize password strength checker
    const newPasswordInput = document.getElementById("newPassword");
    if (newPasswordInput) {
      checkPasswordStrength(newPasswordInput.value);
      newPasswordInput.addEventListener("input", function () {
        checkPasswordStrength(this.value);
      });
    }

    // Initialize 2FA state
    showStep(currentStep);

    // Setup verification code input handling
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

    // Setup password visibility toggles
    document.querySelectorAll(".password-toggle").forEach((button) => {
      button.addEventListener("click", function () {
        const input = this.parentElement.querySelector("input");
        const icon = this.querySelector("i");
        if (input.type === "password") {
          input.type = "text";
          icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
          input.type = "password";
          icon.classList.replace("fa-eye-slash", "fa-eye");
        }
      });
    });
  } else {
    switchForm("login");
    document.getElementById("loadingScreen").style.display = "none";
  }
});

// Handle password visibility toggle
document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", function () {
    const input = this.parentElement.querySelector("input");
    const icon = this.querySelector("i");

    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
});

// Password Management
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

// File input change handler
document
  .getElementById("updateProfilePhoto")
  .addEventListener("change", async (event) => {
    const formData = new FormData();
    const file = event.target.files[0];
    formData.append("file", file);
    let uploadedImageUrl = null;

    try {
      const response = await fetch("https://apis.erzen.xyz/storage/upload", {
        // Updated endpoint
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create an EventSource to handle SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          showSuccess("Upload completed successfully");
          await updateProfileImage(uploadedImageUrl);
          break;
        }

        const chunk = decoder.decode(value);
        const messages = chunk
          .split("\n\n")
          .filter((msg) => msg.trim() !== "")
          .map((msg) => msg.replace("data: ", ""));

        for (const msg of messages) {
          try {
            const data = JSON.parse(msg);

            if (data.error) {
              showError(data.error);
              return;
            }

            // Update progress if the chunk contains progress information
            if (data.progress) {
              updateProgress(data.progress);
            }

            if (data.url) {
              uploadedImageUrl = data.url;
            }
          } catch (e) {
            console.log("Progress update:", msg);
          }
        }
      }
    } catch (error) {
      showError(`Upload failed: ${error.message}`);
    }
  });

// Helper function to update progress
function updateProgress(progress) {
  // Assuming you have a progress element
  const progressBar = document.getElementById("uploadProgress");
  if (progressBar) {
    progressBar.value = progress;
    progressBar.textContent = `${Math.round(progress)}%`;
    showSuccess(`Upload progress: ${progress}%`);
  }
}

async function updateProfileImage(url) {
  try {
    const response = await fetch(
      "https://apis.erzen.xyz/v1/user/change-profilePicture",
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ photo: url }),
      }
    );

    if (response.ok) {
      showError("Profile image updated successfully");
      loadUserData();
    } else {
      const data = await response.json();
      showError(data.message);
    }
  } catch (error) {
    showError("Error updating profile image");
  }
}
