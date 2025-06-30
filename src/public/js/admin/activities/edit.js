// JavaScript for the activity edit page
document.addEventListener("DOMContentLoaded", function () {
  // Initialize activity counter
  let activityCounter = document.querySelectorAll(".activity-item").length;

  // Add new activity
  window.addActivity = function () {
    const container = document.getElementById("activities-container");
    const index = activityCounter++;

    const activityHtml = `
      <div class="activity-item card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="card-title">Activity ${index + 1}</h5>
            <button type="button" class="btn btn-danger btn-sm remove-activity" data-index="${index}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label">Activity Title</label>
                <input type="text" class="form-control" name="activities[${index}][title]" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="activities[${index}][description]" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Schedule</label>
                <input type="text" class="form-control" name="activities[${index}][schedule]" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Location</label>
                <input type="text" class="form-control" name="activities[${index}][location]" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Participants</label>
                <input type="text" class="form-control" name="activities[${index}][participants]" required />
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", activityHtml);

    // Add event listener to the new remove button
    const removeButtons = document.querySelectorAll(".remove-activity");
    const lastButton = removeButtons[removeButtons.length - 1];
    lastButton.addEventListener("click", function () {
      this.closest(".activity-item").remove();
    });
  };

  // Remove activity
  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("remove-activity") ||
      e.target.closest(".remove-activity")
    ) {
      const button = e.target.classList.contains("remove-activity")
        ? e.target
        : e.target.closest(".remove-activity");
      button.closest(".activity-item").remove();
    }
  });

  // Form submission
  const form = document.getElementById("activitiesForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate required fields
      const requiredFields = [
        "title",
        "description",
        "category",
        "schedule",
        "location",
        "participants",
      ];
      let hasError = false;

      requiredFields.forEach((field) => {
        const input = this.querySelector(`[name="${field}"]`);
        if (input && !input.value.trim()) {
          hasError = true;
          input.classList.add("is-invalid");

          // Add feedback if not exists
          let feedbackDiv =
            input.parentElement.querySelector(".invalid-feedback");
          if (!feedbackDiv) {
            feedbackDiv = document.createElement("div");
            feedbackDiv.className = "invalid-feedback";
            input.parentElement.appendChild(feedbackDiv);
          }

          feedbackDiv.textContent =
            field.charAt(0).toUpperCase() + field.slice(1) + " is required";
        } else if (input) {
          input.classList.remove("is-invalid");
          const feedbackDiv =
            input.parentElement.querySelector(".invalid-feedback");
          if (feedbackDiv) feedbackDiv.remove();
        }
      });

      if (hasError) return;

      // Disable submit button and show loading state
      const submitButton = this.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

      // Submit form via AJAX
      const formData = new FormData(this);

      fetch(this.action, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              try {
                return JSON.parse(text);
              } catch {
                throw new Error(text || "Failed to update activity");
              }
            });
          }
          return response.json();
        })
        .then((data) => {
          // Show success message
          const alertDiv = document.createElement("div");
          alertDiv.className =
            "alert alert-success alert-dismissible fade show";
          alertDiv.innerHTML = `
          Activity updated successfully!
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

          const alertContainer = document.getElementById("alert-container");
          alertContainer.innerHTML = "";
          alertContainer.appendChild(alertDiv);

          // Scroll to top
          window.scrollTo(0, 0);

          // Re-enable submit button
          submitButton.disabled = false;
          submitButton.innerHTML =
            '<i class="fas fa-save me-1"></i>Save Changes';
        })
        .catch((error) => {
          console.error("Error:", error);

          // Show error message
          const alertDiv = document.createElement("div");
          alertDiv.className = "alert alert-danger alert-dismissible fade show";
          alertDiv.innerHTML = `
          ${error.error || error.message || "Failed to update activity"}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

          const alertContainer = document.getElementById("alert-container");
          alertContainer.innerHTML = "";
          alertContainer.appendChild(alertDiv);

          // Scroll to top
          window.scrollTo(0, 0);

          // Re-enable submit button
          submitButton.disabled = false;
          submitButton.innerHTML =
            '<i class="fas fa-save me-1"></i>Save Changes';
        });
    });
  }
});
