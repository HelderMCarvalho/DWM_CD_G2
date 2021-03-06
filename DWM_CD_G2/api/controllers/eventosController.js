'use strict';
var mongoose = require('mongoose'),
    async = require("async"),
    Inscricao = mongoose.model('Inscricao'),
    Evento = mongoose.model('Evento'),
    Pessoa = mongoose.model('Pessoa');
exports.list_all_eventos = function (req, res) {
    Evento.find({}, function (err, evento) {
        if (err)
            res.send(err);
        res.json(evento);
    });
};
exports.create_a_evento = function (req, res) {
    var new_evento = new Evento(req.body);
    new_evento.save(function (err, evento) {
        if (err)
            res.send(err);
        res.json(evento);
    });
};
exports.list_all_inscricoesEvento = function (req, res) {
    Evento.findById(req.params.idEvento, function (err, evento) {
        if (err) 
            res.send(err);
        let listaInscricoes = [];
        async.each(evento.inscritos, function (inscritoAtual, callback) {
            Inscricao.find({ _id: inscritoAtual._id }, function (err, inscricao) {
                listaInscricoes.push(inscricao);
                console.log(inscricao);
                callback();
            });
        }, function (err) {
            if (err) {
                console.log('Erro');
            } else {
                res.json(listaInscricoes);
            }
        });
        //DEMORA ALGUNS SEGUNDOS PARA DEVOLVER TUDO (PROBLEMA)
    });
};
exports.read_a_evento = function (req, res) {
    Evento.findById(req.params.idEvento, function (err, evento) {
        if (err)
            res.send(err);
        res.json(evento);
    });
};
exports.create_a_novaInscricaoEvento = function (req, res) {
	Evento.findById(req.params.idEvento, function (err, evento) {
		if (err)
			res.send(err);
		if (evento.lotacaoAtual < evento.lotacao) {
			var total = parseInt(evento.lotacaoAtual) + parseInt(req.body.lugares);
			console.log(total);
			if (total <= evento.lotacao) {
				var new_insc = new Inscricao(req.body);
				new_insc.save(function (err, inscricao) {
					if (err)
						res.send(err);
					Evento.findOneAndUpdate({ _id: req.params.idEvento }, { $push: { inscritos: new_insc._id }, lotacaoAtual: total }, { new: true }, function (err, evento) {
						if (err)
							res.send(err);
						res.json({ 'novaInscricao': inscricao, 'eventoAlterado': evento });
					});
				});
			} else {
				res.json({ message: 'Os lugares que quer reservar nao estao disponiveis, tente reservar menos lugares!' });
			}
		} else {
			res.json({ message: 'Evento cheio' });
		}
	});
};
exports.update_a_evento = function (req, res) {
    Evento.findOneAndUpdate({ _id: req.params.idEvento }, req.body, { new: true }, function (err, evento) {
        if (err)
            res.send(err);
        res.json(evento);
    });
};
exports.delete_a_evento = function (req, res) {
    Evento.remove({ _id: req.params.idEvento }, function (err, evento) {
        if (err)
            res.send(err);
        res.json({ message: 'Evento eliminado!' });
    });
};
exports.delete_a_inscricao_evento = function (req, res) {
	Evento.findById(req.params.idEvento, function (err, evento) {
		if (err)
			res.send(err);
		if (evento.lotacaoAtual > 0) {
			Inscricao.findById(req.params.idInscricao, function (err, inscricao) {
				if (err)
					res.send(err);
				var subtrair = evento.lotacaoAtual - inscricao.lugares;
				Evento.findOneAndUpdate({ _id: req.params.idEvento }, { $pull: { inscritos: req.params.idInscricao }, lotacaoAtual: subtrair}, { new: true }, function (err, evento) {
					if (err)
						res.send(err);
					Inscricao.remove({ _id: req.params.idInscricao }, function (err, inscricao) {
						if (err)
							res.send(err);
						res.json({ message: 'Inscricao eliminada!' });
					});
				});
			});
		} else {
			res.json({ message: 'Evento sem inscricao!' });
		}
	});
	
};