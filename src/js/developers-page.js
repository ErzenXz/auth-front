const DEV_API = {
  list: "https://localhost:3000/oauth/applications/dev",
  register: "https://localhost:3000/oauth/applications/register",
  edit: "https://localhost:3000/oauth/applications/edit",
  rotate: "https://localhost:3000/oauth/applications/rotate-secret",
};

// Store for application data
let applications = [];

// Fetch and render applications on page load
async function initializeDeveloperSection() {
  try {
    const response = await fetch(DEV_API.list, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    });
    applications = await response.json();
    renderApplications(applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
  }
}

// Render the applications list
function renderApplications(apps) {
  const container = document.getElementById("oauthApps");
  if (apps.length === 0) {
    container.innerHTML = "<p>You don't have any created apps.</p>";
    return;
  }
  container.innerHTML = apps
    .map(
      (app) => `
        <div class="app-card">
            <div class="app-icon">
                ${
                  app.iconUrl
                    ? `<img src="${app.iconUrl}" alt="${app.name}" />`
                    : '<i class="fas fa-cube"></i>'
                }
            </div>
            <div class="app-info">
                <h4>${app.name}</h4>
                <p>Client ID: ${app.clientId} • Created ${formatTimeAgo(
        app.createdAt
      )}</p>
            </div>
            <div class="app-actions">
                <button class="btn btn-secondary" onclick="showEditModal('${
                  app.clientId
                }')">Edit</button>
                <button class="btn btn-primary" onclick="showKeysModal('${
                  app.clientId
                }')">View Keys</button>
            </div>
        </div>
    `
    )
    .join("");
}

// Create application modal
function showCreateModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Create New Application</h2>
                <button class="close" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="createAppForm">
                    <div class="form-group">
                        <label for="appName">Application Name</label>
                        <input type="text" id="appName" required>
                    </div>
                    <div class="form-group">
                        <label for="redirectUri">Redirect URI</label>
                        <input type="url" id="redirectUri" required>
                    </div>
                    <div class="form-group">
                        <label for="privacyPolicy">Privacy Policy URL</label>
                        <input type="url" id="privacyPolicy">
                    </div>
                    <div class="form-group">
                        <label for="terms">Terms of Service URL</label>
                        <input type="url" id="terms">
                    </div>
                    
                    <div class="form-group">
                        <label for="imageURLcreate">Logo URL</label>
                        <input type="url" id="imageURLcreate">
                    </div>

                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
                <button class="btn btn-primary" onclick="createApplication()">Create</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 50);
}

// Edit application modal
function showEditModal(clientId) {
  const app = applications.find((a) => a.clientId === clientId);
  if (!app) return;

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Edit Application</h2>
                <button class="close" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editAppForm">
                    <input type="hidden" id="editClientId" value="${
                      app.clientId
                    }">
                    <div class="form-group">
                        <label for="editName">Application Name</label>
                        <input type="text" id="editName" value="${
                          app.name
                        }" required>
                    </div>
                    <div class="form-group">
                        <label for="editRedirectUri">Redirect URI</label>
                        <input type="url" id="editRedirectUri" value="${
                          app.redirectUris[0]
                        }" required>
                    </div>
                    <div class="form-group">
                        <label for="editPrivacyPolicy">Privacy Policy URL</label>
                        <input type="url" id="editPrivacyPolicy" value="${
                          app.privacyPolicyUrl || ""
                        }">
                    </div>
                    <div class="form-group">
                        <label for="editTerms">Terms of Service URL</label>
                        <input type="url" id="editTerms" value="${
                          app.termsOfServiceUrl || ""
                        }">
                    </div>
                    <div class="form-group">
                        <label for="editLogoURL">Application Logo URL</label>
                        <input type="url" id="editLogoURL" value="${
                          app.logoUrl || ""
                        }">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this)">Cancel</button>
                <button class="btn btn-primary" onclick="updateApplication('${
                  app.clientId
                }')">Update</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 50);
}

// View keys modal
function showKeysModal(clientId) {
  const app = applications.find((a) => a.clientId === clientId);
  if (!app) return;

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Application Keys</h2>
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
                    <span class="detail-label">Client Secret</span>
                    <span class="detail-value">Client secret is encrypted and can't be viewed again. Please save it when you generate it.</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this)">Close</button>
                <button class="btn btn-primary" onclick="rotateSecret('${app.clientId}', '${app.clientSecret}')">
                    Rotate Secret
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 50);
}

function showCreatedKeysModal(clientId, clientSecret) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Application Keys</h2>
                <button class="close" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="detail-group">
                    <span class="detail-label">Client ID</span>
                    <span class="detail-value">${clientId}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Client Secret</span>
                    <span class="detail-value">${clientSecret}</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this)">Close</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 100);
}

// Create new application
async function createApplication() {
  const form = document.getElementById("createAppForm");
  const formData = {
    name: form.querySelector("#appName").value,
    redirectUris: [form.querySelector("#redirectUri").value],
    privacyPolicyUrl: form.querySelector("#privacyPolicy").value,
    termsOfServiceUrl: form.querySelector("#terms").value,
    allowedScopes: ["profile"],
    logoUrl: form.querySelector("#imageURLcreate").value,
  };

  try {
    const response = await fetch(DEV_API.register, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    applications.push(data);
    initializeDeveloperSection();
    closeModal(document.querySelector(".modal"));
    copyToClipboard(data.clientSecret);
    showCreatedKeysModal(data.clientId, data.clientSecret);
  } catch (error) {
    console.error("Failed to create application:", error);
  }
}

// Update existing application
async function updateApplication(appId) {
  const form = document.getElementById("editAppForm");
  const clientId = form.querySelector("#editClientId").value;
  const formData = {
    clientId,
    name: form.querySelector("#editName").value,
    redirectUris: [form.querySelector("#editRedirectUri").value],
    privacyPolicyUrl: form.querySelector("#editPrivacyPolicy").value,
    termsOfServiceUrl: form.querySelector("#editTerms").value,
    logoUrl: form.querySelector("#editLogoURL").value,
  };

  try {
    const response = await fetch(DEV_API.edit + "?application_id=" + appId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    applications = applications.map((app) =>
      app.clientId === clientId ? { ...app, ...data } : app
    );
    renderApplications();
    closeModal(document.querySelector(".modal"));
  } catch (error) {
    console.error("Failed to update application:", error);
  }
}

// Rotate client secret
async function rotateSecret(clientId, currentSecret) {
  try {
    const response = await fetch(DEV_API.rotate, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
      body: JSON.stringify({
        client_id: clientId,
        current_secret: currentSecret,
      }),
    });
    const data = await response.json();
    applications = applications.map((app) =>
      app.clientId === clientId
        ? { ...app, clientSecret: data.clientSecret }
        : app
    );
    // Refresh the keys modal
    closeModal(document.querySelector(".modal"));
    showKeysModal(clientId);
  } catch (error) {
    console.error("Failed to rotate secret:", error);
  }
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const months = Math.floor(
    (new Date() - new Date(date)) / (1000 * 60 * 60 * 24 * 30)
  );
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function copyToClipboard(text) {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}
