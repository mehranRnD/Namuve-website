export function showRedAlert(message, type = "danger") {
    // Remove any existing alerts
    const existingAlert = document.querySelector(".booking-alert");
    if (existingAlert) {
      existingAlert.remove();
    }
  
    // Create alert element
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show booking-alert`;
    alertDiv.role = "alert";
    alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas ${
          type === "danger" ? "fa-exclamation-circle" : "fa-info-circle"
        } me-2"></i>
        <strong>${message}</strong>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  
    // Add custom styles
    alertDiv.style.position = "fixed";
    alertDiv.style.top = "20px";
    alertDiv.style.left = "50%";
    alertDiv.style.transform = "translateX(-50%)";
    alertDiv.style.zIndex = "9999";
    alertDiv.style.minWidth = "280px";
    alertDiv.style.maxWidth = "90%";
    alertDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    alertDiv.style.borderRadius = "8px";
    alertDiv.style.opacity = "0"; // Start with opacity 0
  
    // Add alert to the DOM
    document.body.appendChild(alertDiv);
  
    // Trigger reflow to enable transition
    alertDiv.offsetHeight; // This forces a reflow
  
    // Fade in
    alertDiv.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    alertDiv.style.opacity = "1"; // Set opacity to 1
  
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      // Fade out
      alertDiv.style.opacity = "0"; // Set opacity to 0
      setTimeout(() => alertDiv.remove(), 500); // Remove after fade out
    }, 4000);
  }

  export function showGreenAlert(message, type = "success") {
    // Remove any existing alerts
    const existingAlert = document.querySelector(".booking-alert");
    if (existingAlert) {
      existingAlert.remove();
    }
  
    // Create alert element
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show booking-alert`;
    alertDiv.role = "alert";
    alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas ${
          type === "danger" ? "fa-exclamation-circle" : "fa-info-circle"
        } me-2"></i>
        <strong>${message}</strong>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  
    // Add custom styles
    alertDiv.style.position = "fixed";
    alertDiv.style.top = "22px";
    alertDiv.style.left = "50%";
    alertDiv.style.transform = "translateX(-50%)";
    alertDiv.style.zIndex = "9999";
    alertDiv.style.minWidth = "280px";
    alertDiv.style.maxWidth = "90%";
    alertDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    alertDiv.style.borderRadius = "8px";
    alertDiv.style.opacity = "0"; // Start with opacity 0
  
    // Add alert to the DOM
    document.body.appendChild(alertDiv);
  
    // Trigger reflow to enable transition
    alertDiv.offsetHeight; // This forces a reflow
  
    // Fade in
    alertDiv.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    alertDiv.style.opacity = "1"; // Set opacity to 1
  
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      // Fade out
      alertDiv.style.opacity = "0"; // Set opacity to 0
      setTimeout(() => alertDiv.remove(), 500); // Remove after fade out
    }, 10000);
  }

  export function showInfoAlert(message, type = "info") {
    // Remove any existing alerts
    const existingAlert = document.querySelector(".booking-alert");
    if (existingAlert) {
      existingAlert.remove();
    }
  
    // Create alert element
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show booking-alert`;
    alertDiv.role = "alert";
    alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas ${
          type === "danger" ? "fa-exclamation-circle" : "fa-info-circle"
        } me-2"></i>
        <strong>${message}</strong>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  
    // Add custom styles
    alertDiv.style.position = "fixed";
    alertDiv.style.top = "20px";
    alertDiv.style.left = "50%";
    alertDiv.style.transform = "translateX(-50%)";
    alertDiv.style.zIndex = "9999";
    alertDiv.style.minWidth = "280px";
    alertDiv.style.maxWidth = "90%";
    alertDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    alertDiv.style.borderRadius = "8px";
    alertDiv.style.opacity = "0"; // Start with opacity 0
  
    // Add alert to the DOM
    document.body.appendChild(alertDiv);
  
    // Trigger reflow to enable transition
    alertDiv.offsetHeight; // This forces a reflow
  
    // Fade in
    alertDiv.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    alertDiv.style.opacity = "1"; // Set opacity to 1
  
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      // Fade out
      alertDiv.style.opacity = "0"; // Set opacity to 0
      setTimeout(() => alertDiv.remove(), 500); // Remove after fade out
    }, 4000);
  }