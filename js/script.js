// grab a box where elements will be injected into
const container = document.querySelector(".cards-container");
let pages = [];

const tags = new Set();
tags
  .add("html5")
  .add("css3")
  .add("javascript")
  .add("php")
  .add("mysql")
  .add("jquery")
  .add("paypal")
  .add("java")
  .add("api")
  .add("spring")
  .add("react")
  .add("strapi")
  .add("sqlite");



// fetch my projects metadata json
const fetchProjectList = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/tom-gora/webdev_basics/master/fetch-me.json",
  );
  const projects = await response.json();
  return projects;
};

// async respone
const handleProjects = async (response) => {
  const projects = response.projects;
  let counter = 4;

  // sort to make sure my projects "timeline" is in order
  const projectsSorted = projects.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  // loop through project objects to construct the page
  projectsSorted.forEach((project) => {
    //getting variables from the array coming from json
    const skills = project.skills;
    const categories = project.categories;
    const dateObj = new Date(project.date);
    const year = dateObj.getFullYear();
    const monthNumber = dateObj.getMonth();
    const day = dateObj.getDate();

    // helper temp variables
    let skillsHTML = "";
    let categoriesHTML = "";

    // map std date format to short month names strings
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // set the name of the month
    const month = monthNames[monthNumber];
    const currentCardTags = new Set();
    let currentCardTagsString = "";

    // construct raw html for skills section
    skills.forEach((skill) => {
      skillsHTML += `<i class="devicon-${skill}-plain"></i>`;
      tags.add(skill);
      currentCardTags.add(skill);
    });

    // construct raw html for categories section
    categories.forEach((category) => {
      categoriesHTML += `<small>${category}</small>`;
      tags.add(category);
      currentCardTags.add(category);
    });

    currentCardTags.forEach((tag) => {
      currentCardTagsString += `${tag} `;
    });

    // construct inner html for each card
    const cardHtml = `<header class="skills">${skillsHTML}</header>
      <div class="thumb" style="background-image: url('https://raw.githubusercontent.com/tom-gora${project.source}/thumbnail.png')";>
        <button class="view-link">
          <a href="#">
            <small>View it!</small>
            <ion-icon name="eye"></ion-icon>
          </a>
        </button>
      </div>
      <footer class="details" id="details-pane${counter}">
        <button class="chevron-hint" aria-controls="details-pane${counter}">
          <ion-icon name="chevron-up-circle"></ion-icon>
        </button>
        <div class="details-top">
          <span class="categories">${categoriesHTML}</span>
          <div class="date">
            <div class="date-card">
              <span>${day}</span>
              <span>${month}</span>
              <span>${year}</span>
            </div>
          </div>
          <h2 class="title">${project.title}</h2>
        </div>
        <div class="details-bottom">
          <p class="description">
            ${project.description}
          </p>
          <button class="view-link">
            <a href="#">
              <small>View it!</small>
              <ion-icon name="eye"></ion-icon>
            </a>
          </button>
        </div>
      </footer>`;

    // prep temp element for card code injection
    const tempElement = document.createElement("div");
    //prep its attricutes as needed
    tempElement.setAttribute("id", `card${counter}`);
    tempElement.setAttribute("data-project-index", `${counter - 2}`);
    tempElement.setAttribute("class", "card");
    tempElement.setAttribute("data-size", "");
    tempElement.setAttribute("data-expanded", "false");
    tempElement.setAttribute("data-tags", `${currentCardTagsString}`);
    tempElement.setAttribute("data-visible", "true");
    tempElement.setAttribute("aria-expanded", "false");
    // inject raw html into element
    tempElement.innerHTML = cardHtml;

    // append the completed card to the container
    container.appendChild(tempElement);

    counter++;
  });

  const getRawHTML = async (url) => {
    const htmlDataResponse = await fetch(url);
    const html = await htmlDataResponse.text();
    return html;
  };

  for (const project of projectsSorted) {
    const prepUrl = `https://raw.githubusercontent.com/tom-gora${project.source}/prepared.html`;

    const rawHTML = await getRawHTML(prepUrl);
    pages.push(rawHTML);
  }

  const iframeBox = document.querySelector("#backdrop-render");
  const iframe = iframeBox.querySelector("#render");
  const iframeToggle = iframeBox.querySelector("#toggle-render");
  const viewLinks = document.querySelectorAll(".view-link");

  viewLinks.forEach((viewLink) => {
    viewLink.addEventListener("click", () => {
      const projectCard = viewLink.closest(".card");
      const projectIndex = projectCard.getAttribute("data-project-index");
      iframe.contentWindow.document.open();
      iframe.srcdoc = pages[projectIndex];
      iframe.contentWindow.document.close();
      iframeBox.setAttribute("data-showing", "true");
    });
  });

  iframeToggle.addEventListener("click", () => {
    iframeBox.setAttribute("data-showing", "false");
  });

  // rest of page functionality:

  const toggles = document.querySelectorAll(".chevron-hint");
  const cards = document.querySelectorAll(".card");

  const addSizeMetadata = (elements) => {
    elements.forEach((element) => {
      const windowWidth = window.innerWidth;
      if (windowWidth >= 600) {
        element.setAttribute("data-size", "large");
      } else {
        element.setAttribute("data-size", "small");
      }
    });
  };
  addSizeMetadata(cards);
  const handleResize = () => {
    addSizeMetadata(cards);
  };

  window.addEventListener("resize", handleResize);

  const expandContent = (element) => {
    const parentCard = element.closest(".card");
    const parentFooter = element.parentElement;
    const parentCardThumbnail = parentCard.querySelector(".thumb");
    const parentCardDescription = parentCard.querySelector(".description");
    let cardSize = parentCard.getAttribute("data-size");
    let cardState = parentCard.getAttribute("data-expanded");

    const currentlyExpandedCard = document.querySelector(
      ".card[data-expanded='true']",
    );
    let currentlyExpandedFooter;
    let currentlyExpandedToggle;
    let currentlyExpandedThumbnail;
    let currentlyExpandedDescription;

    if (currentlyExpandedCard === null && cardSize === "small") {
      parentCard.setAttribute("data-expanded", "true");
      parentCard.setAttribute("aria-expanded", "true");
      parentFooter.style.bottom = 0;
      element.style.transform = "rotate(180deg)";
    } else if (currentlyExpandedCard === null && cardSize === "large") {
      parentFooter.style.bottom = 0;
      parentCard.setAttribute("data-expanded", "true");
      parentCard.setAttribute("aria-expanded", "true");
      parentCardThumbnail.style.height = "25rem";
      parentCardDescription.style.height = "fit-content";
      parentCardDescription.style.opacity = "1";
      element.style.transform = "rotate(0deg)";
    } else {
      currentlyExpandedFooter = currentlyExpandedCard.querySelector(".details");
      currentlyExpandedToggle =
        currentlyExpandedCard.querySelector(".chevron-hint");
      currentlyExpandedThumbnail =
        currentlyExpandedCard.querySelector(".thumb");
      currentlyExpandedDescription =
        currentlyExpandedCard.querySelector(".description");

      if (cardSize === "small" && cardState === "false") {
        parentCard.setAttribute("data-expanded", "true");
        parentCard.setAttribute("aria-expanded", "true");
        parentFooter.style.bottom = 0;
        element.style.transform = "rotate(180deg)";
        currentlyExpandedCard.setAttribute("data-expanded", "false");
        currentlyExpandedCard.setAttribute("aria-expanded", "false");
        currentlyExpandedFooter.style.bottom = "-9rem";
        currentlyExpandedToggle.style.transform = "rotate(0deg)";
      } else if (cardSize === "small" && cardState === "true") {
        parentCard.setAttribute("data-expanded", "false");
        parentCard.setAttribute("aria-expanded", "false");
        parentFooter.style.bottom = "-9rem";
        element.style.transform = "rotate(0deg)";
      } else if (cardSize === "large" && cardState === "false") {
        parentFooter.style.bottom = 0;
        parentCard.setAttribute("data-expanded", "true");
        parentCard.setAttribute("aria-expanded", "true");
        parentCardThumbnail.style.height = "25rem";
        parentCardDescription.style.height = "fit-content";
        parentCardDescription.style.opacity = "1";
        element.style.transform = "rotate(0deg)";
        currentlyExpandedCard.setAttribute("data-expanded", "false");
        currentlyExpandedCard.setAttribute("aria-expanded", "false");
        currentlyExpandedThumbnail.style.height = 0;
        currentlyExpandedToggle.style.transform = "rotate(180deg)";
        currentlyExpandedDescription.style.height = "0";
        currentlyExpandedDescription.style.opacity = "0";
      } else if (cardSize === "large" && cardState === "true") {
        parentFooter.style.bottom = 0;
        parentCard.setAttribute("data-expanded", "false");
        parentCard.setAttribute("aria-expanded", "false");
        parentCardThumbnail.style.height = 0;
        parentCardDescription.style.height = "0";
        parentCardDescription.style.opacity = "0";
        element.style.transform = "rotate(180deg)";
      }
    }
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      const clickedToggle = e.currentTarget;
      expandContent(clickedToggle);
    });
  });

  // if window resized past breakpoint in either direction it will be reloaded
  const resetCards = () => {
    location.reload();
  };

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-size" &&
        mutation.oldValue !== mutation.target.getAttribute("data-size")
      ) {
        resetCards();
      }
    }
  });

  const testedCard = cards[0];
  observer.observe(testedCard, {
    attributes: true,
    attributeFilter: ["data-size"],
    attributeOldValue: true, // Include the old value in the mutation object
  });

  // rest of code non-dependant on async response
  // navbar reposnsiveness
  const navigation = document.querySelector(".links-navbar");
  const navigationToggle = navigation.querySelector(".toggle-navbar");
  const navigationIcon = navigationToggle.querySelector("ion-icon");

  const filtersToggle = document.querySelector("#toggle-filters");
  const filtersDiv = document.querySelector("#filters-list");
  const linksList = document.querySelector("#links-list");
  const filtersToggleDescription = filtersToggle.querySelector(
    "#toggle-filters span",
  );

  // mobile nav sliding in/out
  const handleMobileNav = () => {
    const menuState = navigation.getAttribute("data-expanded");
    if (menuState === "false") {
      navigation.setAttribute("data-expanded", "true");
      navigation.style.paddingLeft = "1rem";
      navigationIcon.setAttribute("name", "close-circle");
    } else {
      navigation.setAttribute("data-expanded", "false");
      navigation.style.paddingLeft = "0.25rem";
      navigationIcon.setAttribute("name", "chevron-back-circle");
      filtersDiv.setAttribute("data-expanded", "false");
      linksList.setAttribute("data-expanded", "true");
      filtersToggleDescription.textContent = "Show Filters";
    }
  };

  navigationToggle.addEventListener("click", handleMobileNav);
  const animateTypewriter = () => {
    typewriter.setAttribute("data-animate", "true");
  };

  // handle dark theme switcher
  const themeToggle = document.querySelector("#toggle-mode");
  const themeToggleIcon = themeToggle.querySelector("ion-icon");
  const themeToggleText = themeToggle.querySelector("span");

  themeToggle.addEventListener("click", () => {
    const body = document.querySelector("body");
    const currentTheme = body.getAttribute("data-theme");

    if (currentTheme === "dark") {
      body.setAttribute("data-theme", "light");
      themeToggleText.textContent = "Go Dark!";
      themeToggleIcon.setAttribute("name", "moon");
    } else {
      body.setAttribute("data-theme", "dark");
      themeToggleText.textContent = "Go Light!";
      themeToggleIcon.setAttribute("name", "sunny");
    }
  });

  // make sure the bottom animation only plays once in the viewport
  const typewriter = document.querySelector(".typewriter h3");
  let typewriterObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting === true) animateTypewriter();
    },
    { threshold: [0.5] },
  );

  typewriterObserver.observe(typewriter);

  filtersToggle.addEventListener("click", () => {

    // tags.forEach((tag) => { console.log(tag) })
    let filtersState = filtersDiv.getAttribute("data-expanded");
    let navigationState = navigation.getAttribute("data-expanded");
    const cardSize = cards[0].getAttribute("data-size");
    let navHeight;
    const recalculateNavHeight = () => {
      navHeight = navigation.offsetHeight + 56;
    };

    const updateTopOffset = (offsetDistance) => {
      if (cardSize !== "large") {
        container.style.marginTop = "4rem";
      } else {
        if (filtersState === "false") {
          container.style.marginTop = offsetDistance + "px";
        } else {
          container.style.marginTop = "12rem";
        }
      }
    };

    if (filtersState === "false" && navigationState === "false") {
      filtersDiv.setAttribute("data-expanded", "true");
      linksList.setAttribute("data-expanded", "false");
      navigation.setAttribute("data-expanded", "true");
      filtersToggleDescription.textContent = "Hide Filters";
      navigationIcon.setAttribute("name", "close-circle");
      recalculateNavHeight();
      updateTopOffset(navHeight);
    } else if (filtersState === "true" && navigationState === "false") {
      filtersDiv.setAttribute("data-expanded", "false");
      linksList.setAttribute("data-expanded", "true");
      navigation.setAttribute("data-expanded", "false");
      filtersToggleDescription.textContent = "Show Filters";
      recalculateNavHeight();
      updateTopOffset(navHeight);
    } else if (filtersState === "false" && navigationState === "true") {
      filtersDiv.setAttribute("data-expanded", "true");
      linksList.setAttribute("data-expanded", "false");
      navigation.setAttribute("data-expanded", "true");
      filtersToggleDescription.textContent = "Hide Filters";
      recalculateNavHeight();
      updateTopOffset(navHeight);
    } else if (filtersState === "true" && navigationState === "true") {
      filtersDiv.setAttribute("data-expanded", "false");
      linksList.setAttribute("data-expanded", "true");
      navigation.setAttribute("data-expanded", "true");
      filtersToggleDescription.textContent = "Show Filters";
      recalculateNavHeight();
      updateTopOffset(navHeight);
    }
  });

  const sortedTagsArray = Array.from(tags).sort();

  const sortedTags = new Set(sortedTagsArray);

  sortedTags.forEach((tag) => {
    const tempElement = document.createElement("small");
    tempElement.setAttribute("data-filtering", "active");

    tempElement.innerText = tag;
    filtersDiv.appendChild(tempElement);
  });

  const filters = filtersDiv.querySelectorAll("small");

  let currentActiveFilter = null;

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      if (filter === currentActiveFilter) {
        filters.forEach((f) => {
          f.setAttribute("data-filtering", "active");
        });
        currentActiveFilter = null;
      } else {
        filters.forEach((f) => {
          if (f !== filter) {
            f.setAttribute("data-filtering", "disabled");
          }
        });
        currentActiveFilter = filter;
      }

      cards.forEach((card) => {
        const tags = card.getAttribute("data-tags").split(" ");
        if (
          !currentActiveFilter ||
          tags.includes(currentActiveFilter.innerText)
        ) {
          card.setAttribute("data-visible", "true");
        } else {
          card.setAttribute("data-visible", "false");
        }
      });
    });
  });
};
fetchProjectList().then(handleProjects);
