const injectScript = require("injectScript");
const log = require("logToConsole");
const setDefaultConsentState = require("setDefaultConsentState");
const updateConsentState = require("updateConsentState");

/*
 * Because we can't rely on Fides.js to be initialized or even loaded before the GTM container, we use
 * the GTM events to update the consent state. If Fides.js runs before this, it will push the events to
 * the dataLayer and they will be processed asynchronously when the GTM container loads. To get the Fides*
 * events, the page loading Fides.js needs to call Fides.gtm() immediately after.
 * 
 * The events we are interested in:
 *
 *   gtm.init_consent  - The default consent initialization event that GTM fires when the container loads
 *   FidesInitialized  - The event that Fides.js fires when it has initialized
 *   FidesUpdating     - This is the event that Fides.js fires when the consent state is being updated
 * 
 * The expected behavior for a consent mode template is to set the default consent state when the GTM
 * container loads and then update it with the actual user preference. The consent is not saved across
 * page loads, which is why we call updateConsentState on FidesInitialized.
 */

// Time to wait for Fides.js to initialize and update the consent
const WAIT_FOR_UPDATE = data.waitForUpdate;

// Map between GTM and Fides consent types
const CONSENT_MAP = {
  ad_storage: [
    "marketing",
    "data_sales_and_sharing",
    "data_sales_sharing_gpp_us_state",
    "data_sharing_gpp_us_state",
    "data_sales_gpp_us_state",
    "targeted_advertising_gpp_us_state",
  ],
  ad_user_data: [
    "marketing",
    "data_sales_and_sharing",
    "data_sales_sharing_gpp_us_state",
    "data_sharing_gpp_us_state",
    "data_sales_gpp_us_state",
    "targeted_advertising_gpp_us_state",
  ],
  ad_personalization: [
    "marketing",
    "data_sales_and_sharing",
    "data_sales_sharing_gpp_us_state",
    "data_sharing_gpp_us_state",
    "data_sales_gpp_us_state",
    "targeted_advertising_gpp_us_state",
  ],
  analytics_storage: ["analytics"],
  functionality_storage: ["functional"],
  personalization_storage: ["functional"],
  security_storage: ["essential"],
};

if (data.event === "gtm.init_consent") {
  // The default Consent Initialization trigger fired
  log("Setting the default consent state");
  if (data.regionalOverrides) {
    for (const defaults of data.regionalOverrides) {
      const obj = {};
      for (const key in defaults) {
        obj[key] = defaults[key];
      }
      obj.region = defaults.region.split(",").map((r) => r.trim());
      obj.wait_for_update = WAIT_FOR_UPDATE;
      setDefaultConsentState(obj);
    }
  }
  
  const consent = {};
  for (const key in CONSENT_MAP) {
    consent[key] = data["default_" + key];
  }
  consent.wait_for_update = WAIT_FOR_UPDATE;
  setDefaultConsentState(consent);

  if (data.scriptUrl) {
    log("Injecting Fides.js");
    return injectScript(data.scriptUrl, data.gtmOnSuccess, data.gtmOnFailure);
  }

} else if (data.fides && (data.event === "FidesInitialized" || data.event === "FidesUpdating")) {
  // We use both FidesInitialized and FidesUpdating events to update the consent
  log("Updating the consent from Fides");
  updateGTMConsent(data.fides.consent);
}

return data.gtmOnSuccess();

// Only function definitions below this line

function updateGTMConsent(fidesConsent) {
  const gtmConsent = {};

  for (const key in CONSENT_MAP) {
    for (const value of CONSENT_MAP[key]) {
      if (fidesConsent[value] === true) {
        gtmConsent[key] = "granted";
        break;
      } else if (fidesConsent[value] === false) {
        gtmConsent[key] = "denied";
        break;
      }
    }

    // If none of the values are present, then fall back to the default from the data object
    if (gtmConsent[key] === undefined) {
      gtmConsent[key] = data["default_" + key];
    }
  }

  updateConsentState(gtmConsent);
}
