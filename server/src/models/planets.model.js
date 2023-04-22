const {parse}=require("csv-parse");
const path=require('path')
const fs=require('fs');

const planets=require('./planets.mongo')

//const habitablePlanets=[]

function isHabitablePlanet(planet){
   return planet['koi_disposition']==='CONFIRMED' 
   && planet['koi_insol']>0.36 && planet['koi_insol']<1.11
   && planet['koi_prad']<1.6;
}


function loadPlanetsData(){
   return new Promise((resolve,reject)=>{
    fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
    .pipe(parse({
         comment:'#',
         columns:true
    }))
    .on('data',async (data)=>{
    
        if(isHabitablePlanet(data)){

            //insert+update=upsert
            // so we will not insert again if it already exists to avoid issues
            //with multiple mongoDB instances running in cluster

            //habitablePlanets.push(data);
          savePlanet(data);
        }
        
    })
    .on('error',(err)=>{
        console.log(err);
        reject(err);
    })
    .on('end',async ()=>{
        //console.log(`${habitablePlanets.length} habitable planets found!`)
        const countPlanetsFound=(await getAllPlanets()).length
        console.log(`${countPlanetsFound} habitable planets found!`)
        console.log('Gracias por usarme <3 ')
        resolve()
    })
   }) 
}

async function getAllPlanets(){
    //return habitablePlanets;
    
    return await planets.find({},{
        '_id':0, '__v':0,
    }) // with the second argument json object we filter the fields we dont want to retrieve
}

async function savePlanet(planet){
    
    try{
        await planets.updateOne({
            keplerName:planet.kepler_name,
        },{
            keplerName:planet.kepler_name
        },{
            upsert:true,
        })
    }catch(err){
        console.error(`Could not save planet dataL: ${err}`)
    }
    

}


module.exports={
    loadPlanetsData,
    getAllPlanets
};