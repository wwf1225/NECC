const {override, addLessLoader} = require('customize-cra');
const packageJson = require('./package.json');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === "production";

// source map
process.env.GENERATE_SOURCEMAP = 'false';
// dev server port
process.env.PORT = 9090;

// 应用版本号
process.env.REACT_APP_APP_VERSION = packageJson.version;
// 生成版本对比文件
isProduction && generateBuildingFile(packageJson.version);

module.exports = override(
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {},
        localIdentName: isProduction ? '[local]-[hash:base64:6]' : undefined
    })
);

function generateBuildingFile(version) {
    fs.writeFileSync('./public/build.json', JSON.stringify({
        code: '000',
        data: {
            time: new Date().toLocaleString(),
            version: version
        }
    }));
}
