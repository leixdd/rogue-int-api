import express, { Request, Response } from 'express';
const querystring = require("querystring");
import { createWriteStream, unlinkSync, readFileSync } from 'fs';
import https from 'https';
import path from 'path';
import { IncomingHttpHeaders } from 'http2';

const router = express.Router();
const RGP = '/rint'

interface IGS {
    [key: string] : string
}

router.get(`/`, (req: Request, res: Response) => res.send("nothing to see here"));
router.get(`${RGP}`, (req: Request, res: Response) => res.send("nothing to see here"));
router.post(`${RGP}`, (req: Request, res: Response) => res.send("nothing to see here"));

router.get(`${RGP}/captcha`, async (req: Request, res: Response) => {
    const tdata = req.query.t || Date.now();
    const file = `${(Date.now())}_captcha.jpg`
    const writerx = createWriteStream(file);
    let headers: IncomingHttpHeaders = {}
    https.get({
        hostname: 'www.roguemir.com',
        path: '/captcha.php',
        headers:{
            'Content-Type': 'image/jpeg',
            'cache-control': 'no-cache'
        }
    }, (resp) => {
        headers = resp.headers;
        //check where is phpsession
        let phpsession = "";
        headers["set-cookie"]?.map(data => {
            if(data.includes("PHPSESSID")) {
                phpsession = data.replace("PHPSESSID=", "").replace("; path=/", "")
            }
        })
        resp.pipe(writerx);

        writerx.on("finish", () => {
            writerx.close()
            const path_ = path.join(__dirname + '../../../');
            const base64Image = readFileSync(file, { encoding: 'base64' });
            res.send({
                image: base64Image,
                phpsession: phpsession
            });

            unlinkSync(path_ + file);
        });
    });

});

router.post(`${RGP}/register`, (req: Request, res: Response) => {
    const { account, password, vcode, d, question, answer, password2, phpsession } = req.body;
    const request = https.request({
        hostname: 'www.roguemir.com',
        path: '/register.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'cache-control': 'no-cache',
            'Cookie': `PHPSESSID=${phpsession};`
        }
    });

    const pData = {
        account: account,
        password: password,
        vcode : vcode,
        d: d,
        question: question,
        answer: answer,
        password2: password2 
    };

    console.log(pData);
    request.write(querystring.stringify(pData))

    request.on('response', (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            console.log(data);
            let message = data.split("</br>")[0]
            let data_rt = {};
            
            if(message.includes("注册成功！！！")) {
                data_rt = {
                    success: true,
                    message: "Registered Successfully. Welcome"
                }
            }
            else {
                data_rt = {
                    success: false,
                    message: "Please check your input"
                }
            }
            res.send(data_rt);
        });
    })

    request.end();


});


export default router;
