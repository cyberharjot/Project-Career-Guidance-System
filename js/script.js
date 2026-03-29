document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       LOAD ICONS
    ================================= */
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("navLinks");

    /* ===============================
       MENU LOGIC (SAFE WRAPPED)
    ================================= */
    if (toggle && nav) {

        toggle.addEventListener("click", (e) => {
            e.stopPropagation();

            const isOpen = nav.classList.toggle("active");

            let icon = toggle.querySelector("svg");

            if (!icon && typeof lucide !== "undefined") {
                lucide.createIcons();
                icon = toggle.querySelector("svg");
            }

            if (icon) {
                icon.setAttribute("data-lucide", isOpen ? "x" : "menu");
                lucide.createIcons();
            }
        });

        /* CLICK OUTSIDE */
        document.addEventListener("click", (e) => {
            if (!nav.contains(e.target) && !toggle.contains(e.target)) {

                if (nav.classList.contains("active")) {
                    nav.classList.remove("active");

                    let icon = toggle.querySelector("svg");

                    if (icon) {
                        icon.setAttribute("data-lucide", "menu");
                        lucide.createIcons();
                    }
                }
            }
        });

        /* NAV LINKS CLICK */
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function(e) {

                e.preventDefault();

                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }

                nav.classList.remove("active");

                let icon = toggle.querySelector("svg");

                if (icon) {
                    icon.setAttribute("data-lucide", "menu");
                    lucide.createIcons();
                }
            });
        });

    }

    /* ===============================
       START BUTTON
    ================================= */
    const startBtn = document.getElementById("startBtn");

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            window.location.href = "chat.html";
        });
    }

    /* ===============================
       SCROLL ANIMATIONS
    ================================= */
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // smooth one-time animation
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => observer.observe(el));

});

/* ===============================
   NAVBAR SCROLL EFFECT
================================ */
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");

    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(2,6,23,0.9)";
        } else {
            navbar.style.background = "rgba(15, 23, 42, 0.6)";
        }
    }
});