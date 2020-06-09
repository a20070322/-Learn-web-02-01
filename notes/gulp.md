> 基于流的构建系统

# gulp基本使用

``` sh
# 初始化项目
yarn init -y
# 安装gulp
yarn add gulp -D
```

项目根目录创建 gulpfile.js 文件 (gulp入口文件)

## 定义一个基本任务

``` js
// 定义一个构件任务
exports.foo = done => {
    console.log('hello foo')
    // 标识任务完成
    done()
}
```

> 执行 yarn gulp foo

## 定义一个默认任务

``` js
// 定义一个默认构建任务
exports.default = done => {
    console.log('hello default')
    // 标识任务完成
    done()
}
```

> 执行 yarn gulp

## 组合任务

``` js
const {
    series,
    parallel
} = require('gulp')

const task1 = done => {
    setTimeout(() => {
        console.log('task1 working')
        done()
    }, 300)
}
const task2 = done => {
    setTimeout(() => {
        console.log('task2 working')
        done()
    }, 200)
}
const task3 = done => {
    setTimeout(() => {
        console.log('task3 working')
        done()
    }, 100)
}
// 通过 series 串行任务
exports.series = series(task1, task2, task3)
// 通过 parallel 并行任务
exports.parallel = parallel(task1, task2, task3)
```

> 分别调用 yarn gulp series  和  yarn gulp parallel 可以查看效果

 

## 异步任务

### 回调方式

``` js
// 回调函数方式
exports.callback = done => {
    console.log('calback task')
    done()
}
// 错误优先回调函数
exports.callback_err = done => {
    console.log('calback task')
    done(new Error('task failed'))
}
```

### promise

``` js
// 使用promise
exports.promise = () => {
    console.log( `Promise task` )
    return Promise.resolve()
}

// 使用promise 抛出异常
exports.promise_err = () => {
    console.log( `Promise task` )
    return Promise.reject( `failed Promise` )
}
```

### async

``` js
// 模拟异步请求
const timeroutPromise = time => {
    return new Promise(resolve => {
        console.log( `等待${time}` )
        setTimeout(resolve, time)
    })
}
// 模拟错误异步请求
const errPromise = time => {
    return new Promise((resolve, reject) => {
        console.log( `等待${time}` )
        setTimeout(reject, time)
    })
}

// 使用 async
exports.async = async () => {
    await timeroutPromise(100)
    console.log( `async task` )
}

// 使用 async
exports.async_err = async () => {
    await errPromise(100)
    console.log( `asyncerr task` )
}
```

### 流操作(常用)

``` js
const fs = require('fs')
// stream 流操作
exports.stream = () => {
    // 读取定义
    const readStream = fs.createReadStream('package.json')
    // 写入定义
    const writeStream = fs.createWriteStream('package.json.tmp')
    // 管道操作
    readStream.pipe(writeStream)
    return readStream
}
// stream 使用回调方式模拟流操作结束 
exports.streamMock = done => {
    // 读取定义
    const readStream = fs.createReadStream('package.json')
    // 写入定义
    const writeStream = fs.createWriteStream('package.json.tmp')
    // 管道操作
    readStream.pipe(writeStream)
    readStream.on('end', () => {
        done()
    })
}
```

## 构建过程核心原理

