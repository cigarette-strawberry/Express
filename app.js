const cookieParser = require('cookie-parser');
const rfs = require("rotating-file-stream");
const createError = require('http-errors');
const multiparty = require('multiparty');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();

const parseJwt = require('express-jwt').expressjwt
const SECRET_KEY = 'xiaowu2022' // 与生成token的密钥要一致!

const indexRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));

const logDirectory = path.join(__dirname, 'log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const generator = () => {
    const today = new Date();
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    return `${year}-${month}-${day}.log`;
};

// 自定义token 日期格式
morgan.token('localDate', function (req) {
    let date = new Date();
    return date.toLocaleString()
})
morgan.token('requestParameters', function (req) {
    return JSON.stringify(req.query);
})
morgan.token('requestBody', function (req) {
    return JSON.stringify(req.body);
})
morgan.token('requestFormData', function (req) {
    const form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        console.log(fields)
        return JSON.stringify(fields);
    });
})
morgan.token('contentType', function (req) {
    return req.headers['content-type'] || '无请求主体';
})
// 自定义format，其中包含自定义的token
morgan.format('combined', ':remote-addr - :remote-user [:localDate] ":method :url HTTP/:http-version" :status :contentType :requestParameters :requestBody :requestFormData :res[content-length] ":referrer" ":user-agent"')

const accessLogStream = rfs.createStream(generator, {
    interval: '1d',
    path: path.join(logDirectory)
})

app.use(morgan('combined', {stream: accessLogStream}))

app.use(
    parseJwt({
        secret: SECRET_KEY,
        algorithms: ['HS256'], // 使用何种加密算法解析
    }).unless({path: ['/login']}) // 登录页无需校验
)

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    // console.log(req, res)
    const form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        console.log(req)
        next()
    });
    // next()
})

app.use('/', indexRouter);

// catch 404 and forward to error handler   捕获404并转发到错误处理程序
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler   错误处理程序
app.use(function (err, req, res, next) {
    // set locals, only providing error in development   设置局部变量，仅提供开发中的错误
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page   呈现错误页面
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
