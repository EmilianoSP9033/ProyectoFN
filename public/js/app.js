document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevenir el envío normal del formulario
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    if (email === "admin@allcars.com" && password === "admin123") {
        window.location.href = "admin.html";
        return;
    }
    
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
  
        const result = await response.json();
  
        if (response.ok && result.success) {
            // Redirigir al usuario si el login es exitoso
            window.location.href = "index.html";
        } else {
            // Mostrar error si el login falla
            alert(result.message || "Error al iniciar sesión.");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("No se pudo conectar con el servidor.");
    }
  });