![](http://oss.ahh5.com/ahh5/md/202020200604213058.png)

### 模拟压缩CSS

目录结构如下

``` 
├── dist
├── gulpfile.js
├── package.json
├── package.json.tmp
├── src
│   └── style.css
└── yarn.lock
```

style.css

``` css
/* body注释 */
body {
    background: #ffffff;
}

/* html注释 */
html {
    background: #e0e5e5;
}
```

gulpfile.js

``` js
const fs = require('fs')
const {
    Transform
} = require('stream')
exports.default = () => {
    // 文件读取流
    const read = fs.createReadStream('src/style.css')
    // 文件写入流
    const write = fs.createWriteStream('dist/style.min.css')
    // 文件转换流
    const transform = new Transform({
        transform: (chunk, encoding, callback) => {
            // 核心转换过程实现
            // chunk => 读取流中读取到内容（Buffer）
            const input = chunk.toString()
            // 模拟压缩转换
            const output = input.replace(/\s+/g, '').replace(/\/\*.+?\*\//g, '')
            // 返回结果，第一个参数是异常 没有异常传 null ,第二个参数是返回值
            callback(null, output)
        }
    })
    // 管道操作
    read
        .pipe(transform) //转换
        .pipe(write) // 写入
    return read
}
```

执行 yarn gulp

## 文件操作APi以及转换流

将 src/*.css 导入到 dist目录下

``` js
const {
    src,
    dest
} = require('gulp')

exports.default = () => {
    return src('src/*.css')
        .pipe(dest('dist'))
}
```

安装 ***yarn add gulp-clean-css -D*** (压缩css)

安装 ***yarn add gulp-rename -D*** (重命名)

``` js
// 将 src/*.css 导入到dist目录下并压缩且重命名
const {
    src,
    dest
} = require('gulp')
// 引入压缩css插件
const cleanCss = require('gulp-clean-css')
// 引入重命名插件
const rename = require('gulp-rename')
exports.default = () => {
    return src('src/*.css')
        .pipe(cleanCss())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest('dist'))
}
```

## gulp-常见构建任务

> git clone git@github.com:zce/zce-gulp-demo.git  下载模板项目

``` 
# 安装gulp 
yarn add gulp -D 
# 创建gulpfile文件
echo gulpfile.js
```

### 引入gul并导出src dest

``` js
const {
    src,
    dest
} = require('gulp')
```

### 样式编译

``` js
// yarn add gulp-sass -D  
const sass = require('gulp-sass')
const style = () => {
    // 下划线 _xx.scss会被忽略过
    return src('src/assets/styles/*.scss', {
            base: 'src'
        })
        .pipe(sass({
            // 设置输出为展开模式
            outputStyle: 'expanded'
        }))
        .pipe(dest('dist'))
}
```

### js文件编译

``` js
// yarn add gulp-babel @babel/preset-env @babel/core -D  
const babel = require('gulp-babel')
const script = () => {
    return src('src/assets/scripts/*.js', {
            base: 'src'
        })
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest('dist'))
}
```

### 模板文件编译

``` js
// yarn add gulp-swig -D  
const swig = require('gulp-swig')
const page = () => {
    // **/* 所有子目录通配方式
    return src('src/*.html', {
            base: 'src'
        })
        .pipe(swig({
            // 需要设置 cache 为false,否则后面的自动更新不会生效
            defaults: {
                cache: false
            },
            data
        }))
        .pipe(dest('dist'))
}
```

### 图片压缩

``` js
// yarn add gulp-imagemin -D
const imagemin = require('gulp-imagemin')
const image = () => {
    return (src('src/assets/images/**', {
            base: 'src'
        }))
        .pipe(imagemin())
        .pipe(dest('dist'))
}
```

### 字体文件处理

``` js
const font = () => {
    return (src('src/assets/fonts/**', {
            base: 'src'
        }))
        .pipe(imagemin())
        .pipe(dest('dist'))
}
```

### 无需处理文件复制到dist

``` js
// 额外文件拷贝
const extra = () => {
    return (src('public/**', {
            base: 'public'
        }))
        .pipe(dest('dist'))
}
```

### 自动删除dist

``` js
// yarn add del -D 
const del = require('del')
const clean = () => {
    return del(['dist'])
}
```

### useref 文件引用处理(处理文件引用关系)

``` js
// yarn add gulp-useref -D 
const useref = require('gulp-useref')
const useRef = () => {
    return (src('dist/**/*.html', {
            base: 'dist'
        }))
        .pipe(useref({
            searchPath: ['dist', '.']
        }))
        .pipe(dest('dist'))
}
```

### 压缩文件

``` js
// 压缩文件
// gulp-if 判断
//  html js css 压缩
// yarn add gulp-htmlmin gulp-uglify gulp-clean-css gulp-if -D -D 
const useref = require('gulp-useref')
const gulpif = require('gulp-if')
const htmlmin = require('gulp-htmlmin')
const cleanCss = require('gulp-clean-css')
const uglify = require('gulp-uglify')
const useRef = () => {
    return (src('dist/**/*.html', {
            base: 'dist'
        }))
        .pipe(useref({
            searchPath: ['dist', '.']
        }))
        // 压缩js
        .pipe(gulpif(/\.js$/, uglify()))
        // 压缩css
        .pipe(gulpif(/\.css$/, cleanCss()))
        // 压缩html
        .pipe(gulpif(/\.html$/, htmlmin({
            minifyCSS: true,
            minifyCSS: true,
            minifyURLs: true,
            collapseWhitespace: true,
            removeComments: true
        })))
        .pipe(dest('release'))
}
```

### 组合功能

``` js
const {
    parallel,
    series
} = require('gulp')

// 开发打包
const compile = series(clean, parallel(style, script, page))

