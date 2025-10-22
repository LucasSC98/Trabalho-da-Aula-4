const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const userModel = require("./models/userModel");

const app = express();
const PORT = 3000;

// Habilitar CORS
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(
        new Error("Tipo de arquivo inválido. Apenas PNG e JPEG são permitidos.")
      );
    }
  },
});

app.use(express.static("public"));

//cadastro de usuário
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email e password são obrigatórios.",
      });
    }
    if (userModel.findByUsername(username)) {
      return res.status(400).json({
        message: "Username já cadastrado.",
      });
    }
    if (userModel.findByEmail(email)) {
      return res.status(400).json({
        message: "Email já cadastrado.",
      });
    }
    const novoUsuario = await userModel.addUser({
      username,
      email,
      password,
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario: {
        id: novoUsuario.id,
        username: novoUsuario.username,
        email: novoUsuario.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.post("/upload", upload.array("meusArquivos", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    res.status(200).json({
      message: `Upload realizado com sucesso! ${req.files.length} arquivo(s) recebido(s).`,
      files: req.files.map((file) => ({
        filename: file.filename,
        size: file.size,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.post("/hash", express.json(), async (req, res) => {
  const senhaPura = req.body.senha;
  const saltRounds = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(senhaPura, saltRounds);
  res.status(200).json({ hash: hash });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
