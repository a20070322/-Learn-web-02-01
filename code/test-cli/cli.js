#!/usr/bin/env node

console.log('cli working')

const path = require("path")
const fs = require("fs")
// 通过命令行交互询问
// yarn add inquirer
const inquirer = require("inquirer")
// 安装模板引擎
const ejs = require("ejs")
inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: "Project name?"
    },
    {
        name: 'theme',
        message: "select theme",
        type: 'list',
        choices: [
            "red",
            "yellow",
        ]
    }
]).then(anwsers => {
    // console.log(anwsers)
    console.log('🔨🔨🔨 start building 🔨🔨🔨')
    //模板目录
    const tmplDir = path.join(__dirname, 'templates')
    // 目标目录
    const destDir = process.cwd()
    const filesList = getFilesList(tmplDir)
    filesList.forEach(file => {
        const {
            filedir,
            filePath
        } = file
        ejs.renderFile(filedir, anwsers, async (err, res) => {
            if (err) throw err
            const dir = filedir.replace(path.join(__dirname, 'templates'), '')
            const _filedir = path.join(destDir,dir)
            const _filePath = path.join(destDir, filePath.replace(path.join(__dirname, 'templates'), ''))
            mkdirsSync(_filePath)
            fs.writeFileSync(_filedir, res)
            console.log(`🔨 buding ${dir}`)
        })
    });
    console.log('🔨🔨🔨 end  building  🔨🔨🔨')
})

// 递归获取文件列表
function getFilesList(filePath) {
    let filesList = []
    const files = fs.readdirSync(filePath)
    for (let filename of files) {
        const filedir = path.join(filePath, filename);
        const stats = fs.statSync(filedir)
        if (stats.isFile()) {
            filedir.includes('.DS_Store') || filesList.push({
                filedir,
                filePath
            })
        }
        if (stats.isDirectory()) {
            filesList = [...filesList, ...getFilesList(filedir)]
        }
    }
    return filesList
}

// 同步递归创建文件夹
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}