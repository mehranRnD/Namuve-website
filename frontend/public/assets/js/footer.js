export function createFooter() {
    const footerHTML = `
        <footer id="footer" class="footer position-relative light-background">
            <div class="container footer-top">
                <div class="row gy-4">
                    <div class="col-lg-3 col-md-12 footer-about">
                        <a href="index.html" class="logo d-flex align-items-center">
                            <img
                                src="assets/img/Namuve-logo-1.png"
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
                            <li><a href="#">Home</a></li>
                            <li><a href="about-us.html">About us</a></li>
                            <li><a href="rooms.html">Rooms</a></li>
                            <li><a href="#">Team</a></li>
                            <li><a href="contact-us.html">Contact</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-2 col-6 footer-links">
                        <h4>Services</h4>
                        <ul>
                            <li><a href="#">Spaces</a></li>
                            <li><a href="#">Serve</a></li>
                            <li><a href="#">Empire Holdings</a></li>
                            <li><a href="#">TechSol</a></li>
                            <li><a href="#">Uniform</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-2 col-6 footer-links">
                        <h4>Learn</h4>
                        <ul>
                            <li><a href="#">Blog / News</a></li>
                            <li><a href="#">FAQs</a></li>
                            <li><a href="#">Reviews and Testimonials</a></li>
                            <li><a href="#">Terms & Conditions</a></li>
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
                        <p><strong>Email:</strong> <span>info@namuve.com</span></p>
                    </div>
                </div>
            </div>

            <div class="container copyright text-center mt-4">
                <p>
                    © <span>Copyright</span> <strong class="sitename">Namuve</strong>
                    <span>All Rights Reserved</span>
                </p>
            </div>
        </footer>
    `;

    // Insert the footer HTML into the body
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}
