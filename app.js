var createError = require('http-errors'); // 轻松为 Express、Koa、Connect 等创建 HTTP 错误。
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser'); // 引入cookie模块，拦截器中req.cookies.userCookies是依赖于该模块的
var logger = require('morgan'); // node.js 的 HTTP 请求记录器中间件

var multiparty = require('multiparty');   // 接收form data数据

const parseJwt = require('express-jwt').expressjwt   // 解析 token
const SECRET_KEY = 'xiaowu2022' // 与生成token的密钥要一致!

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup   查看引擎设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

app.use(express.json());   // Query Params
app.use(express.urlencoded({extended: false}));   // x-www-form-urlencoded

app.use(cookieParser()); // 使用cookie模块获取客户端的cookies;

app.use(express.static(path.join(__dirname, 'public'))); // 静态文件

app.use(
    parseJwt({
        secret: SECRET_KEY,
        algorithms: ['HS256'], // 使用何种加密算法解析
    }).unless({path: ['/login']}) // 登录页无需校验
)

app.use((req, res, next) => {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        console.log(req, res)
        next()
    });
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler   捕获404并转发到错误处理程序
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler   错误处理程序
app.use(function (err, req, res, next) {
    // set locals, only providing error in development   设置局部变量，仅提供开发中的错误
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
