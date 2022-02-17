const express = require('express');
const app = express();

const routerUser = require('./routes/usuarios');
const routerVeiculos = require('./routes/veiculos');
const routerLeiloes = require('./routes/leiloes');
const routerAdm = require('./routes/adm');
//const port = process.env.PORT || 3000;

//app.listen(port);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/usuarios', routerUser);
app.use('/veiculos', routerVeiculos);
app.use('/leiloes', routerLeiloes);
app.use('/quemdamais', routerAdm);

app.use((request, response, next) => {
    const err = new Error('Caminho não encontrado!');
    err.status = 404;
    next(err);
});

app.use((error, request, response, next) => {
    response.status(error.status || 500);
    return response.send(error.message);
});

module.exports = app;