const express = require("express");
const app = express();
const http = require("http");
const axios = require("axios").default;
require("dotenv").config();

const instance1 = `http://${process.env.INSTANCE_1}`;
const instance2 = `http://${process.env.INSTANCE_2}`;
const API_KEY = process.env.API_KEY;

const code_execution = (req, res) => {
  const { secret_key } = req.params;
  const { type, data, intanceChoice } = req.body;

  console.log(instance1);
  console.log(instance2);
  console.log(API_KEY);

  if (secret_key === API_KEY) {
    let instance = "";
    switch (type) {
      case "submissions":
        const { source_code, language_id } = data;
        try {
          if (intanceChoice === 1) instance = instance1;
          else instance = instance2;

          return axios({
            url: `${instance}/submissions`,
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            data: JSON.stringify({ source_code, language_id }),
          })
            .then((response) => {
              return res.status(200).json({ token: response.data.token });
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (error) {
          console.log(error);
        }
        break;
      case "fetchResult":
        try {
          if (intanceChoice === 1) instance = instance1;
          else instance = instance2;
          const { token } = data;

          return axios({
            url: `${instance}/submissions/${token}`,
            method: "GET",
          })
            .then((response) => {
              return res.status(200).json(response.data);
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (error) {
          console.log(error);
        }
        break;
    }
  } else {
    res.status(401).json({ message: "ACCESS DENIED" });
    console.log(
      "ACCESS DENIED----------------------------------------->>>",
      req
    );
  }
};

const router = express.Router();
router.post("/code_execution/:secret_key", code_execution);

const PORT = 8080;

async function server(app) {
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  app.use("/api", router);
  app.set("port", PORT);
  const server = http.createServer(app);

  server.listen(PORT);

  server.on("listening", () => {
    console.log(`🚀  Server is listening on port ${PORT}`);
    console.log();
  });

  process.on("SIGINT", () => {
    process.exit(0);
  });
}

server(app).catch((err) => console.log(err));
