document.addEventListener("DOMContentLoaded", () => {
    const hasLucide = typeof lucide !== "undefined";

    const menuToggle = document.getElementById("menuToggle");
    const nav = document.getElementById("navLinks");
    const overlay = document.getElementById("mobileOverlay");
    const navbar = document.querySelector(".navbar");
    const progressBar = document.querySelector(".scroll-progress span");
    const backToTop = document.getElementById("backToTop");
    const startBtn = document.getElementById("startBtn");
    const featuresBtn = document.getElementById("featuresBtn");
    const contactForm = document.getElementById("contactForm");
    const toast = document.getElementById("toast");
    const yearEl = document.getElementById("currentYear");

    const navLinks = document.querySelectorAll(".nav-links a");
    const revealElements = document.querySelectorAll(".reveal");
    const sections = document.querySelectorAll("section[id]");

    const setIcons = () => {
        if (hasLucide) {
            lucide.createIcons();
        }
    };

    const renderMenuIcon = (open) => {
        if (!menuToggle) return;
        menuToggle.innerHTML = open
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';
        setIcons();
    };

    const openMenu = () => {
        if (!nav || !menuToggle || !overlay) return;
        nav.classList.add("active");
        overlay.classList.add("active");
        menuToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
        renderMenuIcon(true);
    };

    const closeMenu = () => {
        if (!nav || !menuToggle || !overlay) return;
        nav.classList.remove("active");
        overlay.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
        renderMenuIcon(false);
    };

    const toggleMenu = () => {
        if (!nav) return;
        nav.classList.contains("active") ? closeMenu() : openMenu();
    };

    const smoothScrollToId = (id) => {
        const target = document.querySelector(id);
        if (!target) return;

        const headerOffset = 96;
        const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: targetY,
            behavior: "smooth"
        });
    };

    const showToast = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    };

    const updateProgress = () => {
        if (!progressBar) return;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    const updateNavbar = () => {
        if (!navbar || !backToTop) return;
        const scrolled = window.scrollY > 20;
        navbar.classList.toggle("scrolled", scrolled);
        backToTop.classList.toggle("show", window.scrollY > 500);
    };

    const setActiveNav = () => {
        const fromTop = window.scrollY + 120;

        sections.forEach((section) => {
            const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
            if (!link) return;

            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            const active = fromTop >= sectionTop && fromTop < sectionBottom;
            link.classList.toggle("active", active);
        });
    };

    if (hasLucide) {
        setIcons();
    }

    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    if (menuToggle && nav && overlay) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        overlay.addEventListener("click", closeMenu);

        document.addEventListener("click", (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeMenu();
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            smoothScrollToId(targetId);
            closeMenu();
        });
    });

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            window.location.href = "chat.html";
        });
    }

    if (featuresBtn) {
        featuresBtn.addEventListener("click", () => {
            smoothScrollToId("#features");
        });
    }

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector("button[type='submit']");
            const oldText = submitBtn ? submitBtn.innerHTML : "";

            if (submitBtn) {
                submitBtn.innerHTML = '<span>Message Sent</span><i data-lucide="check"></i>';
                if (hasLucide) lucide.createIcons();
                submitBtn.disabled = true;
            }

            contactForm.reset();
            showToast("Thanks! Your message has been prepared successfully.");

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = oldText;
                    submitBtn.disabled = false;
                    if (hasLucide) lucide.createIcons();
                }
            }, 2200);
        });
    }

    window.addEventListener("scroll", () => {
        updateProgress();
        updateNavbar();
        setActiveNav();
    });

    updateProgress();
    updateNavbar();
    setActiveNav();

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.18,
            rootMargin: "0px 0px -80px 0px"
        });

        revealElements.forEach((el) => observer.observe(el));
    } else {
        revealElements.forEach((el) => el.classList.add("active"));
    }

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});