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
// const exec = require('child_process').exec;
const minimist = require('minimist');
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
// scss样式检查
const sassLint = () => {
  // 下划线 _xx.scss会被忽略过
  return src('src/assets/styles/*.scss', {
      base: 'src'
    })
    .pipe(plugins.sassLint())
    .pipe(plugins.sassLint.format())
    .pipe(plugins.sassLint.failOnError())
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
// js文件检查
const eslint = () => {
  return src('src/assets/scripts/*.js', {
      base: 'src'
    })
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
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
// 抽离js css 合并压缩
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
// plugins.sequence
const deploy = (done) => {
  const {
    production = false
  } = minimist(process.argv.slice(2))
  if(production){
    console.log('发布到生产环境')
  }else{
    console.log('发布测试环境')
  }
  done()
  // exec('yarn build', function (err, stdout, stderr) {
  //     console.log(stdout)
  //     done(err)
  // });
}

const lint = parallel(eslint, sassLint)
const compile = series(lint, parallel(style, script, page))

const build = series(clean, parallel(series(compile, useref), image, font, extra))
const start = series(clean,compile, server)
module.exports = {
  build,
  start,
  clean,
  serve:server,
  lint,
  deploy
}
