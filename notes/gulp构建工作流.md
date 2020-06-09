## 封装自动化构建工作流
![](http://oss.ahh5.com/ahh5/md/202020200607170509.png)

### 准备工作
* 创建一个github仓库
* yarn global add zce-cli
* zsc init nm  
* 代码提交至git仓库

项目初始化结束后目录结构如下
```
├── CHANGELOG.md
├── LICENSE
├── README.md
├── lib
│   └── index.js
└── package.json
```
* 提取gulpfile
```js
const { src, dest, parallel, series, watch } = require('gulp')
const path = require('path')
const del = require('del')
const browserSync = require('browser-sync')

const loadPlugins = require('gulp-load-plugins')

const plugins = loadPlugins()
const bs = browserSync.create()

const cwd = process.cwd()

const defaultConfig={
  dev:{
    port:4000
},
  build:{
    src:'src',
    dist:'dist',
    temp:'temp',
    public:'public',
    paths:{
      style:'assets/styles/*.scss',
      script:'assets/scripts/*.js',
      pages:'*.html',
      images:'assets/images/**',
      fonts:'assets/fonts/**'
    }
  }
}

let config = {
  ...defaultConfig
}
try {
  const inputConfig = require( path.join(cwd,'pages.config.js'))
  config = {
    ...config,
    ...inputConfig
  }
} catch (error) {

}

const clean = () => {
  return del([config.build.dist, config.build.temp])
}

const style = () => {
  return src(config.build.paths.style, { base: config.build.src,cwd:config.build.src})
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))
}

const script = () => {
  return src(config.build.paths.script, { base: config.build.src,cwd:config.build.src})
    .pipe(plugins.babel({ presets:[require('@babel/preset-env')] }))
    .pipe(dest( config.build.temp))
    .pipe(bs.reload({ stream: true }))
}

const page = () => {
  return src(config.build.paths.pages, { base: config.build.src,cwd:config.build.src})
    .pipe(plugins.swig({ data:config.data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest( config.build.temp))
    .pipe(bs.reload({ stream: true }))
}

const image = () => {
  return src(config.build.paths.images, { base: config.build.src,cwd:config.build.src})
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const font = () => {
  return src(config.build.paths.fonts, { base: config.src,cwd:config.build.src})
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const extra = () => {
  return src('**', { base: config.build.public,cwd:config.build.public })
    .pipe(dest(config.build.dist))
}

const serve = () => {
  watch(config.build.paths.style,{cwd:config.build.src}, style)
  watch(config.build.paths.script,{cwd:config.build.src}, script)
  watch(config.build.paths.pages,{cwd:config.build.src}, page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    config.build.paths.images,
    config.build.paths.fonts,
    'public/**'
  ],{cwd:config.build.src}, bs.reload)
  watch([
    '**'
  ],{cwd:config.build.public}, bs.reload)
  bs.init({
    notify: false,
    port: config.dev.port,
    open: false,
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const useref = () => {
  return src(config.build.paths.pages, { base: 'temp',cwd:config.build.temp })
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
    // html js css
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest(config.build.temp))
}

const compile = parallel(style, script, page)

// 上线之前执行的任务
const build =  series(
  clean,
  parallel(
    series(compile, useref),
    image,
    font,
    extra
  )
)

const dev = series(compile, serve)

module.exports = {
  clean,
  build,
  dev
}

```
#### 修改package.json
```json
{
    ...
    "bin": "bin/zzy-page.js",
    ...
}
```
#### 提交github
#### 发布到npm仓库

> 后面的笔记需要整理一下，感觉目前的技术水平对于前端工程化部分还有所欠缺，例如生成基础模板文件、自动化部署等等