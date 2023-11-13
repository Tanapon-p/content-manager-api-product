const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");
const getResources = () => JSON.parse(fs.readFileSync(pathToFile));
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World");
});

////////// GET BY ID //////////
app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resource = resources.find((resource) => resource.id === id);
  res.send(resource);
});

////////// PATCH BY ID //////////

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  if (resources[index].status === "complete") {
    return res
      .status(422)
      .send("Cannot update because resource has been completed!");
  }

  resources[index] = req.body;

  // active resource related functionality
  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is active resource already!");
    }

    resources[index].status = "active";
    resources[index].activationTime = new Date();
  }
  // active resource related functionality

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }
    return res.send("Data has been updated!");
  });
});

////////// GET ACTIVERESOURCE //////////
app.get("/api/activeresource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );
  res.send(activeResource);
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
});

////////// POST //////////
app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();
  resources.unshift(resource);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }

    return res.send("Data has been saved!");
  });
});

////////// DELETE //////////
app.delete("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);

  if (index === -1) {
    return res.status(404).send("Resource not found");
  }

  resources.splice(index, 1);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot delete the resource.");
    }

    return res.send("Resource has been deleted successfully.");
  });
});

app.listen(PORT, () => {
  console.log("Server is listening on port:" + PORT);
});
