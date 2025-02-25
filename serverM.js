const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


dotenv.config();
const app = express();

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: '*'
}));

app.use(express.json({ limit: '10mb' }));  
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Conexión a MongoDB
const connectDB = async () => {
    try {
        // Verificar si ya hay una conexión activa
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI, {

            });
            console.log('Conexión a MongoDB exitosa');
        }
    } catch (err) {
        console.error('Error al conectar a MongoDB:', err);
        throw err;
    }
};

// Asegurarse de que la conexión se establezca
connectDB();

// Definición de modelos
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


const MantenimientoCarroSchema = new mongoose.Schema({
    nombre_cliente: String,
    apellido_cliente: String,
    correo_cliente: String,
    telefono_cliente: String,
    marca_carro: String,
    modelo_carro: String,
    año_carro: Number,
    tipo_mantenimiento: String,
    descripcion_problema: String,
    fecha_preferida: Date,
    recibir_promociones: Boolean,
    acepto_politica: Boolean
});

const MantenimientoCarro = mongoose.model('MantenimientoCarro', MantenimientoCarroSchema);

// Rutas
app.post('/registrar-usuario', async (req, res) => {
    console.log("Datos recibidos:", req.body);  // 👈 Esto mostrará en la consola los datos que llegan
    const { nombre_usuario, correo_electronico, contrasena } = req.body;

    if (!nombre_usuario || !correo_electronico || !contrasena) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const nuevoUsuario = new Usuario({ nombre_usuario, correo_electronico, contrasena: hashedPassword });
        await nuevoUsuario.save();
        console.log("✅ Usuario guardado en MongoDB Atlas");
        res.json({ mensaje: "Usuario registrado exitosamente." });
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        res.status(500).json({ error: "Error al registrar el usuario." });
    }
});


// Inicio de sesión
app.post('/login', async (req, res) => {
    console.log("📥 Datos recibidos en login:", req.body); 

    const { correo_electronico, contrasena } = req.body;
    if (!correo_electronico || !contrasena) {
        console.log("❌ Faltan campos en la solicitud. Recibido:", req.body);
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {
        const usuario = await Usuario.findOne({ correo_electronico });
        if (!usuario) {
            console.log("❌ Usuario no encontrado:", correo_electronico);
            return res.status(401).json({ message: "Correo o contraseña incorrectos." });
        }

        const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!passwordMatch) {
            console.log("❌ Contraseña incorrecta para:", correo_electronico);
            return res.status(401).json({ message: "Correo o contraseña incorrectos." });
        }

        const token = jwt.sign({ userId: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("✅ Inicio de sesión exitoso:", correo_electronico, "Token generado:", token);

        res.json({ success: true, message: "Inicio de sesión exitoso", token });
    } catch (error) {
        console.error("🔥 Error en el login:", error);
        res.status(500).json({ message: "Error en el servidor." });
    }
});

// Guardar una cita
app.post('/guardar-cita', async (req, res) => {
    try {
        const { visitado, recibir_promociones, acepto_privacidad, ...restoDatos } = req.body;

        const nuevaCita = new Cita({
            ...restoDatos,
            visitado: visitado === 'si' ? true : false,
            recibir_promociones: recibir_promociones === 'si' ? true : false,
            acepto_privacidad: acepto_privacidad === 'si' ? true : false
        });

        await nuevaCita.save();
        res.send("Cita guardada exitosamente.");
    } catch (error) {
        console.error("Error al guardar la cita:", error);
        res.status(500).send("Hubo un error al guardar la cita.");
    }
});

app.post('/guardar-mantenimiento', async (req, res) => {
    try {
        const nuevoMantenimiento = new MantenimientoCarro(req.body);
        await nuevoMantenimiento.save();
        res.send("Mantenimiento guardado exitosamente.");
    } catch (error) {
        console.error("Error al guardar el mantenimiento:", error);
        res.status(500).send("Error al guardar el mantenimiento.");
    }
});


// Guardar un auto
app.post('/guardar-auto', async (req, res) => {
    try {
        console.log("Datos recibidos en /guardar-auto:", req.body); // 👈 Verifica qué datos llegan
        const nuevoAuto = new Auto(req.body);
        await nuevoAuto.save();
        res.send("Auto guardado exitosamente.");
    } catch (error) {
        console.error("Error al guardar el auto:", error);
        res.status(500).send("Error al guardar el auto.");
    }
});


// Obtener todos los autos
app.get('/obtener-autos', async (req, res) => {
    try {
        const autos = await Auto.find();
        res.json(autos);
    } catch (error) {
        console.error("Error al obtener autos:", error);
        res.status(500).send("Error al obtener los autos.");
    }
});

// Eliminar un auto por ID
app.delete('/eliminar-auto/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Auto.findByIdAndDelete(id);
        res.send("Auto eliminado exitosamente.");
    } catch (error) {
        console.error("Error al eliminar el auto:", error);
        res.status(500).send("Error al eliminar el auto.");
    }
});

// Editar un auto
app.put('/editar-auto', async (req, res) => {
    try {
        const { id, marca, modelo, precio } = req.body;
        const autoActualizado = await Auto.findByIdAndUpdate(id, { marca, modelo, precio }, { new: true });

        if (!autoActualizado) {
            return res.status(404).send("Auto no encontrado.");
        }

        res.send("Auto actualizado correctamente.");
    } catch (error) {
        console.error("Error al editar el auto:", error);
        res.status(500).send("Error al actualizar el auto.");
    }
});



// Ruta para la salud de la API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Ruta para la raíz
app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});


// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});


module.exports = app;
