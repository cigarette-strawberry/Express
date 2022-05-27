const cookieParser = require('cookie-parser');
const rfs = require("rotating-file-stream"); // 每天记录一次日志
const createError = require('http-errors');
const multiparty = require('multiparty'); // 接收form-data请求
const express = require('express');
const morgan = require('morgan'); // 记录日志功能
const path = require('path');
const fs = require('fs');

const app = express();

const indexRouter = require('./routes/index');

const parseJwt = require('express-jwt').expressjwt // 解析token
const SECRET_KEY = 'xiaowu2022' // 与生成token的密钥要一致!

app.use( // 解析token
    parseJwt({
        secret: SECRET_KEY,
        algorithms: ['HS256'], // 使用何种加密算法解析
    }).unless({path: ['/login']}) // 登录页无需校验
)

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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));

const logDirectory = path.join(__dirname, 'log') // 创建目录
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const generator = () => {
    const today = new Date();
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    return `success-${year}-${month}-${day}.log`;
};

morgan.token('localDate', function (req) { // 自定义记录 日期格式
    let date = new Date();
    return date.toLocaleString()
})
morgan.token('requestParameters', function (req) { // 自定义记录 query参数
    return JSON.stringify(req.query);
})
morgan.token('requestBody', function (req) { // 自定义记录 x-www-form-urlencoded参数
    return JSON.stringify(req.body);
})

morgan.token('contentType', function (req) { // 自定义记录请求主体
    return req.headers['content-type'] || '无请求主体';
})

// 自定义format日志，其中包含自定义的token
morgan.format('combined', ':remote-addr - :remote-user [:localDate] ":method :url HTTP/:http-version" :status [:contentType] [:requestParameters] [:requestBody] [:requestFormData] :res[content-length] ":referrer" ":user-agent"')

const accessLogStream = rfs.createStream(generator, { // 一天写入一次日志
    interval: '1d',
    path: path.join(logDirectory)
})

app.use(morgan('combined', {stream: accessLogStream}))

// 跨域
app.use(function (req, res, next) {
    if (req.method == 'OPTIONS') res.send('OPTIONS PASS')
    res.append('Access-Control-Allow-Origin', '*')
    res.append('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE')
    res.append('Access-Control-Allow-Headers', '*')
    next();
});

app.use(express.json()); // 解析 json 数据
app.use(express.urlencoded({extended: false})); // 解析 urlencoded 数据

app.use(cookieParser()); // 接收 cookie

app.use(express.static(path.join(__dirname, 'public'))); // 静态文件

app.use((req, res, next) => {
    const form = new multiparty.Form(); // 接收 form-data 数据
    form.parse(req, function (err, fields, files) {
        morgan.token('requestFormData', function (req) { // 记录 form-data 参数
            return JSON.stringify(fields)
        })
    });
    next()
})

module.exports = app;
