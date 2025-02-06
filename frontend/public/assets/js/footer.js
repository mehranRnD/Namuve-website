export function createFooter() {
  const footerHTML = `
        <footer id="footer" class="footer position-relative light-background">
            <div class="container footer-top">
                <div class="row gy-4">
                    <div class="col-lg-3 col-md-12 footer-about">
                        <a href="/" class="logo d-flex align-items-center">
                            <img
                                src="assets/img/Bnr-logo-2.png"
                                alt="Logo"
                                class="me-3"
                                style="height: 80px; width: auto"
                            />
                        </a>
                        <p>
                            Namuve is your trusted partner for short-term rentals, offering
                            comfortable, stylish, and well-equipped properties. We redefine
                            convenience and hospitality, ensuring unforgettable stays for
                            every guest.
                        </p>
                        <div class="social-links d-flex mt-4">
                            <a href="https://www.youtube.com/@booknrent"><i class="bi bi-youtube"></i></a>
                            <a href="https://www.facebook.com/booknrentofficial/"><i class="bi bi-facebook"></i></a>
                            <a href="https://www.instagram.com/booknrentofficial/"><i class="bi bi-instagram"></i></a>
                            <a href="https://www.linkedin.com/company/book-n-rent/"><i class="bi bi-linkedin"></i></a>
                        </div>
                    </div>

                    <div class="col-lg-2 col-6 footer-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/about">About us</a></li>
                            <li><a href="/listings">Rooms</a></li>
                            <li><a href="/team">Team</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-2 col-6 footer-links">
                        <h4>Services</h4>
                        <ul>
                            <li><a href="/spaces">Spaces</a></li>
                            <li><a href="/serve">Serve</a></li>
                            <li><a href="/empire-holdings">Empire Holdings</a></li>
                            <li><a href="/techsol">TechSol</a></li>
                            <li><a href="/uniform">Uniform</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-2 col-6 footer-links">
                        <h4>Learn</h4>
                        <ul>
                            <li><a href="/blogs">Blog / News</a></li>
                            <li><a href="/faqs">FAQs</a></li>
                            <li><a href="/reviews-and-testimonials">Reviews and Testimonials</a></li>
                            <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-3 col-md-12 footer-contact text-md-start">
                        <h4>Contact Us</h4>
                        <p>30-A, 30</p>
                        <p>Block L, Gulberg III Lahore</p>
                        <p>Punjab 54000</p>
                        <p class="mt-4">
                            <strong>Phone:</strong> <span>+92 300 045 4711</span>
                        </p>
                        <p><strong>Email:</strong> <a href="mailto:info@namuve.com"><span>info@namuve.com</span></a></p>
                    </div>
                </div>
            </div>

            <div class="container copyright text-center mt-4">
                <p>
                    © <span>Copyright</span> <strong class="sitename">BooknRent</strong>
                    <span>All Rights Reserved</span>
                </p>
            </div>
        </footer>
    `;

  // Insert the footer HTML into the body
  document.body.insertAdjacentHTML("beforeend", footerHTML);
}
