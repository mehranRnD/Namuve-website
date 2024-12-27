export function createNavbar() {
    const headerHTML = `
        <header id="header" class="header d-flex align-items-center fixed-top">
            <div class="container-fluid position-relative d-flex align-items-center justify-content-between">
                <a href="/" class="logo d-flex align-items-center me-auto me-xl-0">
                    <div class="img-cover-logo">
                        <img src="assets/img/Namuve-logo-1.png" alt="Namuve Logo" />
                    </div>
                </a>

                <nav id="navmenu" class="navmenu">
                    <ul>
                        <li><a href="/" class="active">Home</a></li>
                        <li><a href="./about">About us</a></li>
                        <li class="dropdown">
                            <a href="#"><span>Services</span><i class="bi bi-chevron-down toggle-dropdown"></i></a>
                            <ul>
                                <li><a href="/spaces">Spaces</a></li>
                                <li><a href="/serve">Serve</a></li>
                                <li><a href="/empire-holdings">Empire Holdings</a></li>
                                <li><a href="/techsol">TechSol</a></li>
                                <li><a href="/uniform">Uniform</a></li>
                            </ul>
                        </li>
                        <li><a href="/listings">Rooms</a></li>
                        <li class="dropdown">
                            <a href="#"><span>InsightsHub</span><i class="bi bi-chevron-down toggle-dropdown"></i></a>
                            <ul>
                                <li><a href="/blogs">Blogs / News</a></li>
                                <li><a href="/faqs">FAQs</a></li>
                                <li><a href="/reviews-and-testimonials">Reviews and Testimonials</a></li>
                                <li><a href="/terms-and-conditions">Terms and Conditions / Privacy Policy</a></li>
                            </ul>
                        </li>
                        <li><a href="/estimate-revenue">Estimate Revenue</a></li>
                        <li><a href="/team">Teams</a></li>
                        <li><a href="/contact">Contact</a></li>

                        <!-- Currency Selector -->
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

    // Create a function to insert the navbar
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Set active nav item based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#navmenu a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
