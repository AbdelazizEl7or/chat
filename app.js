const mongoCleint = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectId
const express = require("express")
const app = express()
const multer = require('multer')
const upload = multer()
let router = express.Router()
const bodyParser = require("body-parser")
let url = "mongodb+srv://zizo--:741852@chat.npitnxe.mongodb.net/?retryWrites=true&w=majority"
let client = new mongoCleint(url, {
    family: 4,
})
app.use(bodyParser.json())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    res.setHeader("Content-Type", "application/json")
    next()
})
app.use(router)
app.get("/get", upload.array(), (req, res) => {
    client.connect().then((client) => {
        let db = client.db("chat")
        db.collection("chat").find({}).toArray().then((data) => {
            res.json(data)
        }).catch(err => {
            console.log("Erorr:" + err)
        })
    }).catch(err => {
        console.log("Erorr:" + err)
    })
})
app.get("/get/:id", upload.array(), (req, res) => {
    let id = req.params.id
    client.connect().then((client) => {
        let db = client.db("chat")
        db.collection(`chat-${id}`).find({}).toArray().then((data) => {
            res.json(data)

        }).catch(err => {
            console.log("Erorr:" + err)
        })

    }).catch(err => {
        console.log("Erorr:" + err)
    })
})
router.post("/add", (req, res, next) => {
    console.log(req.body)
    const all = req.body
    client.connect().then((client) => {
        let db = client.db("chat")


        db.collection("chat").insertOne(all)
            .catch(err => {
                console.log(err)
            })
    }).catch(err => {
        console.log("Erorr:" + err)
    })
})
router.post("/add/:id", (req, res, next) => {
    let id = req.params.id
    console.log(req.body)
    const all = req.body
    client.connect().then((client) => {
        let db = client.db("chat")


        db.collection(`chat-${id}`).insertOne(all)
            .catch(err => {
                console.log(err)
            })
    }).catch(err => {
        console.log("Erorr:" + err)
    })
})
router.delete("/delete/:id1/:id", (req, res, next) => {
    console.log(req.body)
    const all = req.body
    client.connect().then((client) => {
        let db = client.db("chat")


        db.collection(`chat-${req.params.id1}`).deleteOne({ _id: ObjectId(req.params.id) })
            .catch(err => {
                console.log(err)
            })
    }).catch(err => {
        console.log("Erorr:" + err)
    })
    res.json({ ok: true })
})
router.delete("/delete/:id", (req, res, next) => {
    console.log(req.body)
    const all = req.body
    client.connect().then((client) => {
        let db = client.db("chat")


        db.collection(`chat`).deleteOne({ _id: ObjectId(req.params.id) })
            .catch(err => {
                console.log(err)
            })
    }).catch(err => {
        console.log("Erorr:" + err)
    })
    res.json({ ok: true })
})
app.listen(process.env.PORT || 6060, () => {
    console.log("go")
})