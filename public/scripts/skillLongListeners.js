// Ger all necessary DOM elements
// show-skill-buttons
const dsSkillBtn = document.getElementById("data-science-skill-btn");
const mlSkillBtn = document.getElementById("ml-skill-btn");
const cloudSkillBtn = document.getElementById("cloud-skill-btn");
const webSkillBtn = document.getElementById("web-skill-btn");
const teachingSkillBtn = document.getElementById("teaching-skill-btn");
const languageSkillBtn = document.getElementById("language-skill-btn");
const musicSkillBtn = document.getElementById("music-skill-btn");
const scienceSkillBtn = document.getElementById("science-skill-btn");
// long skill description containers
const dsSkillContainer = document.getElementById("data-science-skill-container");
const mlSkillContainer = document.getElementById("ml-skill-container");
const cloudSkillContainer = document.getElementById("cloud-skill-container");
const webSkillContainer = document.getElementById("web-skill-container");
const teachingSkillContainer = document.getElementById("teaching-skill-container");
const languageSkillContainer = document.getElementById("language-skill-container");
const musicSkillContainer = document.getElementById("music-skill-container");
const scienceSkillContainer = document.getElementById("science-skill-container");
//  the close-buttons in the description boxes
const closeButtons = Array.from(document.getElementsByClassName("skill-long-close-btn"));
//  all skill containers
const skillContainers = Array.from(document.getElementsByClassName("skill-long-container"));

// event listener to make the long skill descriptions visible when
// the respective button is clicked
dsSkillBtn.addEventListener("click", () => dsSkillContainer.classList.add("visible"));
mlSkillBtn.addEventListener("click", () => mlSkillContainer.classList.add("visible"));
cloudSkillBtn.addEventListener("click", () => cloudSkillContainer.classList.add("visible"));
webSkillBtn.addEventListener("click", () => webSkillContainer.classList.add("visible"));
teachingSkillBtn.addEventListener("click", () => teachingSkillContainer.classList.add("visible"));
languageSkillBtn.addEventListener("click", () => languageSkillContainer.classList.add("visible"));
musicSkillBtn.addEventListener("click", () => musicSkillContainer.classList.add("visible"));
scienceSkillBtn.addEventListener("click", () => scienceSkillContainer.classList.add("visible"));

// event listeners for the close buttons
closeButtons.forEach(btn => {
    btn.addEventListener("click", event => {
        const skillContainer = event.target.parentElement.parentElement;
        skillContainer.classList.remove("visible");
    })
});


skillContainers.forEach(ctn => {
    ctn.addEventListener("click", event => {
        let skillBox;
        Array.from(ctn.childNodes).forEach(child => {
            if (child.className === "skill-long-box") {
                skillBox = child;
            }
        })

        if (!skillBox.contains(event.target)) {
            ctn.classList.remove("visible");
        }
    })
});


