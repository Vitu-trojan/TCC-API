const mysql = require('../mysql');
const  nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const s3 = new aws.S3();

//Dados de login do e-mail ficticio da empresa para mandar emails para os clientes
const sender = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASS
    }
});

/* ---- GET de usuarios cadastrados no banco de dados. ------*/

//Método que retorna todos os usuários cadastrados no banco. --OK
exports.getUsuarios = async (request, response) => {
    try {
        const query = 'SELECT * FROM usuarios';

        await mysql.execute(query, [])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Nenhum usuário cadastrado ainda.');
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch(error) {
        return response.status(500).send(error);
    }
};

//método para uso único para saber informações básicas dos 3 usuários com maior lance.
exports.getInfoUsuarios = async (request, response) => {
    try {
        const { usuario_id, usuario_id2, usuario_id3 } = request.params;
        const query = 'SELECT id, nome, telefone, endereco, link, path_avatar, criacao_conta FROM usuarios WHERE id = ? OR id = ? OR id = ?';
        await mysql.execute(query, [ usuario_id, usuario_id2, usuario_id3 ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Dados não encontrados.');
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
}

//Método para pegar informações básicas de um usuário em específico.
exports.getInfoUsuario = async (request, response) => {
    try {
        const { usuario_id } = request.params;
        const query = 'SELECT id, nome, telefone, endereco, link, path_avatar, criacao_conta FROM usuarios WHERE id = ?';

        await mysql.execute(query, [ usuario_id ])
        .then((result) => {
            if(result.length == 0) return response.status(500).send('Usuário não encontrado.');
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
}

//Método que retorna os dados de um usuário em específico. --OK
exports.getUsuario = async (request, response) => {
    try {
        const { email, senha } = request.params;
        const query = 'SELECT * FROM usuarios JOIN tipo_usuarios ON usuarios.cpf_cnpj = tipo_usuarios.usuario_pk WHERE email = ? AND senha = ?';

        await mysql.execute(query, [ email, senha ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Dados não encontrados.');

            const val = result[0].validacao;
            if(val == 'false') return response.status(206).send(result[0].cod_validacao);

            return response.status(200).send(result[0]);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch(error) {
        return response.status(500).send(error);
    };
    
        
};

exports.getUsuarioValidation = async (request, response) => {
    try {
        const { email, cod_validacao } = request.params;
        const query = 'SELECT * FROM usuarios JOIN tipo_usuarios ON usuarios.cpf_cnpj = tipo_usuarios.usuario_pk WHERE email = ? AND cod_validacao = ?';
        await mysql.execute(query, [ email, cod_validacao ])
        .then((result) => {

            if(result.length == 0) return response.status(404).send('Dados não encontrados.');

            const val = result[0].validacao;
            if(val == 'false') return response.status(206).send(result[0].cod_validacao);
            
            return response.status(200).send(result[0]);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
}

//Método que retorna os participantes do leilão. --Talvez
exports.getCompradoresLeilao = async (request, response) => {
    try {
        const { leilao_id } = request.params;
        const query = 'SELECT COUNT(usuario_pk) AS participantes FROM tipo_usuarios WHERE leilao = ? OR leilao2 = ? OR leilao3 = ? OR leilao4 = ? OR leilao5 = ?';

        await mysql.execute(query, [leilao_id, leilao_id, leilao_id, leilao_id, leilao_id])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Não foi encontrado usuários participando deste leilão.');
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};


/* ------ POST de usuários no Banco de Dados (cadastro) ------*/

//Método que irá cadastrar os dados do cliente no banco. --OK
exports.postUsuario = async (request, response) => {
    try {
        const { cpf_cnpj, nome, telefone, email, data_nasc, endereco, link, senha } = request.body;
        const tipo = 9;        

        //Método criado para pega o dia em que a conta foi criada.
        const criacao = getDay();

        //gerando código de validação
        const cod_validacao = codeValidation();

        const query = 'INSERT INTO usuarios (cpf_cnpj, nome, telefone, email, data_nascimento, endereco, cod_validacao, link, senha, criacao_conta) VALUES (?,?,?,?,?,?,?,?,?,?)';

        const query1 = 'INSERT INTO tipo_usuarios (tipo, usuario_pk) VALUES (?,?)';

        await mysql.execute(query, [ cpf_cnpj, nome, telefone, email, data_nasc, endereco, cod_validacao, link, senha, criacao ])
        .then(() => {
            
            mysql.execute(query1, [ tipo, cpf_cnpj ])
            .then(() => {

                //Parte que irá mandar o e-mail para o cliente com o código de verificação.
                sender.sendMail({
                    from: 'QuemDa+',
                    to: `${email}`,
                    subject: 'Validação de conta quemDa+',
                    text: `Olá, somos da QuemDa+, e viemos lhe informar seu código de verificação para conseguir fazer login. Seu código é: ${cod_validacao}. A QuemDa+ agradece a sua atenção.`
                })
                .then(() => {                
                    return response.status(201).send('usuário ' + nome + ' criado com sucesso.');
                })
                .catch((err) => {       
                    return response.status(500).send(err);
                });
            })
            .catch((err) => {                
                return response.status(500).send(err);
            });
        })
        .catch((err) => {
            //Se há dados já cadastrados é retornado aqui.
            if(err.code == 'ER_DUP_ENTRY') return response.status(500).send('[ CPF/CNPJ, telefone, e-mail ] Algum dos já estão cadastrados, tente novamente.');
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

//Método que adiciona a foto de avatar do usuário á pasta e cadastra o caminho no banco. --OK
exports.postAvatarUsuario = async (request, response) => {
    try {
        const { pk } = request.params;
        const { key: avatar, location: path_avatar } = request.file;
        const query = 'UPDATE usuarios SET avatar = ?, path_avatar = ? WHERE cpf_cnpj = ?';
        
        await mysql.execute(query, [ avatar, path_avatar, pk])
        .then(() => {
            return response.status(201);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500);
    }
}

exports.postEmail = async (request, response) => {
    try {
        const { mensagem, email, nome } = request.body;

        await sender.sendMail({
            from: `${nome} <${email}>`,
            to: 'QuemDa+',
            subject: 'Mensagem cliente QuemDa+',
            text: `${mensagem}  De: ${nome} E-mail: ${email}`
        })
        .then((result) => {
            if(result.accepted.length != 0){
                return response.status(200).send('Sua mensagem foi enviada com sucesso! Iremos lhe responder o quanto antes por e-mail, fique atento. A QuemDa+ agradece a sua atenção.');
                
            } else{
                return response.status(500).send('Erro ao enviar mensagem, tente novamente.');
            }
        })
    } catch (error) {
        return response.status(500).send(err);
    }
}


/* ------ PATH de usuarios já cadastrados (atualização) --------*/

//Método que atualiza alguns dados do usuário. --TESTAR
exports.patchUsuario = async (request, response) => {
    try {
        const { cpf_cnpj, nome, telefone, endereco, link, senha } = request.body;
        
        const query = 'UPDATE usuarios SET nome = ?, telefone = ?, endereco = ?, link = ?, senha = ? WHERE cpf_cnpj = ?';

        await mysql.execute(query, [ nome, telefone, endereco, link, senha, cpf_cnpj ])
        .then(() => {
            return response.status(202).send('usuário ' + nome + ' atualizado com sucesso.');
        })
        .catch((err) => {
            if(err.code == 'ER_DUP_ENTRY') return response.status(500).send('Telefone já está cadastrado por outro usuário, tente novamente.');
            return repsosne.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

//Método que irá atualizar o avatar do usuário
exports.patchAvatarUsuario = async (request, response) => {
    try {
        const { cpf_cnpj } = request.params;
        const { key: avatar, location: path_avatar } = request.file;
        const query = 'SELECT avatar FROM usuarios WHERE cpf_cnpj = ?';

        await mysql.execute(query, [ cpf_cnpj ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Dados não encontrados.');

            //Recupera o caminho do avatr antigo, para apagá-lo.
            const avatarOld = result[0].avatar;
            s3.deleteObject({
                Bucket: process.env.S3_BUCKET,
                Key: avatarOld
            }).promise()

            //atualiza o caminho do novo avatar.
            const query1 = 'UPDATE usuarios SET avatar = ?, path_avatar = ? WHERE cpf_cnpj = ?';
            mysql.execute(query1, [ avatar, path_avatar, cpf_cnpj ])
            .then(() => {
                return response.status(202).send(path_avatar);
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

//método que vai atualizar o código de validação.
exports.patchCodVal = async (request,response) => {
    try {
        const { cpf_cnpj, email } = request.body;
        const query = 'SELECT * FROM usuarios WHERE cpf_cnpj = ? AND email = ?';

        await mysql.execute(query, [ cpf_cnpj, email ])
        .then((result) => {

            if(result.length == 0) return response.status(404).send('Dados não encontrados, verifique e tente novamente.');

            const codigo = codeValidation();
            const query1 = 'UPDATE usuarios SET cod_validacao = ? WHERE cpf_cnpj = ? AND email = ?'; 

            mysql.execute(query1, [ codigo, cpf_cnpj, email ])
            .then(() => {

                sender.sendMail({
                    from: 'QuemDa+',
                    to: `${email}`,
                    subject: 'Atualização do código de validação',
                    text: `Olá, seu código de validação foi atualizado para ser utilizado no login sem senha, após o login é recomendado a alteração da senha pois utilizar apenas o código de validação pode ser muito trabalhoso... Seu novo código de validação é: ${codigo}.  A QuemDa+ agradece a sua atenção.`
                })
                .then(() => {
                    return response.status(202).send('Sucesso, verifique sua caixa de e-mail.');
                })
                .catch((err) => {
                    return response.status(500).send(err);
                });
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
}

//Atualiza os leilões em que o usuário está participando --TESTAR
exports.patchLeiloes =  async (request, response) => {
    try {
        const { cpf_cnpj, leilao_id } = request.body;
        const query = 'SELECT leilao, leilao2, leilao3, leilao4, leilao5 FROM tipo_usuarios WHERE usuario_pk = ?';

        await mysql.execute(query, [ cpf_cnpj ])
        .then((result) => {

            var leilao = result[0].leilao;
            var leilao2 = result[0].leilao2;
            var leilao3 = result[0].leilao3;
            var leilao4 = result[0].leilao4;
            var leilao5 = result[0].leilao5;
    
            if(leilao.length != 0 && leilao2.length != 0 && leilao3.length != 0 && leilao4.length != 0 && leilao5.length != 0) return response.status(401).send('Não há vagas para participar de mais leilões');
    
            if(leilao.length == 0){
                leilao = leilao_id;
    
            } else if(leilao2.length == 0){
                leilao2 = leilao_id;
    
            } else if(leilao3.length == 0){
                leilao3 = leilao_id;
    
            } else if(leilao4.length == 0){
                leilao4 = leilao_id;
    
            } else {
                leilao5 = leilao_id;
            }
            
            const query1 = 'UPDATE tipo_usuarios SET leilao = ?, leilao2 = ?, leilao3 = ?, leilao4 = ?, leilao5 = ? WHERE usuario_pk = ?'; 

            mysql.execute(query1, [ leilao, leilao2, leilao3, leilao4, leilao5, cpf_cnpj ])
            .then(() => {
                return response.status(202).send('Você agora está participando deste leilão.');
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

//Atualiza a validação da conta --OK
exports.patchValidacao = async (request, response) => {
    try {
        const { email, cod_val } = request.params;
        const query = 'UPDATE usuarios SET validacao = ? WHERE email = ? AND cod_validacao = ?';
        const val = 'true';

        await mysql.execute(query, [ val, email, cod_val ])
        .then(() => {
            return response.status(200).send('Atualizado com sucesso.');
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.patchSairLeilao = async (request, response) => {
    try {
        const { usuario_pk, leilao_id } = request.body;
        const query = 'SELECT leilao, leilao2, leilao3, leilao4, leilao5 FROM tipo_usuarios WHERE usuario_pk = ?';
        const query2 = 'UPDATE tipo_usuarios SET leilao = ? WHERE usuario_pk = ?';
        const query3 = 'UPDATE tipo_usuarios SET leilao2 = ? WHERE usuario_pk = ?';
        const query4 = 'UPDATE tipo_usuarios SET leilao3 = ? WHERE usuario_pk = ?';
        const query5 = 'UPDATE tipo_usuarios SET leilao4 = ? WHERE usuario_pk = ?';
        const query6 = 'UPDATE tipo_usuarios SET leilao5 = ? WHERE usuario_pk = ?';

        await mysql.execute(query, [ usuario_pk ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Dados não encontrados.');
            const aux =  result[0];
            var slot;

            for(let x in aux){
                if(leilao_id == aux[x]){
                    slot = x;
                }
            }   
            
            if(slot){

                if(slot == 'leilao'){
                    var aQuery = query2;

                } else if(slot == 'leilao2'){
                    var aQuery = query3;

                } else if(slot == 'leilao3'){
                    var aQuery = query4;

                } else if(slot == 'leilao4'){
                    var aQuery = query5;

                } else if(slot == 'leilao5'){
                    var aQuery = query6;

                } else{
                    return response.status(404).send('Slot de leilão não encontrado.');
                }

                mysql.execute(aQuery, [ null, usuario_pk ])
                .then(() => {
                    return response.status(200).send('Sucesso.');
                })
                .catch((err) => {
                    return response.status(500).send(err);
                });
            } else{
                return response.status(404).send('Leilão não encontrado.');
            }
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
}



//-----------------funções complementares---------------//

//Método de pegar a data do dia atual. --OK
function getDay(){

    var data = new Date();
    var dia = data.getDate();
    var mes = data.getMonth();
    var ano = data.getFullYear().toString().substr(2,4);
    const date = dia + '/' + (mes+1) + '/' + ano;
    return date;
};

//criação e agrupamento de números aleatórios para o código de verificação.
function codeValidation(){

    const cod = new Set();
    for(let i = 0; i < 10; i++){
        cod.add(Math.floor(Math.random() * 21));
    }

    cod_validacao = '';
    cod.forEach(function(value){
        cod_validacao += value;
    });
    
    return cod_validacao;
};