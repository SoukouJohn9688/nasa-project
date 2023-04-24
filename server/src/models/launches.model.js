const axios = require("axios");
const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

//const launches=new Map(); Deprecated for my project , we are now using mongoDB

const DEFAULT_FLIGHT_NUMBER = 100;

// const launch = {
//   flightNumber: 100,
//   mission: "Kepler bastard exploration X",
//   rocket: "Explorer IS1", //rocket.name
//   launchDate: new Date("December 27, 2030"), //date_local
//   target: "Kepler-442 b", //not applicable
//   customers: ["Yo", "Tu"], //payload.customers for each payload
//   upcoming: true, //upcoming
//   success: true, //success
// };
// saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";


async function populateLaunches(){
  console.log("Donwloading data from Spacex API...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination:false, // to take out the limit on paginated responses that we get fron spacex api
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customer: 1,
          },
        },
      ],
    },
  });

  if (response.status!==200){
    console.log('Problem downloading launch data');
    throw new console.Error('Launch data download failed.');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      succes: launchDoc["success"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    // To DO: populate launches collection
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {

  const firstLaunch=await findLaunch({
    flightNumber:1,
    rocket:'Falcon 1',
    mission:'FalconSat',
  });

  if (firstLaunch){
    console.log('Data has already loaded');
  }else{
    await populateLaunches();
  }

 
}

//launches.set(launch.flightNumber,launch);

async function getAllLaunches(skip,limit) {
  //return Array.from(launches.values());
  return await launchesDatabase
  
  .find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  ).sort({flightNumber:1}) // -1 for descending, 1 for ascending
  .limit(limit) // limit 50 docs 
  .skip(skip); // skips 20 pages
  
  
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function saveLaunch(launch) {
  

  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function findLaunch(filter){
  return await launchesDatabase.findOne(filter)
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function scheduleNewLaunch(launch) {

  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Hitler", "Space-X"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch){
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch,{
//             success:true,
//             upcoming:true,
//             customers:['Yo',"SPACE X"],
//             flightNumber:latestFlightNumber,
//         })
//     )
//}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.ok === 1 && aborted.nModified === 1; // filtramos para que solo
  //muestre ok y nModified en la respuesta del request DELETE para claridad
  // const aborted=launches.get(launchId)
  // aborted.upcoming=false;
  // aborted.success=false;
  // return aborted;
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  loadLaunchData
};
