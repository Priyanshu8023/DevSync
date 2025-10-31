const cron = require("node-cron");
const CodeChef = require("../models/CodeChef")
const axios = require("axios");

const batchLimit = 50; // number users should update for the each hour

const runCodeChefbatchUpdate = async () => {
  try {
    console.log("Starting batch update for CodeChef users...");

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const usersToUpdate = await CodeChef.find({
      lastUpdated: { $lt: sixHoursAgo },
    }).limit(batchLimit);

    const totalUsers = usersToUpdate.length;

    if(totalUsers === 0) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const user of usersToUpdate) {
      try{
        await updateUserCodeChefProfile(user.username)
        successCount++;
      }catch(err){
        console.error(`Failed to Update user ${user.username}`)
        failCount++;
      }
    }

    console.log(`Summary: Total: ${totalUsers}, Successfuly update: ${successCount}, Failed: ${failCount}`);
  }catch(err){
    console.log(`Error in batch Update`,err);
  }
};

runCodeChefbatchUpdate();

cron.schedule('0 * * * *', runCodeChefbatchUpdate);//execute on each hour

const updateUserCodeChefProfile = async (username) =>{
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