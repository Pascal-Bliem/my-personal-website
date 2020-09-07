const htmlBody = document.querySelector("body");
const postBody = document.querySelector(".post-title-body");
const headings = Array.from(postBody.querySelectorAll("h1, h2, h3, h4, h5, h6"));


// create the TOC element
const toc = document.createElement("div");
toc.classList.add("post-page-toc");
toc.classList.add("toc-hide");
const tocHeading = document.createElement("h5");
tocHeading.innerText = "Content";
toc.appendChild(tocHeading);

// make sure it doesn't overlap with the post body
function calcMaxWidth() {
    let shrink = 0.8;
    if (window.innerWidth > 1500) {
        shrink = 0.6;
    }
    return `${Math.floor(postBody.offsetLeft * shrink)}px`;
}

toc.style.maxWidth = calcMaxWidth();
// also when the window size changes
window.addEventListener("resize", () => {
    toc.style.maxWidth = calcMaxWidth();
});

// append to HTML body
htmlBody.appendChild(toc);

// TOC is hidden at the top of the page and only becomes 
// visible when scrolling down to the post body
window.addEventListener("scroll", (event) => {
    if (window.scrollY < postBody.offsetTop - toc.offsetHeight) {
        toc.classList.add("toc-hide");
    } else if (window.scrollY > postBody.offsetTop - toc.offsetHeight) {
        toc.classList.remove("toc-hide");
    }
});

// create the links to the headings in the TOC
const tocLinks = [];
headings.forEach(h => {
    heading = document.createElement("p");
    link = document.createElement("a");
    link.innerText = h.innerText;
    link.href = `#${h.id}`;
    heading.appendChild(link);
    toc.appendChild(heading);
    tocLinks.push(link);
});

// check if a heading is already within the scroll pane,
// if yes add class "current" to the corresponding TOC link which 
// will highlight it, remove class "current" from all other links
window.addEventListener("scroll", (event) => {
    for (let i = 0; i < headings.length; i++) {
        // get the offset of the headings w.r.t. the document
        const offset_i = (window.pageYOffset || document.documentElement.scrollTop) + headings[i].getBoundingClientRect().top;
        let offset_i1 = undefined;
        if (i < headings.length - 1) {
            offset_i1 = (window.pageYOffset || document.documentElement.scrollTop) + headings[i + 1].getBoundingClientRect().top;
        }

        if ((i === headings.length - 1) && (window.scrollY >= offset_i - 10)) {
            tocLinks[i].classList.add("current");
        }
        else if ((window.scrollY >= offset_i - 10) && (window.scrollY < offset_i1 - 10)) {
            tocLinks[i].classList.add("current");
        } else {
            tocLinks[i].classList.remove("current");
        }
    }
});