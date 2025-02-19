
document.addEventListener('DOMContentLoaded', () => {
    const carForm = document.getElementById('carForm');
    const carTable = document.getElementById('carTable').querySelector('tbody');
    let cars = JSON.parse(localStorage.getItem('cars')) || []; // Obtener autos almacenados o array vacío

    // Función para renderizar la tabla de autos
    const renderCars = () => {
        carTable.innerHTML = ''; // Limpiar tabla
        cars.forEach((car, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${car.marca}</td>
                <td>${car.modelo}</td>
                <td>$${car.precio}</td>
                <td>
                    <button class="edit" data-index="${index}">Editar</button>
                    <button class="delete" data-index="${index}">Eliminar</button>
                </td>
            `;
            carTable.appendChild(row);
        });
    };

    // Función para agregar un auto
    const addCar = (e) => {
        e.preventDefault();
        const marca = document.getElementById('marca').value;
        const modelo = document.getElementById('modelo').value;
        const precio = document.getElementById('precio').value;

        if (marca && modelo && precio) {
            const newCar = { marca, modelo, precio: parseFloat(precio) };
            cars.push(newCar); // Agregar el nuevo auto a la lista
            localStorage.setItem('cars', JSON.stringify(cars)); // Guardar los autos actualizados en localStorage
            renderCars(); // Renderizar la tabla actualizada
            carForm.reset(); // Limpiar formulario
        } else {
            alert("Por favor, completa todos los campos.");
        }
    };

    // Función para editar un auto
    const editCar = (index) => {
        const car = cars[index];
        const newMarca = prompt('Editar Marca:', car.marca);
        const newModelo = prompt('Editar Modelo:', car.modelo);
        const newPrecio = prompt('Editar Precio:', car.precio);

        if (newMarca && newModelo && newPrecio) {
            // Actualizar los datos del auto
            cars[index] = { marca: newMarca, modelo: newModelo, precio: parseFloat(newPrecio) };
            localStorage.setItem('cars', JSON.stringify(cars)); // Actualizar los autos en localStorage
            renderCars(); // Renderizar la tabla actualizada
        }
    };

    // Función para eliminar un auto
    const deleteCar = (index) => {
        if (confirm('¿Estás seguro de que deseas eliminar este auto?')) {
            cars.splice(index, 1); // Eliminar el auto de la lista
            localStorage.setItem('cars', JSON.stringify(cars)); // Actualizar los autos en localStorage
            renderCars(); // Renderizar la tabla actualizada
        }
    };

    // Eventos dinámicos para Editar y Eliminar
    carTable.addEventListener('click', (e) => {
        const target = e.target;
        const index = target.dataset.index;

        if (target.classList.contains('edit')) {
            editCar(index);
        } else if (target.classList.contains('delete')) {
            deleteCar(index);
        }
    });

    // Evento para agregar un auto
    carForm.addEventListener('submit', addCar);

    // Renderizar los autos al cargar la página
    renderCars();
});
