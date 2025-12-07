/* ---------------------------------------------------------
   NAVIGATION LOGIC
   When a button is clicked, show that section.
   That’s it — simple on purpose.
--------------------------------------------------------- */

// Turning the NodeLists into arrays helps Safari behave
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));
const sections = Array.from(document.querySelectorAll(".section"));

navButtons.forEach((button) => {
    button.addEventListener("click", () => {

        // Highlight the clicked button
        navButtons.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");

        const targetID = button.getAttribute("data-section");

        // Hide all sections first
        sections.forEach((sec) => {
            sec.classList.remove("visible");
            sec.setAttribute("aria-hidden", "true");
        });

        // Then show the one we want
        const activeSection = document.getElementById(targetID);
        activeSection.classList.add("visible");
        activeSection.setAttribute("aria-hidden", "false");

        // On phones, keep the experience smooth by scrolling to top
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});

/* ---------------------------------------------------------
   CONTACT FORM FEEDBACK
   Since there's no backend, we just give friendly confirmation.
--------------------------------------------------------- */

const form = document.getElementById("contactForm");

if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        alert("Thanks for reaching out! We'll get back to you as soon as we can 😊");

        // Clears inputs so the user feels they've made progress
        form.reset();
    });
}
