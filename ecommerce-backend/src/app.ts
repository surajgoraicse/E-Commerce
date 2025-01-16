import express from "express"


const port = 4000; 
const app = express()


app.listen(port, () => {
    console.log(`Express server is working on http://localhost:${port}`);
})