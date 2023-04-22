const mongoose=require("mongoose")



const MONGO_URL =
  "mongodb+srv://NASA-Api:f8FIYHtkouhUWAIG@cluster0.lwtxmyi.mongodb.net/nasa?retryWrites=true&w=majority";


mongoose.connection.once('open',()=>{ //once es lo mismo que on pero
    // solo se ejecuta una vez
    console.log('Mongo server started!')
 });
 
 mongoose.connection.on('error',(err)=>{
    console.error(err);
 })

 async function mongoConnect(){
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
 }

 async function mongoDisconnect(){
    await mongoose.disconnect();
 }

 module.exports={
    mongoConnect,
    mongoDisconnect
 }