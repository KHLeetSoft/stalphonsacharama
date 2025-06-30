// Image preview functionality
document.getElementById("image").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert("Image file size should be less than 2MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("imagePreview").innerHTML =
        '<img src="' +
        e.target.result +
        '" class="img-fluid rounded" style="max-height: 200px;">' +
        '<div class="mt-2"><small class="text-muted">New image preview</small></div>';
    };
    reader.readAsDataURL(file);
  }
});

// Form handling
document
  .getElementById("activityForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const formData = new FormData(this);
      const activityId = document.getElementById("activityId").value;
      const url = activityId
        ? `/admin/activities/${activityId}`
        : "/admin/activities";
      const method = activityId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("success", data.message || "Activity saved successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showAlert("error", data.message || data.error || "An error occurred");
      }
    } catch (err) {
      console.error("Error:", err);
      showAlert("error", "An error occurred while saving the activity");
    }
  });

// Edit activity
async function editActivity(id) {
  try {
    const response = await fetch(`/admin/activities/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch activity");
    }

    const activity = await response.json();

    // Update form title
    document.getElementById("formTitle").textContent = "Edit Activity";

    // Fill form fields
    document.getElementById("activityId").value = activity._id;
    document.getElementById("title").value = activity.title;
    document.getElementById("category").value = activity.category;
    document.getElementById("description").value = activity.description;
    document.getElementById("schedule").value = activity.schedule;
    document.getElementById("location").value = activity.location;
    document.getElementById("participants").value = activity.participants;

    // Show current image if exists
    if (activity.image) {
      document.getElementById("imagePreview").innerHTML =
        '<img src="' +
        activity.image +
        '" class="img-fluid rounded" style="max-height: 200px;">' +
        '<div class="mt-2"><small class="text-muted">Current image</small></div>';
    }

    // Scroll to form
    document
      .getElementById("activityForm")
      .scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Error:", err);
    showAlert("error", "Error loading activity data");
  }
}

// Delete activity
async function deleteActivity(id) {
  if (!confirm("Are you sure you want to delete this activity?")) {
    return;
  }

  try {
    const response = await fetch(`/admin/activities/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      showAlert("success", data.message || "Activity deleted successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showAlert(
        "error",
        data.message || data.error || "Error deleting activity"
      );
    }
  } catch (err) {
    console.error("Error:", err);
    showAlert("error", "Error deleting activity");
  }
}

// Reset form
function resetForm() {
  document.getElementById("formTitle").textContent = "Add New Activity";
  document.getElementById("activityForm").reset();
  document.getElementById("activityId").value = "";
  document.getElementById("imagePreview").innerHTML = "";
}

// Show alert
function showAlert(type, message) {
  const alertContainer = document.getElementById("alert-container");
  const alertClass = type === "error" ? "alert-danger" : "alert-success";
  alertContainer.innerHTML =
    '<div class="alert ' +
    alertClass +
    ' alert-dismissible fade show" role="alert">' +
    message +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
    "</div>";
}
