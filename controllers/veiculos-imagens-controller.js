const mysql = require('../mysql');
const aws = require('aws-sdk');
const s3 = new aws.S3();

/* ---- GET route das imagens do veículo -----
*
*
*
*/

exports.getImagens = async (request, response) => {
    try {
        const { renavam } =  request.params;
        const query = 'SELECT path_imagem, path_imagem2, path_imagem3, path_imagem4, path_imagem5 FROM veiculos_imagens WHERE veiculo_pk = ?';

        await mysql.execute(query, [ renavam ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Nenhum dado encontrado.');
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(JSON.stringify(error));
    }
};


/* ------ POST route das imagens do veículo -----
*
*
*
*/
exports.postImagem = async (request, response) => {
    try {
        const { renavam } = request.params;
        const { key: imagem, location: path_imagem } = request.file;
        const query = 'INSERT INTO veiculos_imagens (veiculo_pk, imagem, path_imagem) VALUES (?,?,?)';

        await mysql.execute(query, [ renavam, imagem, path_imagem ])
        .then(() => {
            return response.status(201).send('Imagem inserida com sucesso!');
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};


/* ------ PATCH das routes dos veículos -----
*
*
*
*/

exports.patchImagem = async (request, response) => {
    try {
        const { renavam, id_vendedor } = request.params;
        const { key: imagem, location: path_imagem } = request.file;
        const query = 'SELECT imagem FROM veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk WHERE veiculo_pk = ? AND vendedor_id = ?';

        await mysql.execute(query, [ renavam, id_vendedor ])
        .then((result) => {

            if(result.length == 0) return response.status(404).send('Dados não encontrados.');
        
            var img = result[0]['imagem'];
            deleteImage(img);
            
            img = imagem;
            const query = 'UPDATE veiculos_imagens SET imagem = ?, path_imagem = ? WHERE veiculo_pk = ?';

            mysql.execute(query, [ img, path_imagem, renavam ])
            .then(() => {
                return response.status(202).send('Imagem alterada com sucesso.');
            })
            .catch((err) => {
                return response.status(500).send(err);
            });
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.patchImagem2 = async (request, response) => {
    try {
        const { renavam, id_vendedor } = request.params;
        const { key: imagem2, location: path_imagem2 } = request.file;
        const query = 'SELECT imagem2 FROM veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk WHERE veiculo_pk = ? AND vendedor_id = ?';
    
        await mysql.execute(query, [ renavam, id_vendedor ])
        .then((result) => {

            if(result.length == 0) return response.status(404).send('Dados não encontrados.');

            var img = result[0]['imagem2'];
            deleteImage(img);

            img = imagem2;
            const query1 = 'UPDATE veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk SET imagem2 = ?, path_imagem2 = ? WHERE veiculo_pk = ? AND vendedor_id = ?';

            mysql.execute(query1, [ img, path_imagem2, renavam, id_vendedor ])
            .then(() => {
                return response.status(202).send('Imagem alterada com sucesso.');
            })
            .catch((err) => {
                return response.status(500).send(err);
            });
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.patchImagem3 = async (request, response) => {
    try {
        const { renavam, id_vendedor } = request.params;
        const { key: imagem3, location: path_imagem3 } = request.file;
        const query = 'SELECT imagem3 FROM veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk WHERE veiculo_pk = ? AND vendedor_id = ?';
    
        await mysql.execute(query, [ renavam, id_vendedor ])
        .then((result) => {
            
            if(result.length == 0) return response.status(404).send('Dados não encontrados.');

            var img = result[0]['imagem3'];
            deleteImage(img);

            img = imagem3;
            const query1 = 'UPDATE veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk SET imagem3 = ?, path_imagem3 = ? WHERE veiculo_pk = ? AND vendedor_id = ?';

            mysql.execute(query1, [ img, path_imagem3, renavam, id_vendedor ])
            .then(() => {
                return response.status(202).send('Imagem alterada com sucesso.');
            })
            .catch((err) => {
                return response.status(500).send(err);
            });
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.patchImagem4 = async (request, response) => {
    try {
        const { renavam, id_vendedor } = request.params;
        const { key: imagem4, location: path_imagem4 } = request.file;
        const query = 'SELECT imagem4 FROM veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk WHERE veiculo_pk = ? AND vendedor_id = ?';

        await mysql.execute(query, [ renavam, id_vendedor ])
        .then((result) => {

            if(result.length == 0) return response.status(404).send('Dados não encontrados.');

            var img = result[0]['imagem4'];
            deleteImage(img);

            img = imagem4;
            const query1 = 'UPDATE veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk SET imagem4 = ?, path_imagem4 = ? WHERE veiculo_pk = ? AND vendedor_id = ?';
    
            mysql.execute(query1, [ img, path_imagem4, renavam, id_vendedor ])
            .then(() => {
                return response.status(202).send('Imagem alterada com sucesso.');
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

exports.patchImagem5 = async (request, response) => {
    try {
        const { renavam, id_vendedor } = request.params;
        const { key: imagem5, location: path_imagem5 } = request.file;
        const query = 'SELECT imagem5 FROM veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk WHERE veiculo_pk = ? AND vendedor_id = ?';

        await mysql.execute(query, [ renavam, id_vendedor ])
        .then((result) => {

            if(result.length == 0) return response.status(404).send('Dados não encontrados');

            var img = result[0]['imagem5'];
            deleteImage(img);

            img = imagem5;
            const query1 = 'UPDATE veiculos_imagens JOIN veiculos ON veiculos.renavam = veiculos_imagens.veiculo_pk SET imagem5 = ?, path_imagem5 = ? WHERE veiculo_pk = ? AND vendedor_id = ?';
    
            mysql.execute(query1, [ img, path_imagem5, renavam, id_vendedor ])
            .then(() => {
                return response.status(202).send('Imagem alterada com sucesso.');
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

function deleteImage(imagem){

    if(imagem != 'vazio'){
        s3.deleteObject({
            Bucket: process.env.S3_BUCKET,
            key: imagem
        }).promise();
    };
    return;
};