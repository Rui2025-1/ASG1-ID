// Promo code logic
function applyPromo() {
  const code = document.getElementById("promoCode").value;
  const message = document.getElementById("promoMessage");

  if (code === "WELCOME10") {
    message.textContent = "Promo applied! You get 10% off your first purchase.";
    message.style.color = "green";
  } else if (code === "LUCKY30") {
    message.textContent = "Promo applied! You get 30% off on your 5th order.";
    message.style.color = "green";}
  }  



// Scroll animation
window.addEventListener("scroll", () => {
  document.querySelectorAll(".service").forEach(service => {
    const position = service.getBoundingClientRect().top;
    if (position < window.innerHeight - 100) {
      service.classList.add("visible");
    }
  });
});