const mysql = require('../mysql');

/* ------- GET de veiculos cadastrados no banco de dados. -------
*
* - Ao visualizar as informações de um leilão será requisitado os dados do veiculo deste leilao. (SERÁ FEITA NA ROTA LEILAO)
* - O vendedor poderá ver o carros que cadastrou, até os que ja foram negociados.
*/


exports.getVeiculos = async (request, response) => {
    try {
        const query = 'SELECT * FROM veiculos JOIN veiculos_imagens ON veiculos_imagens.veiculo_pk = veiculos.renavam';

        await mysql.execute(query, [])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Nenhum veículo cadastrado ainda.');
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(JSON.stringift(error));
    }
};

exports.getVeiculo = async (request, response) => {
    try {
        const { veiculo_id } = request.params;
        const query = 'SELECT * FROM veiculos JOIN veiculos_imagens ON veiculos_imagens.veiculo_pk = veiculos.renavam WHERE veiculo_id = ?';

        await mysql.execute(query, [veiculo_id])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Veículo não encontrado.');
            return response.status(200).send(result[0]);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(JSON.stringify(error));
    }
};

exports.getProdutos =  async (request, response) => {
    try {
        const { vendedor_id } = request.params;
        const query = 'SELECT * FROM veiculos JOIN veiculos_imagens ON veiculos_imagens.veiculo_pk = veiculos.renavam WHERE vendedor_id = ?';

        await mysql.execute(query, [ vendedor_id ])
        .then((result) => {

            if(result.length == 0) return response.status(404).send('Você ainda não tem veículos cadastrados.');
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(JSON.stringify(error));
    }
};


/*---------- POST de veículos no banco de dados. ------
*
*
*
*
*/

exports.postVeiculo = async (request, response) => {
    try {
        const { renavam, fabricante, modelo, ano, cambio, cor, carroceria, combustivel, condicao, informacoes_adicionais, vendedor_id } = request.body;
        const status = 'disponível';
        const query = 'SELECT * FROM veiculos WHERE renavam = ?';

        await mysql.execute(query, [ renavam ])
        .then((result) => {

            if(result.length != 0) return response.status(406).send('O renavam informado ja está cadastrado.');

            const query1 = 'INSERT INTO veiculos (renavam, fabricante, modelo, ano, cambio, cor, carroceria, combustivel, condicao, informacoes_adicionais, vendedor_id, status_veiculo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

            mysql.execute(query1, [ renavam, fabricante, modelo, ano, cambio, cor, carroceria, combustivel, condicao, informacoes_adicionais, vendedor_id, status ])
            .then(() => {
                return response.status(201).send(`O veículo com o renavam: ${renavam} foi cadastrado com sucesso.`);
            })
            .catch((err) => {
                return response.status(500).send(err);
            });
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(JSON.stringify(error));
    }
};


/* ----------------PATCH de veiculos no banco de dados. ---------
*
*
*
*/

exports.patchStatusVeiculo = async (request, response) => {
    try {
        const { vendedor_id } = request.params;
        const { veiculo_id, status } = request.body;
        const query = 'UPDATE veiculos SET status_veiculo = ? WHERE veiculo_id = ? AND vendedor_id =?';

        await mysql.execute(query, [ status, veiculo_id, vendedor_id ])
        .then((result) => {
            if(result.changedRows == 0) return response.status(404).send('Veículo não encontrado.');
            return response.status(200).send('Sucesso.');
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
}