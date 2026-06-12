import express from "express";

const app = express();


app.get("/", (req, res) => {
    res.status(200).json({
        "health": "good"
    })
})
app.listen(8000, () => {
    console.log("API Gateway running on port 8000");
})