// 生产环境打包
const build = series(compile, parallel(image, font), extra, useRef)
```

### 热更新服务器

``` js
const browserSync = require('browser-sync')
const bs = browserSync.create()
const server = () => {
    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/**/*.js', script)
    watch('src/**.html', page)
    watch(['src/assets/fonts/**', 'src/assets/images/**', 'public/**'], bs.reload)
    bs.init({
        // 关闭右上角提示
        notify: false,
        // 端口
        port: 6001,
        // 不默认打开
        open: false,
        // 监听文件变化，自动刷新
        files: "dist/**",
        // 服务设置
        server: {
            // 运行文件夹
            baseDir: ['dist', 'src', 'public'],
            // 配置映射，routes 高于 baseDir
            routes: {
                // 将 /node_modules 映射到工程下的node_modules
                '/node_modules': 'node_modules'
            }
        }
    })
}
// 组合出dev功能，先编译在启动
const dev = series(compile, server)
```

### gulp自动载入包

``` js
yarn add gulp - load - plugins - D
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
// 使用方式 
// plugins.babel  
// 如果是 gulp-ab-cd-ef
// 调用名为 abCdEf
```

## 完整的gulpfile.js文件

``` js
const data = {
    menus: [{
            name: 'Home',
            icon: 'aperture',
            link: 'index.html'
        },
        {
            name: 'Features',
            link: 'features.html'
        },
        {
            name: 'About',
            link: 'about.html'
        },
        {
            name: 'Contact',
            link: '#',
            children: [{
                    name: 'Twitter',
                    link: 'https://twitter.com/w_zce'
                },
                {
                    name: 'About',
                    link: 'https://weibo.com/zceme'
                },
                {
                    name: 'divider'
                },
                {
                    name: 'About',
                    link: 'https://github.com/zce'
                }
            ]
        }
    ],
    pkg: require('./package.json'),
    date: new Date()
}

const {
    src,
    dest,
    watch
} = require('gulp')
const del = require('del')

const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()

// 样式编译
const style = () => {
    // 下划线 _xx.scss会被忽略过
    return src('src/assets/styles/*.scss', {
            base: 'src'
        })
        .pipe(plugins.sass({
            // 设置输出为展开模式
            outputStyle: 'expanded'
        }))
        .pipe(dest('temp'))
        .pipe(bs.reload({
            stream: true
        }))
}

// js文件编译
const script = () => {
    return src('src/assets/scripts/*.js', {
            base: 'src'
        })
        .pipe(plugins.babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest('temp'))
        .pipe(bs.reload({
            stream: true
        }))
}

// 模板文件编译
const page = () => {
    // **/* 所有子目录通配方式
    return src('src/*.html', {
            base: 'src'
        })
        .pipe(plugins.swig({
            // 需要设置 cache 为false,否则后面的自动更新不会生效
            defaults: {
                cache: false
            },
            data
        }))
        .pipe(dest('temp'))
        .pipe(bs.reload({
            stream: true
        }))
}

// 图片压缩
const image = () => {
    return (src('src/assets/images/**', {
            base: 'src'
        }))
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

// 字体文件
const font = () => {
    return (src('src/assets/fonts/*', {
            base: 'src'
        }))
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

// 额外文件拷贝
const extra = () => {
    return (src('public/**', {
            base: 'public'
        }))
        .pipe(dest('dist'))
}

// 自动删除dist文件
const clean = () => {
    return del(['dist', 'temp'])
}
const useref = () => {
    return (src('temp/**/*.html', {
            base: 'temp'
        }))
        .pipe(plugins.useref({
            searchPath: ['temp', '.']
        }))
        // 压缩js
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        // 压缩css
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        // 压缩html
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            minifyCSS: true,
            minifyCSS: true,
            minifyURLs: true,
            collapseWhitespace: true,
            removeComments: true
        })))
        .pipe(dest('dist'))
}

// 组合功能
const {
    parallel,
    series
} = require('gulp')

const compile = parallel(style, script, page)

const build = series(clean, parallel(series(compile, useref), image, font, extra))

// 优化开发环境 减少不必要开销 例如图片压缩 字体压缩
const browserSync = require('browser-sync')
const bs = browserSync.create()
const server = () => {
    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/**/*.js', script)
    watch('src/**.html', page)
    watch(['src/assets/fonts/**', 'src/assets/images/**', 'public/**'], bs.reload)
    bs.init({
        // 关闭右上角提示
        notify: false,
        // 端口
        port: 6001,
        // 不默认打开
        open: false,
        // 服务设置
        server: {
            // 运行文件夹
            baseDir: ['temp', 'src', 'public'],
            // 配置映射，routes 高于 baseDir
            routes: {
                // 将 /node_modules 映射到工程下的node_modules
                '/node_modules': 'node_modules'
            }
        }
    })
}
const dev = series(compile, server)
module.exports = {
    build,
    dev,
    clean
}
```
