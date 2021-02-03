const proxy = require('http-proxy-middleware');

// module.exports = function(app) {
//   app.use(
//     proxy('/manage/**', {
//     target: 'http://47.103.130.78:9999',
//     changeOrigin: true,
//     pathRewrite: {
//       '^/manage': 'manage'
//     }
//    })
//   );
// };

// module.exports = function (app) {
//
//     app.use(
//         proxy('/manage/**', {
//             target: 'https://testapi.naviguy.com:3344',
//             changeOrigin: true,
//             pathRewrite: {
//                 '^/manage': 'manage'
//             }
//         }),
//         proxy('/usermanage/**', {
//           target: 'https://testapi.naviguy.com:3344',
//           changeOrigin: true,
//           pathRewrite: {
//             '^/usermanage': 'usermanage'
//           }
//         }),
//     );
//
// };

module.exports = function (app) {

    app.use(
        proxy('/manage/**', {
            target: 'https://naviguy.ciie.org',
            changeOrigin: true,
            pathRewrite: {
                '^/manage': 'manage'
            }
        }),
        proxy('/usermanage/**', {
            target: 'https://naviguy.ciie.org',
            changeOrigin: true,
            pathRewrite: {
                '^/usermanage': 'usermanage'
            }
        }),
    );

};
