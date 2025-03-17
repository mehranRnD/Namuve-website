export function createNavbar() {
  const headerHTML = `
             <header
              id="header"
              class="header d-flex align-items-center fixed-top"
            >
              <div
                class="container-fluid position-relative d-flex align-items-center justify-content-between"
              >
                <div class="logo">
                  <a href="/" class="img-cover-logo">
                    <img src="assets/img/Namuve-logo-1.png" alt="Namuve Logo" />
                  </a>
                </div>
                <nav id="navmenu" class="navmenu">
                  <ul>
                    <li><a href="/" class="active">Home</a></li>
                    <li><a href="/about">About us</a></li>
                    <li><a href="/services">Services</a></li>
                    <li><a href="/listings">Rooms</a></li>
                    <li class="nav-item dropdown">
                      <a
                        class="nav-link dropdown-toggle"
                        id="insightshubDropdown"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        InsightsHub
                      </a>
                      <div
                        class="dropdown-menu"
                        aria-labelledby="insightshubDropdown"
                      >
                        <a class="dropdown-item" href="/blogs">Blogs / News</a>
                        <a class="dropdown-item" href="/faqs">FAQs</a>
                        <a
                          class="dropdown-item"
                          href="/reviews-and-testimonials"
                          >Reviews and Testimonials</a
                        >
                        <a class="dropdown-item" href="/terms-and-conditions"
                          >Terms and Conditions / Privacy Policy</a
                        >
                      </div>
                    </li>
                    <li><a href="/estimate-revenue">Estimate Revenue</a></li>
                    
                    <li><a href="/contact">Contact</a></li>
                    <li>
                      <select id="currencySelector" class="form-select">
                        <option value="USD">USD</option>
                        <option value="PKR">PKR</option>
                      </select>
                    </li>
                  </ul>
                  <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
                </nav>
              </div>
            </header>
      `;
  // Insert navbar into the DOM first
  document.body.insertAdjacentHTML("afterbegin", headerHTML);
  // Now select elements after they exist
  const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
  const navMenu = document.querySelector("#navmenu");
  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener("click", function (e) {
      e.preventDefault();
      document.body.classList.toggle("mobile-nav-active");
      this.classList.toggle("bi-list");
      this.classList.toggle("bi-x");
      // Accessibility improvements
      const isExpanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", !isExpanded);
      navMenu.setAttribute("aria-hidden", isExpanded);
    });
    // Initialize ARIA attributes
    mobileNavToggle.setAttribute("aria-label", "Toggle navigation menu");
    mobileNavToggle.setAttribute("aria-expanded", "false");
    mobileNavToggle.setAttribute("aria-controls", "navmenu");
    navMenu.setAttribute("aria-hidden", "true");
  }
  // Set active nav item based on the current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("#navmenu a");
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
      const dropdown = link.closest(".dropdown");
      if (dropdown) {
        const dropdownLink = dropdown.querySelector("a");
        dropdownLink.classList.add("active");
      }
    } else {
      link.classList.remove("active");
    }
  });
}