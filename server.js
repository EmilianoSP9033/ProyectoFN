/* const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const saltRounds = 10; // Define la constante saltRounds

// Crear la aplicación Express
const app = express();
const port = 3000;

// Conexión a MySQL
const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'proyectofullstack',
  port: 3306
});

conexion.connect(function(err) {
    if (err) {
        console.error("Error de conexión: ", err);
        return;
    }
    console.log("Conexión exitosa");
});

// Middleware para procesar JSON y datos URL-encoded
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '')));

const bcrypt = require('bcrypt');

app.post('/registrar-usuario', async (req, res) => {
    const { nombre_usuario, correo_electronico, contrasena } = req.body;

    if (!nombre_usuario || !correo_electronico || !contrasena) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    try {
        // Encriptar la contraseña antes de guardarla en la BD
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        const query = `INSERT INTO registro_usuarios (nombre_usuario, correo_electronico, contrasena) VALUES (?, ?, ?)`;

        conexion.query(query, [nombre_usuario, correo_electronico, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send("El correo ya está registrado.");
                }
                console.error("Error al insertar datos: ", err.message);
                return res.status(500).send("Error al registrar el usuario.");
            }
            res.send("Usuario registrado exitosamente.");
        });

    } catch (error) {
        console.error("Error al encriptar la contraseña:", error);
        res.status(500).send("Error al procesar la solicitud.");
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    const query = `SELECT * FROM registro_usuarios WHERE correo_electronico = ?`;

    conexion.query(query, [email], async (err, results) => {
        if (err) {
            console.error("Error al buscar usuario:", err);
            return res.status(500).send("Error en el servidor.");
        }

        if (results.length === 0) {
            return res.status(401).send("Correo o contraseña incorrectos.");
        }

        const user = results[0];

        // Comparar la contraseña ingresada con la encriptada
        const passwordMatch = await bcrypt.compare(password, user.contrasena);

        if (passwordMatch) {
            res.json({ success: true, message: "Inicio de sesión exitoso", admin: user.admin });
        } else {
            res.status(401).send("Correo o contraseña incorrectos.");
        }
    });
});



app.post('/guardar-cita', (req, res) => {
    const { nombre, apellido, email, telefono, vehiculo_interes, fecha_cita, visitado, recibir_promociones, acepto_privacidad } = req.body;

    const query = `INSERT INTO citas_vendedor (nombre, apellido, email, telefono, vehiculo_interes, fecha_cita, visitado, recibir_promociones, acepto_privacidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [nombre, apellido, email, telefono, vehiculo_interes, fecha_cita, visitado, recibir_promociones, acepto_privacidad ? 1 : 0];

    conexion.query(query, values, (err, result) => {
        if (err) {
            console.error("Error al insertar datos: ", err);
            return res.status(500).send("Hubo un error al guardar la cita.");
        }
        res.send("Cita guardada exitosamente.");
    });
});

app.post('/guardar-mantenimiento', (req, res) => {
    const { nombre, apellido, email, telefono, marca, modelo, anio, placa, fecha_mantenimiento, tipo_mantenimiento, comentarios, promociones, privacidad } = req.body;

    const query = `INSERT INTO mantenimientos_carro (nombre_cliente, apellido_cliente, correo_cliente, telefono_cliente, marca_carro, modelo_carro, año_carro, tipo_mantenimiento, descripcion_problema, fecha_preferida, recibir_promociones, acepto_politica) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [nombre, apellido, email, telefono, marca, modelo, anio, tipo_mantenimiento, comentarios, fecha_mantenimiento, promociones ? 1 : 0, privacidad ? 1 : 0];

    conexion.query(query, values, (err, result) => {
        if (err) {
            console.error("Error al insertar datos de mantenimiento: ", err);
            return res.status(500).send("Hubo un error al guardar el mantenimiento.");
        }
        res.send("Mantenimiento guardado exitosamente.");
    });
});

app.post('/guardar-auto', (req, res) => {
    const { marca, modelo, precio } = req.body;

    if (!marca || !modelo || !precio) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    const query = `INSERT INTO autos (marca, modelo, precio) VALUES (?, ?, ?)`;
    
    conexion.query(query, [marca, modelo, precio], (err) => {
        if (err) {
            console.error("Error al insertar datos: ", err);
            return res.status(500).send("Error al guardar el auto.");
        }
        res.send("Auto guardado exitosamente.");
    });
});

app.post('/guardar-auto', (req, res) => {
    const { marca, modelo, precio } = req.body;
  
    if (!marca || !modelo || !precio) {
      return res.status(400).send("Todos los campos son obligatorios.");
    }
  
    const query = `INSERT INTO autos (marca, modelo, precio) VALUES (?, ?, ?)`;
    
    conexion.query(query, [marca, modelo, precio], (err) => {
      if (err) {
        console.error("Error al insertar datos: ", err);
        return res.status(500).send("Error al guardar el auto.");
      }
      res.send("Auto guardado exitosamente.");
    });
  });

  app.put('/editar-auto', (req, res) => {
    const { id, marca, modelo, precio } = req.body;

    if (!id || !marca || !modelo || !precio) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    const query = `UPDATE autos SET marca = ?, modelo = ?, precio = ? WHERE id = ?`;

    conexion.query(query, [marca, modelo, precio, id], (err) => {
        if (err) {
            console.error("Error al actualizar datos: ", err);
            return res.status(500).send("Error al actualizar el auto.");
        }
        res.send("Auto actualizado exitosamente.");
    });
});

// Editar un auto
app.put('/autos/:id', (req, res) => {
    const { id } = req.params;
    const { marca, modelo, precio } = req.body;
    const query = 'UPDATE autos SET marca = ?, modelo = ?, precio = ? WHERE id = ?';
    db.query(query, [marca, modelo, precio, id], (err, result) => {
        if (err) throw err;
        res.json({ id, marca, modelo, precio });
    });
});

// Eliminar un auto
app.delete('/autos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM autos WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) throw err;
        res.json({ id });
    });
});


app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
*/