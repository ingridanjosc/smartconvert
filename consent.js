(function () {
  const STORAGE_KEY = "smartconvert_cookie_consent";

  function updateConsent(value) {
    const granted = value === "accepted" ? "granted" : "denied";
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: granted,
        ad_storage: granted,
        ad_user_data: granted,
        ad_personalization: granted
      });
    }
  }

  function saveChoice(value) {
    localStorage.setItem(STORAGE_KEY, value);
    updateConsent(value);
    document.getElementById("cookieConsent")?.remove();
  }

  function showBanner() {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const banner = document.createElement("section");
    banner.id = "cookieConsent";
    banner.className = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.innerHTML = `
      <div class="cookie-consent__text">
        <strong>Your privacy matters</strong>
        <p>We use optional cookies to understand site usage and, in the future, show and measure ads. You can accept or reject them. <a href="privacy.html">Privacy policy</a></p>
      </div>
      <div class="cookie-consent__actions">
        <button type="button" class="cookie-button cookie-button--secondary" data-cookie-choice="rejected">Reject</button>
        <button type="button" class="cookie-button cookie-button--primary" data-cookie-choice="accepted">Accept</button>
      </div>`;

    banner.addEventListener("click", function (event) {
      const button = event.target.closest("[data-cookie-choice]");
      if (button) saveChoice(button.dataset.cookieChoice);
    });

    document.body.appendChild(banner);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showBanner);
  } else {
    showBanner();
  }
})();
