import express, { Request, Response } from "express"

const app = express()
app.get('/', (req: Request, res: Response) => {
    return res.send('API healthyv1')
})

app.listen(3000, () => {
    console.log("Running on port 3000");
})