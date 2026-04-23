const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

let mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(mongo_url);
}

main()
.then(() => {
    console.log("Connected TO DB");
})
.catch((err) => {
    console.log(err);
});

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj, owner:"69e10b68cb265b880ec07c41"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();