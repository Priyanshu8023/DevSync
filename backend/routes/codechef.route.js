const cors = require("cors");
const express = require("express");
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const jsdom = require("jsdom");
const { app, limiter } = require("../utils/Codechef-API/codeChefAPI");
const { JSDOM } = jsdom;


app.use(limiter);
app.use(cors());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/static"));
app.get("/heatmap/:handle", (req, res) => {
  let theme = req.query.theme == "night" ? "night" : "day";
  res.render("heatmap", { handle: req.params.handle, theme });
});
app.get("/rating/:handle", (req, res) => {
  res.render("rating", { handle: req.params.handle });
});

//Function to fetch CodeChef user data
app.get("/handle/:handle", async (req, res) => {
  try {
    if (req.params.handle === "favicon.ico")
      res.send({ success: false, error: 'invalid handle' });
    let handle = req.params.handle;
    let resd = await getCodeChefData(handle);
    while (resd.status == 429) {
      for (let i = 0; i < 1000000; i++) { }
      resd = await fecher(handle);
    }
    res.send(resd)
  } catch (err) {
    res.send({ success: false, error: err });
  }
});


// Home route
app.get("/", (req, res) => {
  res.render("home");
  // res.status(200).send("Hi you are at right endpoint just add /handle_of_user at the end of url Github-repo(https://github.com/deepaksuthar40128/Codechef-API) Thanks for 🌟");
});

// Redirect route for convenience
app.get("/:handle", (req, res) => {
  const handle = req.params.handle;
  if (handle && handle.length && !handle.includes("."))
    res.redirect(`/handle/${handle}`);
  else
    res.send({
      success: false,
      error: `Invalid Handle ${handle}`,
    });
});