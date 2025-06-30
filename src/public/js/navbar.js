// Mobile menu toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  hamburger.addEventListener("click", function () {
    navMenu.classList.toggle("active");
    this.classList.toggle("fa-times");
    this.classList.toggle("fa-bars");
  });

  // Close menu when clicking on a nav link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      hamburger.classList.remove("fa-times");
      hamburger.classList.add("fa-bars");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar") && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      hamburger.classList.remove("fa-times");
      hamburger.classList.add("fa-bars");
    }
  });

  // Dropdown menu functionality for mobile
  document.querySelectorAll(".dropdown > .nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdown = link.parentElement;
        const menu = dropdown.querySelector(".dropdown-menu");
        menu.style.display = menu.style.display === "block" ? "none" : "block";
      }
    });
  });
});
