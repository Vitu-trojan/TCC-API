const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerConfig = require('../config/multer');

const veiculosController = require('../controllers/veiculos-controller');
const imagensController = require('../controllers/veiculos-imagens-controller');

router.get('/veiculos', veiculosController.getVeiculos);

router.get('/veiculo/:veiculo_id', veiculosController.getVeiculo);

router.get('/produtos/:vendedor_id', veiculosController.getProdutos);

router.get('/veiculo/imagens/:renavam', imagensController.getImagens);

router.post('/veiculo', veiculosController.postVeiculo);

router.post('/veiculo/imagem/:renavam', multer(multerConfig).single('imagem'), imagensController.postImagem);

router.patch('/veiculo/status/:vendedor_id', veiculosController.patchStatusVeiculo);

router.patch('/veiculo/imagem/:renavam/:id_vendedor', multer(multerConfig).single('imagem'), imagensController.patchImagem);

router.patch('/veiculo/imagem2/:renavam/:id_vendedor', multer(multerConfig).single('imagem2'), imagensController.patchImagem2);

router.patch('/veiculo/imagem3/:renavam/:id_vendedor', multer(multerConfig).single('imagem3'), imagensController.patchImagem3);

router.patch('/veiculo/imagem4/:renavam/:id_vendedor', multer(multerConfig).single('imagem4'), imagensController.patchImagem4);

router.patch('/veiculo/imagem5/:renavam/:id_vendedor', multer(multerConfig).single('imagem5'), imagensController.patchImagem5);

module.exports = router;