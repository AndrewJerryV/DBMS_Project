document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const errorMessageDiv = document.getElementById("error-message");

  // If already logged in, redirect to dashboard
  if (localStorage.getItem('authToken')) {
      window.location.href = "index.html";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    errorMessageDiv.textContent = ''; // Clear previous errors

    if (!email || !password) {
      errorMessageDiv.textContent = "Please fill in all fields!";
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("Response Data:", data); 
      if (response.ok) {
        // FIXED: Store token and user data in local storage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('staffDetails', JSON.stringify(data.staff));
        
        // FIXED: Redirect to the main dashboard (index.html)
        window.location.href = "index.html"; 
      } else {
        errorMessageDiv.textContent = data.error || "Login failed. Please try again.";
      }
    } catch (err) {
      console.error(err);
      errorMessageDiv.textContent = "Server error. Please try again later.";
    }
  });
});
