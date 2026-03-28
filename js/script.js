
/* ===============================
   SMOOTH SCROLL (NAV LINKS)
================================ */
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        target.scrollIntoView({
            behavior: 'smooth'
        });
    });
});


/* ===============================
   MOBILE MENU TOGGLE
================================ */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});


/* ===============================
   START BUTTON (GO TO CHAT PAGE)
================================ */
const startBtn = document.getElementById("startBtn");

if (startBtn) {
    startBtn.addEventListener("click", () => {
        window.location.href = "chat.html";
    });
}


/* ===============================
   NAVBAR SCROLL EFFECT
================================ */
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 50) {
        navbar.style.background = "rgba(2,6,23,0.9)";
    } else {
        navbar.style.background = "rgba(15, 23, 42, 0.6)";
    }
});


/* ===============================
   SCROLL ANIMATION (FADE IN)
================================ */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
});

document.querySelectorAll(".how-card, .feature-card").forEach(el => {
    el.classList.add("hidden-anim");
    observer.observe(el);
});