const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerConfig = require('../config/multer');

const usuariosController = require('../controllers/usuarios-controller');

router.get('/usuarios', usuariosController.getUsuarios);

router.get('/usuario/:usuario_id/:usuario_id2/:usuario_id3', usuariosController.getInfoUsuarios);

router.get('/usuario/:usuario_id', usuariosController.getInfoUsuario);

router.get('/usuario/:email/:senha', usuariosController.getUsuario);

router.get('/usuariov2/:email/:cod_validacao', usuariosController.getUsuarioValidation);

router.get('/leilao/:leilao_id', usuariosController.getCompradoresLeilao);

router.post('/usuario', usuariosController.postUsuario);

router.post('/usuario/avatar/:pk', multer(multerConfig).single('avatar_usuario'), usuariosController.postAvatarUsuario);

router.post('/usuario/email', usuariosController.postEmail);

router.patch('/usuario', usuariosController.patchUsuario);

router.patch('/usuario/avatar/:cpf_cnpj', multer(multerConfig).single('avatar_usuario'), usuariosController.patchAvatarUsuario);

router.patch('/usuario/codeValidation', usuariosController.patchCodVal);

router.patch('/leiloes', usuariosController.patchLeiloes);

router.patch('/usuario/validation/:email/:cod_val', usuariosController.patchValidacao);

router.patch('/usuario/leilao', usuariosController.patchSairLeilao);

module.exports = router;