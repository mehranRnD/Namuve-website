document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value
  };

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (response.ok) {
      alert("Message sent successfully!");
      document.getElementById("contactForm").reset();
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to send message. Please try again later.");
  }
});