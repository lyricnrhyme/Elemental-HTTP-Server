const http = require('http');
const port = process.env.PORT || 8000;
const fs = require('fs')
const qs = require('querystring');
let uriArr = ['/', '/css/styles.css', '/hydrogen.html', '/helium.html'];
let nameArr = ['none', 'none', 'Hydrogen', 'Helium'];

const server = http.createServer((req, res) => {
    // console.log('req here ******************',req);
    if (req.method === 'POST') {
        if (req.url === '/elements') {
            
            let body = [];
            req.on('data', chunk => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body).toString();               
                let parsedBody = qs.parse(body);
                if (uriArr.filter(x => x === `/${(parsedBody.elementName).toLowerCase()}.html`).length === 0) {
                    uriArr.push(`/${(parsedBody.elementName).toLowerCase()}.html`)
                    nameArr.push(parsedBody.elementName);
                } else {
                    uriArr.splice(uriArr.indexOf(`/${(parsedBody.elementName).toLowerCase()}.html`),1,`/${(parsedBody.elementName).toLowerCase()}.html`)
                    nameArr.splice(nameArr.indexOf(parsedBody.elementName), 1, parsedBody.elementName);
                }
                console.log(uriArr, 'whereya')

                let responseBodyContents = `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <title>The Elements - ${parsedBody.elementName}</title>
                  <link rel="stylesheet" href="/css/styles.css">
                </head>
                <body>
                  <h1>${parsedBody.elementName}</h1>
                  <h2>${parsedBody.elementSymbol}</h2>
                  <h3>Atomic number ${parsedBody.elementNumber}</h3>
                  <p>${parsedBody.elementInfo}</p>
                  <p><a href="/">back</a></p>
                </body>
                </html>`;

                // let newIndex = `<!DOCTYPE html>
                // <html lang="en">
                // <head>
                //   <meta charset="UTF-8">
                //   <title>The Elements</title>
                //   <link rel="stylesheet" href="/css/styles.css">
                // </head>
                // <body>
                //   <h1>The Elements</h1>
                //   <h2>These are all the known elements.</h2>
                //   <h3>These are 2</h3>
                //   <ol>
                //     ${listElements(uriArr, nameArr)}
                //   </ol>
                // </body>
                // </html>`

                fs.writeFile(`./public/${(parsedBody.elementName).toLowerCase()}.html`, responseBodyContents, err => {
                    if (err) {
                        res.writeHead(500);
                        res.write('{"success": false }');
                        res.end()
                      } else{
                    res.writeHead(200, {'content-type': 'text/html'})
                    res.write('{"success": true }');
                    res.end();
                      }
                })
            })
        }
    }

    if (req.method === 'GET') { 
        let checkUri = uriArr.filter(x => x===req.url)
        if (checkUri.length === 0) {
            fs.readFile('./public/error.html', (err,data) => {
                if (err) throw err;
                res.writeHead(200, {'content-type': 'text/html'})
                res.write(data);
                res.end();
            })
        }
        else if (req.url === '/') {
            let elemHTML = ``
            let listElements = (uri, name) => {
            for (var i=2; i<uri.length; i++){
                elemHTML += `<li>
                <a href="${uri[i]}">${name[i]}</a>
                </li>`;
            };
            return elemHTML;
        }
            let newIndex = `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <title>The Elements</title>
                  <link rel="stylesheet" href="/css/styles.css">
                </head>
                <body>
                  <h1>The Elements</h1>
                  <h2>These are all the known elements.</h2>
                  <h3>These are ${uriArr.length-2}</h3>
                  <ol>
                    ${listElements(uriArr, nameArr)}
                  </ol>
                </body>
                </html>`
            // fs.readFile('./public/index.html', (err, data) => {
                    res.writeHead(200, {'content-type': 'text/html'})
                    res.write(newIndex);
                    res.end();
            // })
        }
        else if (req.url === '/css/styles.css') {
            fs.readFile('./public/css/styles.css', (err, data) => {
                if (err) throw err;
       
                    res.writeHead(200, {'content-type': 'text/css'})
                    res.write(data);
                    res.end();
                
            })
        }
        else if (`./public/${req.url}`) {
            fs.readFile(`./public/${req.url}`, (err, data) => {
                if (err) throw err;
                    res.writeHead(200, {'content-type': 'text/html'});
                    res.write(data);
                    res.end();
            })
        }
    }
})


server.listen(port, () => {
    console.log('Server on ', port);
})