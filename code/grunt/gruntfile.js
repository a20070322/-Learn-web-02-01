const sass = require('sass')
const path = require('path')
const loadGruntTasks = require('load-grunt-tasks')
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
console.log(__dirname)
module.exports = grunt => {
    loadGruntTasks(grunt)
    grunt.initConfig({
        // 编译js
        babel: {
            // 定义配置文件
            options: {
                presets: ['@babel/preset-env'],
                // 开启sourceMap文件
                sourceMap: true
            },
            // 定义个目标
            main: {
                expand: true,
                cwd: 'src',
                src: ['assets/scripts/*.js'],
                dest: 'temp/'
            }
        },
        // 编译sass
        sass: {
            options: {
                implementation: sass,
                sourceMap: true
            },
            // 定义个目标
            main: {
                expand: true,
                cwd: 'src',
                src: ['assets/styles/*.scss'],
                dest: 'temp/',
                ext: '.css'
            }
        },
        watch: {
            scripts: {
                files: ['src/assets/scripts/*.js'],
                tasks: ['eslint', 'babel'],
            },
            scss: {
                files: ['src/assets/styles/*.scss'],
                tasks: ['scsslint', 'sass'],
            },
            pages: {
                files: ['src/**/*.html'],
                tasks: ['swig'],
            },
        },
        clean: {
            dev: ['temp'],
            build: ['dist']
        },
        // 图片压缩
        imagemin: {
            options: {
                optimizationLevel: 7,
                pngquant: true
            },
            main: {
                files: [{
                    expand: true,
                    src: ['src/assets/images/*.{png,jpg,jpeg,gif,webp,svg}'],
                    dest: 'dist/'
                }]
            },
            fonts: {
                files: [{
                    expand: true,
                    src: ['src/assets/fonts/*.{png,jpg,jpeg,gif,webp,svg}'],
                    dest: 'dist/'
                }, ]
            },
        },
        concat: {
            js: {
                src: [
                    'dist/assets/scripts/**/*.js',
                    'node_modules/bootstrap/**/*.js'
                ],
                dest: 'dist/assets/scripts/vendor.js'
            },
            css: {
                src: [
                    'dist/assets/styles/*.css',
                    'node_modules/bootstrap/**/*.css'
                ],
                dest: 'dist/assets/styles/vendor.css'
            }
        },
        copy: {
            fonts: {
                files: [{
                    expand: true,
                    src: ['src/assets/fonts/*'],
                    dest: 'dist/'
                }]
            },
            extra: {
                files: [{
                    expand: true,
                    cwd: "public",
                    src: ['*'],
                    dest: 'dist/'
                }, ]
            },
            build: {
                files: [{
                    expand: true,
                    cwd: "temp",
                    src: ['**/*'],
                    dest: 'dist'
                }],
            }
        },
        swig: {
            swig: {
                options: {
                    data
                },
                expand: true,
                dest: 'temp/',
                cwd: 'src',
                src: ['*.html'],
                ext: '.html'
            },
        },
        browserSync: {
            bsFiles: {
                src: 'temp/**/*'
            },
            options: {
                watchTask: true,
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
                    },
                    keepalive: false
                }
            }
        },
        eslint: {
            target: ['src/assets/scripts/*.js']
        },
        scsslint: {
            allFiles: [
                'src/assets/styles/*.scss',
            ],
            options: {
                bundleExec: true,
                colorizeOutput: true
            },
        },
        useref: {
            html: 'dist/**/*.html',
            temp: 'dist'
        }
    })
    grunt.registerTask('build', ['clean:build', 'copy:build', 'useref', 'babel', 'concat', 'uglify', 'cssmin'])
    grunt.registerTask('compile', ['babel', 'sass', 'swig'])
    grunt.registerTask('server', ['browserSync', 'watch'])
    grunt.registerTask('start', ['clean:dev', 'compile', 'server'])
    grunt.registerTask('lint', ['eslint', 'scsslint'])
    // 如果任务名称为default 那么yarn grunt 会默认执行
    // grunt.registerTask('start', ['babel', 'copy', 'imagemin','swig'])
    // grunt.registerTask('build', ['babel', 'copy', 'imagemin','swig'])
}