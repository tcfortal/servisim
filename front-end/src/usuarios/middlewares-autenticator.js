const passport = require('passport');
const Usuario = require('./usuarios-modelo')
const { InvalidArgumentError } = require('../erros')
///const refreshTokenList = require('../../redis/refresh_token_list')

/*
async function verificaRefreshToken(refreshToken) {
    if (!refreshToken) {
        throw new InvalidArgumentError('Refresh Token não enviado!');
    }

    const id = await refreshTokenList.buscaValor(refreshToken);

    if (!id) {
        throw new InvalidArgumentError('Refresh Token inválido!');
    }

    return id;
}

async function invalidaRefreshToken(refreshToken) {
    await refreshTokenList.deleta(refreshToken);
}
*/

module.exports = {
    local: (req, res, next) => {
        passport.authenticate(
            'local',
            { session: false },
            (erro, usuario, info) => {
                if (erro && erro.name === 'InvalidArgumentError') {
                    return res.status(401).json({ erro: erro.message });
                }

                if (erro) {
                    return res.status(500).json({ erro: erro.message });
                }

                if (!usuario) {
                    return res.status(401).json();
                }

                req.user = usuario
                return next();
            }
        )(req, res, next);
    },

    bearer: (req, res, next) => {
        passport.authenticate(
            'bearer',
            { session: false },
            (erro, usuario, info) => {
                if (erro && erro.name === 'JsonWebTokenError') {
                    return res.status(401).json({ erro: erro.message });
                }

                if (erro && erro.name === 'TokenExpiredError') {
                    return res.status(401).json({ erro: erro.message, expiradoEm: erro.expiredAt });
                }

                if (erro) {
                    return res.status(500).json({ erro: erro.message });
                }

                if (!usuario) {
                    return res.status(401).json();
                }

                if (erro && erro.name === 'ExpirationError') {
                    return res.status(401).json({ erro: erro.message });
                }
                req.token = info.token
                req.user = usuario
                return next();
            }
        )(req, res, next);
    },
/*
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const id = await verificaRefreshToken(refreshToken);
            await invalidaRefreshToken(refreshToken);
            req.user = await Usuario.buscaPorId(id);
            return next();
        } catch (erro) {
            if (erro.name === 'InvalidArgumentError') {
                return res.status(401).json({ erro: erro.message });
            }
            return res.status(500).json({ erro: erro.message });
        }
    },*/

    async verificacaoEmail(req, res, next) {

        const { email } = req.params;
        const usuario = await Usuario.buscaPorEmail(email);
        req.user = usuario;
        next();

    }


};