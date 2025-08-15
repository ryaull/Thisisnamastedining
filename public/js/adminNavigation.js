export function setupAdminNavigation() {
  const navLinks = document.querySelectorAll(".admin-nav-link");
  const sections = document.querySelectorAll(".admin-page-section");

  function showSection(sectionId) {
    sections.forEach(section => {
      section.hidden = section.id !== sectionId;
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = e.target.id.replace("nav-", "") + "-section";
      showSection(sectionId);

      navLinks.forEach(navLink => navLink.classList.remove("active"));
      e.target.classList.add("active");
    });
  });
}
