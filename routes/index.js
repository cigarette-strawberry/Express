var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken')
const SECRET_KEY = 'xiaowu2022'

// 引入数据库配置文件
const userService = require('../controllers/mysqlConfig');

router.get('/', (req, res, next) => {
    res.send({
        status: 200,
        message: 'login success!',
    })
})

router.post('/login', function (req, res, next) {
    const sql = 'SELECT * FROM T_Users';
    userService.query(sql, (err, result) => {
        if (err) {
            return err;
        }
        const token = jwt.sign(
            {user: {name: 'xiaowu', password: 123456}},
            SECRET_KEY,
            {expiresIn: '3h'}
        )
        res.send({
            status: 200,
            message: 'login success!',
            token: 'Bearer ' + token,
            data: result
        })
    });
});

module.exports = router;
