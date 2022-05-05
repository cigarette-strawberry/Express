var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken')
const SECRET_KEY = 'xiaowu2022'

// 引入数据库配置文件
const userService = require('../controllers/mysqlConfig');

router.post('/login', function (req, res, next) {
    const sql = 'SELECT * FROM users';
    userService.query(sql, (err, result) => {
        if (err) {
            return;
        }
        // 校验密码....(此处省略), 如果校验成功, 生成jwt
        // 参数1: 生成到token中的信息
        // 参数2: 密钥
        // 参数3: token的有效时间: 60, "2 days", "10h", "7d"
        const token = jwt.sign(
            {user: {name: 'xiaowu', password: 123456}},
            SECRET_KEY,
            {expiresIn: '3h'}
        )
        res.send({
            status: 200,
            message: 'login success!',
            token,
            data: result
        })
    });
});

module.exports = router;
