const mongoCleint = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer();
let router = express.Router();
const fs = require("fs");
var request = require("request");
const bodyParser = require("body-parser");
const path = require("path");
let url =
  "mongodb+srv://zizoBoy:741852@islam-data.iovdiwe.mongodb.net/all-data?retryWrites=true&w=majority";
let url2 =
  "mongodb+srv://abdelazizelhor:COr5wnnV0v4HSOGd@chat.d3kycik.mongodb.net/?retryWrites=true&w=majority";

const { Server } = require("socket.io");
const { createServer } = require("node:http");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let client = new mongoCleint(url, {
  family: 4,
});
const uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function cleanupOldFiles() {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return;
    }

    const now = Date.now();
    const expirationTime = 20 * 24 * 60 * 60 * 1000; // 20 days in milliseconds

    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return;
        }

        // Check if the file is older than 20 days
        if (now - stats.mtimeMs > expirationTime) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log(`Deleted old file: ${file}`);
            }
          });
        }
      });
    });
  });
}

// Schedule the cleanup to run once a day (86400000 milliseconds)
setInterval(cleanupOldFiles, 86400000);

var id2 = "";
io.on("connection", (socket) => {
  socket.on("UserConneected", (id) => {
    socket.id = id;
    id2 = id;
    client
      .connect()
      .then((client) => {
        let db = client.db("chat");
        db.collection(`chat-zad-all-Users`)
          .updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                status: "online",
              },
            }
          )
          .catch((err) => {});
        io.sockets.emit("UsersChange", id);
      })
      .catch((err) => {});
  });

  socket.on("UserId", (id) => {
    socket.id = id;
    id2 = id;
    client
      .connect()
      .then((client) => {
        let db = client.db("chat");
        db.collection(`chat-chat-All-users`)
          .updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                status: "online",
              },
            }
          )
          .catch((err) => {});
        io.sockets.emit("UsersChange", id);
      })
      .catch((err) => {});
  });
  socket.on("chat", (msg) => {
    const all = msg;
    if (all.chatId)
      client
        .connect()
        .then((client) => {
          let db = client.db("chat");
          db.collection(`chat-${all.chatId}`)
            .insertOne(all.msg)
            .catch((err) => {});
        })
        .catch((err) => {});
    io.sockets.emit("chat", msg);
  });

  socket.on("disconnect", (e) => {
    client
      .connect()
      .then((client) => {
        let db = client.db("chat");
        db.collection("chat-zad-all-Users")
          .findOne({
            _id: new ObjectId(socket.id),
          })
          .then((e) => {
            if (e)
              db.collection(`chat-zad-all-Users`)
                .updateOne(
                  { _id: new ObjectId(socket.id) },
                  {
                    $set: {
                      status: "offline",
                      inDate: new Date(),
                    },
                  }
                )
                .catch((err) => {});
            else
              db.collection(`chat-chat-All-users`)
                .updateOne(
                  { _id: new ObjectId(socket.id) },
                  {
                    $set: {
                      status: "offline",
                      inDate: new Date(),
                    },
                  }
                )
                .catch((err) => {});
            io.sockets.emit("UsersChange", id2);
          });
      })
      .catch((err) => {});
  });
});

app.use(bodyParser.json({ limit: "60mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  next();
});
app.use(router);
app.get("/get", upload.array(), (req, res) => {
  client
    .connect()
    .then((client) => {
      let db = client.db("chat");
      db.collection("chat")
        .find({})
        .toArray()
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {});
    })
    .catch((err) => {});
});
app.get("/get/:id", upload.array(), (req, res) => {
  let id = req.params.id;
  client
    .connect()
    .then((client) => {
      let db = client.db("chat");
      db.collection(`chat-${id}`)
        .find({})
        .toArray()
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {});
    })
    .catch((err) => {});
});
router.post("/add", (req, res, next) => {
  const all = req.body;
  client
    .connect()
    .then((client) => {
      let db = client.db("chat");

      db.collection("chat")
        .insertOne(all)
        .catch((err) => {});
    })
    .catch((err) => {});
});

router.post("/add/:id", (req, res, next) => {
  let id = req.params.id;
  const all = req.body;
  client
    .connect()
    .then((client) => {
      let db = client.db("chat");
      db.collection(`chat-${id}`)
        .insertOne(all)
        .catch((err) => {})
        .then((e) => {
          res.json(e);
        });
    })
    .catch((err) => {});
});

router.post("/update/:chatId/:id", (req, res, next) => {
  let id = req.params.id;
  let chatId = req.params.chatId;
  const all = req.body;
  client
    .connect()
    .then((client) => {
      let db = client.db("chat");
      db.collection(`chat-${chatId}`)
        .updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              ...all,
            },
          }
        )

        .catch((err) => {});
    })
    .catch((err) => {})
    .finally(() => {
      res.json(all);
    });
});

router.use("/delete/:chatId/:id", (req, res, next) => {
  let id = req.params.id;
  let chatId = req.params.chatId;
  client
    .connect()
    .then((client) => {
      let db = client.db("chat");
      db.collection(`chat-${chatId}`)
        .deleteOne({ _id: new ObjectId(id) })
        .catch((err) => {});
    })
    .catch((err) => {})
    .finally(() => {
      res.json({ id: req.params.id });
    });
});

router.post("/upload-screenshot/:name", (req, res) => {
  let name = req.params.name;
  const imageData = req.body.image;

  // Remove the "data:image/png;base64," part of the string
  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");

  // Create a unique filename (you can customize this logic)
  const filename = `screenshot-${name}.png`;
  const filePath = path.join(__dirname, "uploads", filename);

  // Save the image to the server
  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error saving image");
    }

    // Return the URL of the uploaded image
    const imageUrl = `/uploads/${filename}`;
    res.json({ imageUrl });
  });
});

app.use('/clear-uploads', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading uploads directory');
        }

        // Prepare an array of promises for deleting each file
        const deletePromises = files.map(file => {
            const filePath = path.join(uploadsDir, file);
            return new Promise((resolve, reject) => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });

        // Wait for all deletions to complete
        Promise.all(deletePromises)
            .then(() => {
                res.send('Uploads folder cleared successfully');
            })
            .catch(err => {
                console.error('Error deleting files:', err);
                res.status(500).send('Error clearing uploads folder');
            });
    });
});


router.post("/emitAll/:chatId", (req, res, next) => {
  let chatId = req.params.chatId;
  io.sockets.emit(chatId, req.body);
});
server.listen(process.env.PORT || 6060, () => {
  console.log("go");
  setInterval(() => {
    fetch("https://chat-cz51.onrender.com/get/chat-All-users");
  }, 50000);
});
