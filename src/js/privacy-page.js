const PRIVACY_API = {
   get: "https://api.erzen.xyz/v1/privacy-settings/list",
   update: "https://api.erzen.xyz/v1/privacy-settings/update",
};

// Function to fetch privacy settings from the API
async function fetchPrivacySettings() {
   try {
      const response = await fetch(PRIVACY_API.get, {
         method: "GET",
         credentials: "include",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you store JWT in localStorage
         },
      });

      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Error fetching privacy settings:", error);
      throw error;
   }
}

// Function to update privacy settings via the API
async function updatePrivacySettings(settings) {
   try {
      const updateData = {
         settings: {
            ...settings,
            timestamps: {
               lastUpdated: new Date().toISOString(),
               lastReviewed: settings.timestamps?.lastReviewed,
            },
         },
      };

      const response = await fetch(PRIVACY_API.update, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
         },
         body: JSON.stringify(updateData),
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Error updating privacy settings:", error);
      throw error;
   }
}

// Function to initialize the form with fetched settings
async function initializePrivacySettings() {
   try {
      // Show loading state
      document.querySelector(".privacy").classList.add("loading");

      // Fetch settings from API
      const privacySettings = await fetchPrivacySettings();

      // Update form fields with fetched data
      document.getElementById("profileVisibility").value =
         privacySettings.settings.profile.visibility;
      document.getElementById("activeStatus").checked =
         privacySettings.settings.profile.activeStatus;
      document.getElementById("emailMarketing").checked =
         privacySettings.settings.advertising.emailMarketing;
      document.getElementById("securityAlerts").checked =
         privacySettings.settings.communication.notifications.securityAlerts;
      document.getElementById("loginAlerts").checked =
         privacySettings.settings.security.loginAlerts;
      document.getElementById("anonymousUsage").checked =
         privacySettings.settings.data.anonyomousUsage;
      document.getElementById("thirdPartyAds").checked =
         privacySettings.settings.advertising.thirdPartyAds;
      document.getElementById("personalizedAds").checked =
         privacySettings.settings.advertising.personalizedAds;

      // Remove loading state
      document.querySelector(".privacy").classList.remove("loading");
   } catch (error) {
      // Handle error state
      document.querySelector(".privacy").classList.remove("loading");
      showError("Failed to load privacy settings. Please try again later.");
      console.error("Error initializing privacy settings:", error);
   }
}

// Function to save updated privacy settings
async function savePrivacySettings() {
   try {
      // Show loading state
      const saveButton = document.querySelector(".privacy-save-btn");
      saveButton.disabled = true;
      saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

      const updatedSettings = {
         profile: {
            visibility: document.getElementById("profileVisibility").value,
            activeStatus: document.getElementById("activeStatus").checked,
         },
         communication: {
            messaging: {
               allowMessages: true, // Maintain existing value
               allowMessagesFrom: "FRIENDS", // Maintain existing value
               messagePreview: true, // Maintain existing value
               readReceipts: true, // Maintain existing value
            },
            notifications: {
               securityAlerts: document.getElementById("securityAlerts").checked,
               newsAlerts: true, // Maintain existing value
            },
         },
         security: {
            loginAlerts: document.getElementById("loginAlerts").checked,
         },
         data: {
            anonyomousUsage: document.getElementById("anonymousUsage").checked,
            cookies: {
               necessary: true,
               preferences: true,
               statistics: false,
               marketing: false,
            },
         },
         advertising: {
            personalizedAds: document.getElementById("personalizedAds").checked,
            thirdPartyAds: document.getElementById("thirdPartyAds").checked,
            emailMarketing: document.getElementById("emailMarketing").checked,
            interests: [],
         },
      };

      // Send updated settings to API
      await updatePrivacySettings(updatedSettings);

      // Show success message
      showSuccess("Privacy settings updated successfully!");

      // Reset button state
      saveButton.disabled = false;
      saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
   } catch (error) {
      // Handle error state
      showError("Failed to save privacy settings. Please try again later.");

      // Reset button state
      const saveButton = document.querySelector(".privacy-save-btn");
      saveButton.disabled = false;
      saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
   }
}
