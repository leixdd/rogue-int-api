import server from './express/server';

const denv = require('dotenv').config(); 
const port = process.env.PORT || 3000 //process.env.NODE_ENV === 'production' ? 6069 : 3000;



server.listen(port, () => console.log("listening at " + port))
