
import express, {Request, Response, Express} from 'express'
import api from '../router'
import serverless from 'serverless-http'
import { json } from 'body-parser'
import cookieParser from 'cookie-parser';
import cors from 'cors';

const denv = require('dotenv').config(); 
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));


app.use(json());
app.use(cookieParser());
app.use('/api/v1', api)
app.get('*', (req: Request, res: Response) => {
    res.send("api error");
})

app.set("handler", serverless(app))


export default app
