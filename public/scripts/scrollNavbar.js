const navbar = document.getElementById("navbar");

// hide the navbar when scrolling down and show it again 
// when scrolling up
let lastScrollPosition = 0;
window.addEventListener("scroll", (event) => {
    if (window.scrollY > lastScrollPosition) {
        navbar.classList.add("navbar-hide");
        lastScrollPosition = window.scrollY;
    } else if (window.scrollY < lastScrollPosition) {
        navbar.classList.remove("navbar-hide");
        lastScrollPosition = window.scrollY;
    }
});

// show the navbar when hovering over it
navbar.addEventListener("mouseenter", () => navbar.classList.remove("navbar-hide"));


