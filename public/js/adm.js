const API_URL = "https://crispy-engine-5grj7jpvvrjp349q6-3000.app.github.dev";

document.addEventListener("DOMContentLoaded", () => {
    const carForm = document.getElementById("carForm");
    const carTable = document.getElementById("carTable").querySelector("tbody");
    let editingCarId = null; // Guardar el ID del auto en edición

    // Obtener autos desde el backend
    async function fetchAutos() {
        try {
            const response = await fetch(`${API_URL}/obtener-autos`);
            const autos = await response.json();

            carTable.innerHTML = "";
            autos.forEach(auto => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${auto.marca}</td>
                    <td>${auto.modelo}</td>
                    <td>$${auto.precio}</td>
                    <td>
                        <button onclick="editAuto('${auto._id}', '${auto.marca}', '${auto.modelo}', ${auto.precio})">Editar</button>
                        <button onclick="deleteAuto('${auto._id}')">Eliminar</button>
                    </td>
                `;
                carTable.appendChild(row);
            });
        } catch (error) {
            console.error("❌ Error al obtener los autos:", error);
        }
    }

    // Agregar o actualizar un auto
    carForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const marca = document.getElementById("marca").value;
        const modelo = document.getElementById("modelo").value;
        const precio = parseFloat(document.getElementById("precio").value);
        const car = { marca, modelo, precio };

        try {
            let response;
            if (editingCarId) {
                response = await fetch(`${API_URL}/editar-auto/${editingCarId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(car)
                });
                editingCarId = null;
            } else {
                response = await fetch(`${API_URL}/guardar-auto`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(car)
                });
            }

            if (response.ok) {
                alert(editingCarId ? "Auto actualizado correctamente." : "Auto agregado correctamente.");
                carForm.reset();
                fetchAutos();
            } else {
                alert("❌ Error al procesar la solicitud.");
            }
        } catch (error) {
            console.error("❌ Error al procesar el auto:", error);
        }
    });

    // Editar auto
    window.editAuto = (id, marca, modelo, precio) => {
        document.getElementById("marca").value = marca;
        document.getElementById("modelo").value = modelo;
        document.getElementById("precio").value = precio;
        editingCarId = id;
    };

    // Eliminar auto
    window.deleteAuto = async (id) => {
        if (confirm("¿Estás seguro de eliminar este auto?")) {
            try {
                const response = await fetch(`${API_URL}/eliminar-auto/${id}`, { method: "DELETE" });

                if (response.ok) {
                    alert("Auto eliminado correctamente.");
                    fetchAutos();
                } else {
                    alert("❌ Error al eliminar el auto.");
                }
            } catch (error) {
                console.error("❌ Error al eliminar el auto:", error);
            }
        }
    };

    // Cargar autos al iniciar la página
    fetchAutos();
});
