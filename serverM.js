const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const bodyParser = require('body-parser');
const saltRounds = 10;

dotenv.config();

// Crear la aplicación Express
const app = express();
const port = 3000;

// Middleware para procesar JSON y datos URL-encoded
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a MongoDB Atlas
const connectDB = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            return;
        }
        await mongoose.connect(process.env.MONGO_URI, { ssl: true });
        console.log('Conexión a MongoDB exitosa');
    } catch (err) {
        console.error('Error al conectar a MongoDB:', err);
        throw err;
    }
};

// Asegurarnos de que la conexión se establezca
connectDB();

// Definición de modelos de MongoDB
const UsuarioSchema = new mongoose.Schema({
    nombre_usuario: String,
    correo_electronico: { type: String, unique: true },
    contrasena: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

const CitaSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    email: String,
    telefono: String,
    vehiculo_interes: String,
    fecha_cita: Date,
    visitado: Boolean,
    recibir_promociones: Boolean,
    acepto_privacidad: Boolean
});
const Cita = mongoose.model('Cita', CitaSchema);

const AutoSchema = new mongoose.Schema({
    marca: String,
    modelo: String,
    precio: Number
});
const Auto = mongoose.model('Auto', AutoSchema);

// Rutas
app.post('/registrar-usuario', async (req, res) => {
    const { nombre_usuario, correo_electronico, contrasena } = req.body;

    if (!nombre_usuario || !correo_electronico || !contrasena) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
        const nuevoUsuario = new Usuario({ nombre_usuario, correo_electronico, contrasena: hashedPassword });
        await nuevoUsuario.save();
        res.send("Usuario registrado exitosamente.");
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).send("Error al registrar el usuario.");
    }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    try {
        const usuario = await Usuario.findOne({ correo_electronico: email });
        if (!usuario) return res.status(401).send("Correo o contraseña incorrectos.");

        const passwordMatch = await bcrypt.compare(password, usuario.contrasena);
        if (passwordMatch) {
            res.json({ success: true, message: "Inicio de sesión exitoso" });
        } else {
            res.status(401).send("Correo o contraseña incorrectos.");
        }
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        res.status(500).send("Error en el servidor.");
    }
});

// Guardar una cita
app.post('/guardar-cita', async (req, res) => {
    try {
        const nuevaCita = new Cita(req.body);
        await nuevaCita.save();
        res.send("Cita guardada exitosamente.");
    } catch (error) {
        console.error("Error al guardar la cita:", error);
        res.status(500).send("Hubo un error al guardar la cita.");
    }
});

// Guardar un auto
app.post('/guardar-auto', async (req, res) => {
    try {
        const nuevoAuto = new Auto(req.body);
        await nuevoAuto.save();
        res.send("Auto guardado exitosamente.");
    } catch (error) {
        console.error("Error al guardar el auto:", error);
        res.status(500).send("Error al guardar el auto.");
    }
});

// Editar un auto
app.put('/autos/:id', async (req, res) => {
    try {
        await Auto.findByIdAndUpdate(req.params.id, req.body);
        res.send("Auto actualizado exitosamente.");
    } catch (error) {
        console.error("Error al actualizar el auto:", error);
        res.status(500).send("Error al actualizar el auto.");
    }
});

// Eliminar un auto
app.delete('/autos/:id', async (req, res) => {
    try {
        await Auto.findByIdAndDelete(req.params.id);
        res.send("Auto eliminado exitosamente.");
    } catch (error) {
        console.error("Error al eliminar el auto:", error);
        res.status(500).send("Error al eliminar el auto.");
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
