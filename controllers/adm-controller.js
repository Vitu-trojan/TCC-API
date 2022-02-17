const mysql = require('../mysql');

exports.getUsuarios = async (request, response) => {
    try {
        const { pk, tipo } = request.params;
        const query = 'SELECT * FROM tipo_usuarios WHERE usuario_pk = ? AND tipo = ?';
        const query1 = 'SELECT * FROM usuarios JOIN tipo_usuarios ON usuarios.cpf_cnpj = tipo_usuarios.usuario_pk';

        await mysql.execute(query, [ pk, tipo ])
        .then((result) => {
            if(result.length == 0) return response.status(401).send('Dados não encontrados.');

            mysql.execute(query1, [])
            .then((result) => {
                if(result.length == 0) return response.status(404).send('Nenhum usuário cadastrado ainda.');
    
                return response.status(200).send(result);
            })
            .catch((err) => {
                return response.status(500).send(err);
            });
        })
        .catch((err) => {
            return false;
        });

    } catch (error) {
        return response.status(500).send(err);
    }

};
exports.getLeiloes = async (request, response) => {
    try {
        const { pk, tipo } = request.params;
        const query = 'SELECT * FROM tipo_usuarios WHERE usuario_pk = ? AND tipo = ?';
        const query1 = 'SELECT * FROM leiloes';

        await mysql.execute(query, [ pk, tipo ])
        .then((result) => {
            if(result.length == 0) return response.status(401).send('Dados não encontrados.');

            mysql.execute(query1, [])
            .then((result) => {
                if(result.length == 0) return response.status(404).send('Nenhum leilão cadastrado ainda.');
    
                return response.status(200).send(result);
            })
            .catch((err) => {
                return response.status(500).send(err);
            });
        })
        .catch((err) => {
            return false;
        });

    } catch (error) {
        return response.status(500).send(err);
    }

};
exports.getVeiculos = async (request, response) => {
    try {
        const { pk, tipo } = request.params;
        const query = 'SELECT * FROM tipo_usuarios WHERE usuario_pk = ? AND tipo = ?';
        const query1 = 'SELECT * FROM veiculos JOIN veiculos_imagens ON veiculos_imagens.veiculo_pk = veiculos.renavam';

        await mysql.execute(query, [ pk, tipo ])
        .then((result) => {
            if(result.length == 0) return response.status(401).send('Dados não encontrados.');

            mysql.execute(query1, [])
            .then((result) => {
                if(result.length == 0) return response.status(404).send('Nenhum veículo cadastrado ainda.');
    
                return response.status(200).send(result);
            })
            .catch((err) => {
                return response.status(500).send(err);
            });
        })
        .catch((err) => {
            return false;
        });

    } catch (error) {
        return response.status(500).send(err);
    }

};
