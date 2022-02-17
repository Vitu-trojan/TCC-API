const express = require('express');
const router = express.Router();

const admController = require('../controllers/adm-controller');

router.get('/usuarios/all/:pk/:tipo', admController.getUsuarios);

router.get('/leiloes/all/:pk/:tipo', admController.getLeiloes);

router.get('/veiculos/all/:pk/:tipo', admController.getVeiculos);

module.exports = router;