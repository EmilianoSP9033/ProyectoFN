document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo_electronico = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("password").value.trim();

    console.log("📤 Enviando datos:", { correo_electronico, contrasena });

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo_electronico, contrasena })
        });

        const result = await response.json();
        console.log("📩 Respuesta del servidor:", result);

        if (result.success) {
            alert("Inicio de sesión exitoso");
            localStorage.setItem("authToken", result.token);
            window.location.href = "/index.html";
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("❌ Error en el inicio de sesión:", error);
        alert("No se pudo conectar con el servidor.");
    }
});
