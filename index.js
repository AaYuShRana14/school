const express=require('express');
const app=express();
const {PrismaClient}=require('@prisma/client');
const prisma=new PrismaClient();
const {z}=require('zod');
const cors = require('cors');
app.use(cors());
app.use(express.json());
const schooldata=z.object({
    name:z.string(),
    address:z.string(),
    latitude:z.number(),
    longitude:z.number()
})
app.post('/addSchool',async(req,res)=>{
    try{
        const data=schooldata.safeParse(req.body);
        if(!data){
            return res.status(403).json({msg:"Invalid data"});
        }
        const {name,address,latitude,longitude}=data.data;
        const school=await prisma.school.create({
            data:{
                name,
                address,
                latitude,
                longitude
            }
        });
        return res.status(201).json({msg:"School created",school})
    }
    catch(e){
        console.log(e);
        return res.status(500).json({msg:"error"})
    }
    
})
app.get('/listSchools',async(req,res)=>{
    try{
        const latitude = parseFloat(req.query.latitude);
        const longitude = parseFloat(req.query.longitude);
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({msg:"latitude longitude not found"});
        }
        const haversineDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a =Math.sin(dLat / 2) * Math.sin(dLat / 2) +Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; 
          };
        const schools=await prisma.school.findMany();
        const sortedorder=schools.map((school)=>(
            {
                ...school,
                distance:haversineDistance(latitude,longitude,school.latitude,school.longitude)
            }
        )).sort((a,b)=>(a.distance-b.distance))
        return res.status(200).json({sortedorder});
    }
    catch(e){
        console.log(e);
        return res.status(500).json({msg:"error"})
    }

})
app.listen(3000,()=>{
    console.log("Server started at 3000");
})