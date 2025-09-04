// script-login.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page reload

    // Collect input values
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;

    if (!email || !password) {
      alert("Please fill all fields!");
      return;
    }

    try {
      // Send POST request to staff login endpoint
      const response = await fetch("http://localhost:3000/staff/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        alert(`Welcome, ${data.name}! Role: ${data.role}`);
        // Redirect to staff dashboard or another page
        window.location.href = "/staff-dashboard.html";
      } else {
        // Login failed
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  });
});
