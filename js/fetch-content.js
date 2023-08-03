const container = document.querySelector(".cards-container");

const fetchProjectList = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/tom-gora/webdev_basics/master/fetch-me.json"
  );
  const projects = await response.json();
  return projects;
};

fetchProjectList().then((response) => {
  const projects = response.projects;

  projects.forEach((project) => {
    const skills = project.skills;
    const categories = project.categories;
    let skillsHTML = "";
    let categoriesHTML = "";
    let counter = 2;
    const dateObj = new Date(project.date);
    const year = dateObj.getFullYear();
    const monthNumber = dateObj.getMonth();
    const day = dateObj.getDate();

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
    const month = monthNames[monthNumber];

    skills.forEach((skill) => {
      skillsHTML += `<i class="devicon-${skill}-plain"></i>`;
    });

    categories.forEach((category) => {
      categoriesHTML += `<small>${category}</small>`;
    });

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
      </footer>
`;
    const tempElement = document.createElement("div");
    tempElement.setAttribute("id", `card${counter}`);
    tempElement.setAttribute("class", "card");
    tempElement.setAttribute("data-size", "");
    tempElement.setAttribute("data-expanded", "false");
    tempElement.setAttribute("aria-expanded", "false");
    tempElement.innerHTML = cardHtml;

    container.appendChild(tempElement);
    counter++;
  });
});
