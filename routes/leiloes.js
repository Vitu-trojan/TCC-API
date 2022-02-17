const express = require('express');
const router = express.Router();

const leiloesController = require('../controllers/leiloes-controller');

router.get('/categoria/:pesquisa', leiloesController.getLeiloesCategoria);

router.get('/disponiveis', leiloesController.getLeiloesDisponiveis);

router.get('/participando/:usuario_pk', leiloesController.getLeiloesParticipando);

router.get('/leilao/participando/:leilao_id', leiloesController.getLeilaoParticipando);

router.get('/criados/:vendedor_id', leiloesController.getLeiloesCriados);

router.get('/destaque', leiloesController.getLeiloesDestaque);

router.get('/leilao/:leilao_id', leiloesController.getLeilao);

router.post('/leilao', leiloesController.postLeilao);

router.patch('/leilao/lance/entrar', leiloesController.patchLanceLeilao);

router.patch('/leilao/status/:vendedor_id', leiloesController.patchStatusLeilao);


module.exports = router;
