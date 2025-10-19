const axios = require("axios");
const jsdom = require("jsdom");
const express = require("express");
const cors = require("cors");
const { default: rateLimit } = require("express-rate-limit");
const { JSDOM } = jsdom;

const app = express();
exports.app = app;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
});
exports.limiter = limiter;

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
const getCodeChefData = async (handle) => {
  try {
    const resdata = await fetch(
      `https://www.codechef.com/users/${handle}`
    );
    if (resdata.status == 200) {

      let d = await resdata.text();
      let data = { data: d };
      let heatMapDataCursour1 =
        data.data.search("var userDailySubmissionsStats =") +
        "var userDailySubmissionsStats =".length;
      let heatMapDataCursour2 = data.data.search("'#js-heatmap") - 34;
      let heatDataString = data.data.substring(
        heatMapDataCursour1,
        heatMapDataCursour2
      );
      // console.log(heatDataString)
      let headMapData = JSON.parse(heatDataString);
      let allRating =
        data.data.search("var all_rating = ") + "var all_rating = ".length;
      let allRating2 = data.data.search("var current_user_rating =") - 6;
      let ratingData = JSON.parse(data.data.substring(allRating, allRating2));
      let dom = new JSDOM(data.data);
      let document = dom.window.document;
      return {
        success: true,
        status: resdata.status,
        profile: document.querySelector(".user-details-container").children[0]
          .children[0].src,
        name: document.querySelector(".user-details-container").children[0]
          .children[1].textContent,
        currentRating: parseInt(
          document.querySelector(".rating-number")?.textContent
        ),
        highestRating: parseInt(
          document
            .querySelector(".rating-number")?.parentNode?.children[4]?.textContent?.split("Rating")[1]
        ),
        countryFlag: document.querySelector(".user-country-flag").src,
        countryName: document.querySelector(".user-country-name").textContent,
        globalRank: parseInt(
          document.querySelector(".rating-ranks")?.children[0]?.children[0]
            ?.children[0]?.children[0]?.innerHTML
        ),
        countryRank: parseInt(
          document.querySelector(".rating-ranks")?.children[0]?.children[1]
            ?.children[0]?.children[0]?.innerHTML
        ),
        stars: document.querySelector(".rating")?.textContent || "unrated",
        heatMap: headMapData,
        ratingData,
      };
    }
    else {
      return { success: false, status: resdata.status }
    }
  } catch (e) {
    console.log(e)
    return { success: false, status: 404 }
  }
}

 

 
