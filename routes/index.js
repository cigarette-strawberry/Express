var express = require('express');
var router = express.Router();

// 引入数据库配置文件
const userService = require('../controllers/mysqlConfig');

/* GET home page. */
router.get('/', function (req, res, next) {
    // res.render('index', { title: 'Express' });
    const sql = 'SELECT * FROM users';
    userService.query(sql, (err, result) => {
        if (err) {
            return;
        }
        // res：API传数据
        // result：返回的数据，需要转成JSON格式
        res.json(result);
    });
});

module.exports = router;
