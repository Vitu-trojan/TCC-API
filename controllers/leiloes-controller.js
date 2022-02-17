const mysql = require('../mysql');
const  nodemailer = require('nodemailer');

const sender = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASS
    }
});

/* ----- GET dos leilões com informações dos veiculos anunciados -----
*
* - Pesquisa por leilões que estão acontecendo e/ou vão acontecer de carros por categoria. --ok
* - Pesquisa por leilões que estão acontecendo / Pesquisa por leilões que vão acontecer (DISPONIVEIS). --ok
* - Pesquisa por um leilão em específico.
* - Pesquisa por leilões em que o usuário está participando. --ok
* - Pesquisa por leilões em que o usuário já participou.
* - Pesquisa por leilões que o vendedor criou. --ok
* - Presquisar por leilões que serão destaques. --ok
*/

exports.getLeiloesCategoria = async (request, response) => {
    try {
        const { pesquisa } = request.params;
        const query = 'SELECT * FROM leiloes JOIN veiculos ON leiloes.veiculo_id = veiculos.veiculo_id WHERE ';
        const st_disponivel = 'disponível';
        const params1 = query + 'veiculos.fabricante = ? AND status_leilao = ?';
        const params2 = query + 'veiculos.modelo = ? AND status_leilao = ?';
        const params3 = query + 'veiculos.carroceria = ? AND status_leilao = ?';

        await mysql.execute(params1, [ pesquisa, st_disponivel ])
        .then((result) => {
            if(result.length == 0){

                mysql.execute(params2, [ pesquisa, st_disponivel ])
                .then((result) => {
                    if(result.length == 0){

                        mysql.execute(params3, [ pesquisa, st_disponivel ])
                        .then((result) => {
                            if(result.length == 0) return response.status(404).send('Não foram encontrados leilões com a seguinte informação: '+ pesquisa+'.');

                            return response.status(200).send(result);
                        })
                        .catch((err) => {
                            return response.status(500).send(err);
                        });
                    } else{
                        return response.status(200).send(result);
                    }
                })
                .catch((err) => {
                    return response.status(500).send(err);
                });
            } else{
                return response.status(200).send(result);
            } 
        })
        .catch((err) => {
            return response.status(500).send(err)
        });  
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.getLeiloesDisponiveis = async (request, response) => {
    try {
        //função para alterar leiloes disponiveis para
        // finalizados após passada a data final.
        const limite = await limiteDataLeilao();
        if(limite) return response.status(500).send(limite);
        
        const query = 'SELECT * FROM leiloes JOIN veiculos ON veiculos.veiculo_id  = leiloes.veiculo_id WHERE status_leilao = ?';
        const st_disponível = 'disponível';

        await mysql.execute(query, [ st_disponível ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Não foi encontrado nenhum leilão disponível no momento.');
            
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });        
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.getLeiloesParticipando = async (request, response) => {
    try {
        const { usuario_pk } = request.params;
        const query = 'SELECT leilao, leilao2, leilao3, leilao4, leilao5 FROM tipo_usuarios WHERE usuario_pk = ?';

        await mysql.execute(query, [ usuario_pk ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Você não está participando de leilões no momento.');

            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.getLeilaoParticipando = async (request, response) => {
    try {
        const { leilao_id } = request.params;
        const query = 'SELECT * FROM leiloes JOIN veiculos ON veiculos.veiculo_id  = leiloes.veiculo_id WHERE leilao_id = ?';

        await mysql.execute(query, [ leilao_id ])
        .then((result) => {
            if(result.length == 0) return response.status(500).send('Dados não encontrados.');
            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
}

exports.getLeiloesCriados = async (request, response) => {
    try {
        const { vendedor_id } = request.params;
        const query = 'SELECT * FROM leiloes WHERE vendedor_id = ?';

        await mysql.execute(query, [ vendedor_id ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Não foi encontrado nenhum leilão criado por você.');

            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.getLeiloesDestaque =  async (request, response) => {
    try {
        const query = 'SELECT * FROM leiloes JOIN veiculos ON veiculos.veiculo_id  = leiloes.veiculo_id WHERE status_destaque = ? AND status_leilao = ?';
        const st_on = 'on';
        const st_disponível = 'disponível';

        await mysql.execute(query, [ st_on, st_disponível ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Não foram encontrados leilões em destaque, no momento.');

            return response.status(200).send(result);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.getLeilao = async (request, response) => {
    try {
        const { leilao_id } = request.params;

        const query = 'SELECT participantes, leilao_id, data_final, lance_inicial, lance_final, comprador_id, penultimo_lance, comprador_id2, antes_penultimo_lance, comprador_id3, status_destaque, comentarios, vendedor_id, veiculo_id, nome, telefone, link, path_avatar FROM leiloes JOIN usuarios ON leiloes.vendedor_id = usuarios.id WHERE leilao_id = ?';
        
        await mysql.execute(query, [ leilao_id ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Leilão não encontrado.');
            return response.status(200).send(result[0]);
        })
        .catch((err) => {
            return response.status(500).send(err);
        });
    } catch (error) {
        return response.status(500).send(error);
    }
};

/* -----POST de leilões ------
*
* - Receber informções básicas para o leilão e as informações do veículo.
*
*/

exports.postLeilao = async (request, response) => {
    try {
        let status_destaque;
        const { imagem_principal, data_final, lance_inicial, vendedor_id, veiculo_id } = request.body;
        const query = 'SELECT COUNT(leilao_id) AS cont FROM leiloes WHERE vendedor_id = ? AND status_leilao != ?';
        const status_leilao  = 'finalizado';
        
        // -- Verifica se o vendedor ja tem 5 leilões criados disponiveis ou pendente para finalizar.
        await mysql.execute(query, [ vendedor_id, status_leilao ])
        .then((check) => {
            if(check.length == 0) return response.status(404).send('Dados não encontrados.');
            
            //Verifica se o usuário já tem 5 leilões criados  e em andamento simultâneamente.
            if(check[0].cont == 5) return response.status(401).send('Você só pode criar até 5 leilões em andamento simultâneamente. Verifique nos seus leilões se há 5 deles disponíveis ou pendentes.');

            //verifica se o veiculo está disponível para o leilão que vai ser criado.
            const query = 'SELECT status_veiculo FROM veiculos WHERE veiculo_id =?';
            mysql.execute(query, [ veiculo_id ])
            .then((check2) => {

                if(check2.length == 0) return response.status(404).send('Dados não encontrados.');
                if(check2[0].status_veiculo != 'disponível') return response.status(401).send('O veículo não está disponível para leilão.');

                //verifica se o cliente tem opção de destaque ativa na conta.
                const query = 'SELECT destaque_produto FROM usuarios WHERE id = ?';
                mysql.execute(query, [ vendedor_id ])
                .then((check3) => {

                    if(check3.length == 0) return response.status(404).send('Dados não encontrados.');

                    status_destaque  = 'off';
                    if(check3[0].destaque_produto == 'on') status_destaque = 'on';
                    
                    const query = 'INSERT INTO leiloes (data_final, lance_inicial, status_leilao, status_destaque, veiculo_id, vendedor_id, imagem_principal) VALUES(?,?,?,?,?,?,?)';
                    const status_leilao2 = 'disponível';

                    mysql.execute(query, [ data_final, lance_inicial, status_leilao2, status_destaque, veiculo_id, vendedor_id, imagem_principal ])
                    .then(() => {

                        const query = 'UPDATE veiculos SET status_veiculo = ? WHERE veiculo_id = ?';
                        const st_veiculo = 'leilao';

                        mysql.execute(query, [ st_veiculo, veiculo_id ])
                        .then(() => {
                            return response.status(201).send('Leilão criado com sucesso.');
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


/* -----PATCH de leilões ------
*
*
*
*/
exports.patchLanceLeilao = async (request, response) => {
    try {
        const { leilao_id, usuario_lance, usuario_id, pk, nome, telefone, participante, slot } = request.body;
        const query = 'SELECT participantes, lance_final, comprador_id, penultimo_lance, comprador_id2, antes_penultimo_lance, comprador_id3, usuarios.email, usuarios.nome FROM leiloes JOIN usuarios ON usuarios.id = leiloes.vendedor_id WHERE leilao_id = ? AND status_leilao = ?';
        const st_leilao = 'disponível';

        mysql.execute(query, [ leilao_id, st_leilao ])
        .then((result) => {
            if(result.length == 0) return response.status(404).send('Dados não encontrados.');

            const lastLance = result[0].lance_final;
            const lastComprador = result[0].comprador_id;
            const lastLance2 = result[0].penultimo_lance;
            const lastComprador2 = result[0].comprador_id2;
            const lastLance3 = result[0].antes_penultimo_lance;
            const lastComprador3 = result[0].comprador_id3;

            if(usuario_id == lastComprador2){

                var user1 = usuario_id;
                var lanceF1 = usuario_lance;
                var user2 = lastComprador;
                var lanceF2 = lastLance;
                var user3 = lastComprador3;
                var lanceF3 = lastLance3;
        
            } else if(usuario_id == lastComprador){

                var user1 = usuario_id;
                var lanceF1 = usuario_lance;
                var user2 = lastComprador2;
                var lanceF2 = lastLance2;
                var user3 = lastComprador3;
                var lanceF3 = lastLance3;
        
            } else if(usuario_id == lastComprador3){
        
                var user1 = usuario_id;
                var lanceF1 = usuario_lance;
                var user2 = lastComprador;
                var lanceF2 = lastLance
                var user3 = lastComprador2;
                var lanceF3 = lastLance2;

            } else{
        
                var user1 = usuario_id;
                var lanceF1 = usuario_lance;
                var user2 = lastComprador;
                var lanceF2 = lastLance
                var user3 = lastComprador2;
                var lanceF3 = lastLance2;
            };

            if(result[0].participantes == 0){

                const query = 'UPDATE leiloes SET lance_final = ?, comprador_id = ?, participantes = participantes + 1 WHERE leilao_id = ?';
                mysql.execute(query, [ lanceF1, user1, leilao_id ])
                .then(() => {

                    enviarEmail(result, leilao_id, nome, telefone)
                    .then(() => {
                        auxAtualizarLeiloes(slot, pk, leilao_id);
                        return response.status(202).send('Você agora está participando deste leilão.');
                    })
                    .catch((err) => {
                        return response.status(500).send(err);
                    });
                })
                .catch((err) => {
                    return response.status(500).send(err);
                });

            } else if(result[0].participantes == 1){

                const query = 'UPDATE leiloes SET lance_final = ?, comprador_id = ?, penultimo_lance = ?, comprador_id2 = ?, participantes = participantes + ? WHERE leilao_id = ?';

                mysql.execute(query, [ lanceF1, user1, lanceF2, user2, participante, leilao_id ])
                .then(() => {

                    enviarEmail(result, leilao_id, nome, telefone)
                    .then(() => {
                        if(participante == 1){
                            auxAtualizarLeiloes(slot, pk, leilao_id);

                        } else{
                            return response.status(202).send('Seu lance neste leilão foi atualizado.');
                        }
                        return response.status(202).send('Você agora está participando deste leilão.');
                    })
                    .catch((err) => {
                        return response.status(500).send(err);
                    });
                })
                .catch((err) => {
                    return response.status(500).send(err);
                });

            } else {

                const query = 'UPDATE leiloes SET lance_final = ?, comprador_id = ?, penultimo_lance = ?, comprador_id2 = ?, antes_penultimo_lance = ?, comprador_id3 = ?, participantes = participantes + ? WHERE leilao_id = ?';

                

                mysql.execute(query, [ lanceF1, user1, lanceF2, user2, lanceF3, user3, participante, leilao_id ])
                .then(() => {
                    
                    enviarEmail(result, leilao_id, nome, telefone)
                    .then(() => {
                        if(participante == 1){
                            auxAtualizarLeiloes(slot, pk, leilao_id);

                        } else{
                            return response.status(202).send('Seu lance neste leilão foi atualizado.');
                        }
                        return response.status(202).send('Você agora está participando deste leilão.');
                    })
                    .catch((err) => {
                        return response.status(500).send(err);
                    });
                })
                .catch((err) => {
                    return response.status(500).send(err);
                });
            }
        })
        .catch((err) => {
            return response.status(500).send(err);
        }); 
    } catch (error) {
        return response.status(500).send(error);
    }
};

exports.patchStatusLeilao = async (request, response) => {
    try {
        const { vendedor_id } = request.params;
        const { leilao_id, patchVeiculo, veiculo_id } = request.body;
        const query = 'UPDATE leiloes set status_leilao = ? WHERE leilao_id = ? AND vendedor_id = ?';
        const st_finalizado = 'finalizado';

        await mysql.execute(query, [ st_finalizado, leilao_id, vendedor_id ])
        .then((result) => {
            if(result.changedRows == 0) return response.status(404).send('Leilão não encontrado, revise os dados.');

            const query2 = 'UPDATE veiculos SET status_veiculo = ? WHERE veiculo_id = ?';
            var st_veiculo = 'disponível';
            if(patchVeiculo) var st_veiculo = 'indisponível';

            mysql.execute(query2, [ st_veiculo, veiculo_id ])
            .then((result) => {
                if(result.changedRows == 0) return response.status(404).send('Veículo não encontrado.');
                return response.status(200).send('Sucesso.');
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

/* ----- DELETE de leilões -----
*
*
*
*/
async function limiteDataLeilao(){
    try {
        const query = 'SELECT leilao_id, data_final, status_leilao, vendedor_id, comprador_id, comprador_id2, comprador_id3 FROM leiloes';
        await mysql.execute(query, [])
        .then((result) => {
            if(result.length == 0) return;

            for(let x = 0; x < result.length; x++){
                let data_final_leilao = result[x].data_final;
                let status_leilao = result[x].status_leilao;
                let id = result[x].leilao_id;
                let vendedor_id = result[x].vendedor_id;
                let id1 = result[x].comprador_id;
                let id2 = result[x].comprador_id2;
                let id3 = result[x].comprador_id3;
                const st_pendente = 'pendente';

                const anoN = parseInt(data_final_leilao.substring(6,10));
                let mesN = parseInt(data_final_leilao.substring(3,5));
                const diaN = parseInt(data_final_leilao.substring(0,2));
        
                const today = new Date();
                let date2 = new Date();
                date2.setFullYear(anoN, (mesN-1), diaN);
        
                if(today > date2 && status_leilao == 'disponível'){
                    const query = 'UPDATE leiloes SET status_leilao = ? WHERE leilao_id = ?';
    
                    mysql.execute(query, [ st_pendente, id])
                    .then(() => {
                        emailLeilaoPendente(vendedor_id, id);
                        emailLeilaoPendenteCompradores(id1, id2, id3, id);
                    })
                    .catch((err) => {
                        return err;
                    });
                };
            }
        })
        .catch((err) => {
            return err;
        });
    } catch (error) {
        return error;
    }
};

async function enviarEmail(result, leilao_id, nome, telefone){
    await sender.sendMail({
        from: 'QuemDa+',
        to: `${result[0].email}`,
        subject: 'Novo lance no seu veículo',
        text: `Olá Sr(a) ${result[0].nome}, viemos lhe trazer uma boa notícia, houve um novo lance no seu veículo anunciado pelo leilão nº${leilao_id}. Lance feito pelo usuário: ${nome}, com o telefone de contato: ${telefone}, caso queria entrar em contato com este candidato. A QuemDa+ agradece a sua atenção.`
    })
    .then(() => {                
        return;
    })
    .catch((err) => {       
        return err;
    });
};

function auxAtualizarLeiloes(slot, pk, leilao_id){
    if(slot == 'leilao' || slot == '"leilao"'){
        atualizarLeilao(pk, leilao_id);

    } else if(slot == 'leilao2' || slot == '"leilao2"'){
        atualizarLeilao2(pk, leilao_id);

    } else if(slot == 'leilao3' || slot == '"leilao3"'){
        atualizarLeilao3(pk, leilao_id);

    } else if(slot == 'leilao4' || slot == '"leilao4"'){
        atualizarLeilao4(pk, leilao_id);

    } else if(slot == 'leilao5' || slot == '"leilao5"'){
        atualizarLeilao5(pk, leilao_id);
    } else{
        console.log('fail');
    }
};

async function atualizarLeilao(pk, leilao_id){

    const query = 'UPDATE tipo_usuarios SET leilao = ? WHERE usuario_pk = ?';

    mysql.execute(query, [ leilao_id, pk])
    .then(() => {
        return;
    })
    .catch((err) => {
        return err;
    })
};

async function atualizarLeilao2(pk, leilao_id){

    const query = 'UPDATE tipo_usuarios SET leilao2 = ? WHERE usuario_pk = ?';

    mysql.execute(query, [ leilao_id, pk])
    .then(() => {
        return;
    })
    .catch((err) => {
        return err;
    })
};

async function atualizarLeilao3(pk, leilao_id){

    const query = 'UPDATE tipo_usuarios SET leilao3 = ? WHERE usuario_pk = ?';

    mysql.execute(query, [ leilao_id, pk])
    .then(() => {
        return;
    })
    .catch((err) => {
        return err;
    })
};

async function atualizarLeilao4(pk, leilao_id){

    const query = 'UPDATE tipo_usuarios SET leilao4 = ? WHERE usuario_pk = ?';

    mysql.execute(query, [ leilao_id, pk])
    .then(() => {
        return;
    })
    .catch((err) => {
        return err;
    })
};

async function atualizarLeilao5(pk, leilao_id){

    const query = 'UPDATE tipo_usuarios SET leilao5 = ? WHERE usuario_pk = ?';

    mysql.execute(query, [ leilao_id, pk])
    .then(() => {
        return;
    })
    .catch((err) => {
        return err;
    })
};

async function emailLeilaoPendente(vendedor_id, leilao_id){
    const query = 'SELECT nome, email FROM usuarios WHERE id = ?';

    await mysql.execute(query, [ vendedor_id ])
    .then((result) => {
        if(result.length == 0) console.log('Dados não encontrados.');

        sender.sendMail({
            from: 'QuemDa+',
            to: `${result[0].email}`,
            subject: 'Anuncio do veículo',
            text: `Olá Sr(a) ${result[0].nome}, o período de anuncio do seu leilão Nº${leilao_id} acabou, para finalizar seu leilão completamente é necessário que entre no aplicativo e clique neste mesmo leilão que estará com o status pendente. Lembrando que se você tiver 5 leilões disponíveis e/ou pendentes não poderá criar outros até liberar os leilões pendentes! A QuemDa+ agradece a sua atenção.`
        })
        .catch((err) => {
            console.log(err);
        });
    })
    .catch((err) => {
        console.log(err);
    });
};

async function emailLeilaoPendenteCompradores(id, id2, id3, leilao_id){
    const query = 'SELECT nome, email FROM usuarios WHERE id = ? OR id = ? OR id = ?';

    await mysql.execute(query, [ id, id2, id3 ])
    .then((result) => {
        for(let x=0; x<result.length; x++){
            if(result[x].email != null || result[x].email != undefined){

                sender.sendMail({
                    from: 'QuemDa+',
                    to: `${result[x].email}`,
                    subject: 'Leilão em que você está participando',
                    text: `Olá Sr(a) ${result[x].nome}, o leilão Nº${leilao_id} que você estava participando encerrou o prazo para novos lances,  como você deu um dos maiores lances neste leilão, é possível que tenha grande chance de conseguí-lo,por isso fique atento ao seu E-mail e/ou telefone.Neste momento o leilão em que você participava está em status pendente para ser finalizado, para finalizar este leilão é necessário que você entre no aplicativo e clique neste mesmo leilão que estará com o status pendente. Lembrando que se você estiver participando de 5 leilões ao mesmo tempo é necessário esperar estes leilões acabarem para ingressar em outro leilão! A QuemDa+ agradece a sua atenção.`
                })
                .catch((err) => {
                    console.log(err);
                });
            }
        }
    })
    .catch((err) => {
        console.log(err);
    });
};