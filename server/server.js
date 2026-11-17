import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.resolve(process.env.TRIPMATE_DATA_FILE || path.join(__dirname, 'data', 'db.json'));
const clientBuildPath = path.resolve(__dirname, '..', 'client', 'dist');
export const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
const photos = {
 Manali:'photo-1626621341517-bbf3d9990a23', Goa:'photo-1512343879784-a960bf40e7f2', Jaipur:'photo-1599661046827-dacff0c0f09a', Udaipur:'photo-1590050752117-238cb0fb12b1', Rishikesh:'photo-1501785888041-af3ef285b470', Kashmir:'photo-1566837497312-7be7830ae9b1', Kerala:'photo-1602216056096-3b40cc0c9944', Shimla:'photo-1597074866923-dc0589150358', Bali:'photo-1537996194471-e657df975ab4', Paris:'photo-1502602898657-3e91760cbb34', Switzerland:'photo-1531366936337-7c912a4589a7', Tokyo:'photo-1540959733332-eab4deabee', Varanasi:'photo-1561361513-2d000a50f0dc', 'Leh Ladakh':'photo-1595815771614-ade9d2af43b9', Darjeeling:'photo-1544735716-392fe2489ffa', Hampi:'photo-1600100397608-f010cfa3dcca', Singapore:'photo-1525625293386-3f8f99389edd', Dubai:'photo-1512453979798-5ea266f8880c', Rome:'photo-1552832230-c0197dd311b5', London:'photo-1513635269975-59663e0ac1ad', 'New York':'photo-1496442226666-8d4d0e62e6e9', Maldives:'photo-1514282401047-d79a71a590e8', Hanoi:'photo-1509030450996-dd1a26dda07a', Queenstown:'photo-1589802829985-817e51171b92'
};
const seed = [
 ['Manali','India','Mountain','₹12,000','March–June','A Himalayan escape of pine forests, snow peaks and lively mountain cafés.',['Solang Valley','Hadimba Temple','Old Manali'],['Trek to Jogini Falls','River rafting','Rohtang Pass drive'],4500],
 ['Goa','India','Beach','₹10,000','November–February','Sunlit shores, Portuguese lanes and a laid-back coastal rhythm.',['Palolem Beach','Fontainhas','Fort Aguada'],['Sunset cruise','Water sports','Spice plantation'],4000],
 ['Jaipur','India','Culture','₹8,000','October–March','The Pink City pairs grand Rajput architecture with colourful bazaars.',['Amber Fort','Hawa Mahal','City Palace'],['Block printing','Market walk','Rooftop dinner'],3500],
 ['Udaipur','India','Culture','₹9,000','September–March','Lakeside palaces and quiet old-city lanes make Udaipur a romantic retreat.',['City Palace','Lake Pichola','Sajjangarh'],['Boat ride','Old town walk','Folk dance'],3800],
 ['Rishikesh','India','Adventure','₹7,000','September–April','Find your flow between the Ganges, yoga ashrams and Himalayan foothills.',['Laxman Jhula','Triveni Ghat','Neer Garh Falls'],['River rafting','Yoga session','Ganga aarti'],3200],
 ['Kashmir','India','Mountain','₹18,000','March–October','Alpine meadows, houseboats and mirror-still lakes in the Kashmir Valley.',['Dal Lake','Gulmarg','Pahalgam'],['Shikara ride','Gondola cable car','Meadow picnic'],6500],
 ['Kerala','India','Nature','₹14,000','October–March','A slow journey through palm-fringed backwaters, tea gardens and spice country.',['Alleppey','Munnar','Fort Kochi'],['Houseboat stay','Tea estate walk','Kathakali show'],5200],
 ['Shimla','India','Mountain','₹9,000','March–June','Colonial charm and crisp mountain air along the Himalayan ridge.',['The Ridge','Kufri','Jakhoo Temple'],['Toy train','Mall Road stroll','Apple orchard visit'],3500],
 ['Bali','Indonesia','Beach','₹45,000','April–October','Island days shaped by surf breaks, emerald rice terraces and temple rituals.',['Uluwatu Temple','Ubud','Nusa Penida'],['Surf lesson','Rice terrace walk','Sunset temple visit'],12000],
 ['Paris','France','City','₹95,000','April–June','A city of museum afternoons, neighbourhood cafés and river-lit evenings.',['Eiffel Tower','Louvre','Montmartre'],['Seine cruise','Bakery crawl','Museum day'],24000],
 ['Switzerland','Switzerland','Nature','₹1,20,000','June–September','Storybook alpine villages connected by some of the world’s best scenic trains.',['Lauterbrunnen','Lucerne','Zermatt'],['Mountain railway','Lake cruise','Alpine hike'],30000],
 ['Tokyo','Japan','City','₹85,000','March–May','A fascinating mix of neon-lit city blocks, quiet shrines and exceptional food.',['Shibuya','Asakusa','Shinjuku Gyoen'],['Sushi workshop','Shrine walk','TeamLab visit'],22000],
 ['Varanasi','India','Culture','₹6,500','October–March','Ancient riverside lanes, morning boat rides and the rituals of the Ganga.',['Dashashwamedh Ghat','Sarnath','Kashi Vishwanath Temple'],['Sunrise boat ride','Old city food walk','Evening aarti'],2500],
 ['Leh Ladakh','India','Mountain','₹18,000','June–September','High-altitude desert landscapes, clear mountain lakes and welcoming homestays.',['Pangong Lake','Nubra Valley','Thiksey Monastery'],['Khardung La drive','Monastery visit','Stargazing'],5500],
 ['Darjeeling','India','Nature','₹9,000','March–May','Tea gardens, toy-train journeys and wide Himalayan views from the hills.',['Tiger Hill','Batasia Loop','Happy Valley Tea Estate'],['Toy train ride','Tea tasting','Sunrise viewpoint'],3200],
 ['Hampi','India','Heritage','₹7,000','October–February','A remarkable landscape of boulder hills and the ruins of the Vijayanagara Empire.',['Virupaksha Temple','Vittala Temple','Hemakuta Hill'],['Cycle through ruins','Coracle ride','Sunset from Matanga Hill'],2600],
 ['Singapore','Singapore','City','₹48,000','February–April','A garden city where hawker favourites, modern architecture and green spaces meet.',['Gardens by the Bay','Marina Bay','Chinatown'],['Hawker centre crawl','Night safari','Botanic Gardens walk'],12000],
 ['Dubai','United Arab Emirates','City','₹60,000','November–March','A modern desert city with lively souks, striking skylines and easy beach days.',['Burj Khalifa','Al Fahidi','Dubai Creek'],['Desert safari','Souk visit','Creek abra ride'],15000],
 ['Rome','Italy','Culture','₹88,000','April–June','Layered history, lively piazzas and neighbourhood trattorias around every corner.',['Colosseum','Roman Forum','Trastevere'],['Evening piazza walk','Pasta class','Vatican Museums'],21000],
 ['London','United Kingdom','City','₹95,000','May–September','Royal parks, free museums and distinct neighbourhoods connected by the Tube.',['Tower Bridge','British Museum','Borough Market'],['Thames walk','Museum afternoon','Market lunch'],22000],
 ['New York','United States','City','₹1,20,000','April–June','Big-city energy, neighbourhood food and a different skyline from every borough.',['Central Park','Brooklyn Bridge','The Met'],['Ferry to Staten Island','Broadway show','Neighborhood food walk'],28000],
 ['Maldives','Maldives','Island','₹70,000','November–April','Blue lagoons, coral reefs and slow island mornings in the Indian Ocean.',['Maafushi','Baa Atoll','Malé'],['Snorkelling','Sandbank picnic','Local island visit'],18000],
 ['Hanoi','Vietnam','Food','₹28,000','October–April','Tree-lined boulevards, lakeside temples and one of Southeast Asia’s great street-food scenes.',['Hoàn Kiếm Lake','Old Quarter','Temple of Literature'],['Street-food walk','Water puppet show','Train Street visit'],8000],
 ['Queenstown','New Zealand','Adventure','₹1,10,000','December–March','Lakefront walks, alpine scenery and outdoor adventures in every direction.',['Lake Wakatipu','Glenorchy','The Remarkables'],['Gondola ride','Lake cruise','Alpine day hike'],26000]
].map(([name,country,type,budget,bestTime,description,attractions,thingsToDo,dailyCost])=>({id:name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),name,country,type,budget,bestTime,description,attractions,thingsToDo,dailyCost,photo:`https://images.unsplash.com/${photos[name]}?auto=format&fit=crop&w=1000&q=85`,accommodation:[{name:`The ${name} House`,type:'Boutique stay',price:dailyCost*1.7},{name:`${name} Garden Retreat`,type:'Guesthouse',price:dailyCost}],tips:['Book popular experiences ahead during peak season.','Carry a reusable water bottle and comfortable walking shoes.','Keep a small amount of local cash for markets and local transport.']}));

const mongoUri = process.env.MONGODB_URI;
if (process.env.NODE_ENV === 'production' && (!mongoUri || !process.env.ADMIN_PASSWORD)) {
 throw new Error('MONGODB_URI and ADMIN_PASSWORD are required in production so data persists and the demo admin is secure.');
}
let storageName = 'JSON file';
const stateSchema = new mongoose.Schema({
 key: { type: String, unique: true, default: 'primary' },
 users: { type: [mongoose.Schema.Types.Mixed], default: [] },
 trips: { type: [mongoose.Schema.Types.Mixed], default: [] },
 destinations: { type: [mongoose.Schema.Types.Mixed], default: [] },
 seedVersion: { type: Number, default: 0 }
}, { collection: 'tripmate_state', versionKey: false });
const State = mongoose.models.TripMateState || mongoose.model('TripMateState', stateSchema);
async function readDb(){
 if (mongoUri) {
  await mongoose.connect(mongoUri);
  storageName = 'MongoDB Atlas';
  const saved = await State.findOne({ key: 'primary' }).lean();
  if (saved) return { users: saved.users || [], trips: saved.trips || [], destinations: saved.destinations || [], seedVersion: saved.seedVersion || 0 };
  return { users: [], trips: [], destinations: [], seedVersion: 0 };
 }
 try{return JSON.parse(await fs.readFile(storePath,'utf8'))}catch{return {users:[],trips:[],destinations:seed}}
}
let db=await readDb();
async function save(){
 if (mongoUri) {
  await State.findOneAndUpdate({key:'primary'}, {$set:{users:db.users,trips:db.trips,destinations:db.destinations,seedVersion:db.seedVersion||0}}, {upsert:true,setDefaultsOnInsert:true});
  return;
 }
 await fs.mkdir(path.dirname(storePath),{recursive:true});await fs.writeFile(storePath,JSON.stringify(db,null,2))
}
db.users ||= [];db.trips ||= [];db.destinations ||= [];
const seedVersion=2;
if((db.seedVersion||0)<seedVersion){const ids=new Set(db.destinations.map(d=>d.id));db.destinations.push(...seed.filter(d=>!ids.has(d.id)));db.seedVersion=seedVersion;}
if(!db.users.some(u=>u.email==='admin@tripmate.local'))db.users.push({id:randomUUID(),name:'TripMate Admin',email:'admin@tripmate.local',password:await bcrypt.hash(process.env.ADMIN_PASSWORD||'TripMate@2026',12),role:'admin'});
await save();
const secret=process.env.JWT_SECRET||'tripmate-development-secret-change-before-deployment';
const tokenFor=u=>jwt.sign({id:u.id,role:u.role},secret,{expiresIn:'7d'});
function auth(req,res,next){const token=req.headers.authorization?.replace(/^Bearer\s+/i,'');if(!token)return res.status(401).json({error:'Please log in to continue.'});try{req.user=jwt.verify(token,secret);next()}catch{return res.status(401).json({error:'Your session has expired. Please log in again.'})}}
const admin=(req,res,next)=>req.user.role==='admin'?next():res.status(403).json({error:'Admin access required.'});
app.get('/api/health',(req,res)=>res.json({status:'ok',storage:storageName,database:mongoUri?'MongoDB Atlas':'server/data/db.json'}));
app.get('/api/destinations',(req,res)=>res.json(db.destinations));
app.get('/api/destinations/:id',(req,res)=>{const d=db.destinations.find(x=>x.id===req.params.id);return d?res.json(d):res.status(404).json({error:'Destination not found.'})});
app.post('/api/register',async(req,res)=>{const {name,email,password}=req.body;if(!name?.trim()||!/^\S+@\S+\.\S+$/.test(email||'')||(password||'').length<8)return res.status(400).json({error:'Enter your name, a valid email, and a password of at least 8 characters.'});if(db.users.some(u=>u.email===email.toLowerCase()))return res.status(409).json({error:'An account with that email already exists.'});const user={id:randomUUID(),name:name.trim(),email:email.toLowerCase(),password:await bcrypt.hash(password,12),role:'user'};db.users.push(user);await save();res.status(201).json({token:tokenFor(user),user:{id:user.id,name:user.name,email:user.email,role:user.role}})});
app.post('/api/login',async(req,res)=>{const user=db.users.find(u=>u.email===String(req.body.email||'').toLowerCase());if(!user||!await bcrypt.compare(req.body.password||'',user.password))return res.status(401).json({error:'Email or password is incorrect.'});res.json({token:tokenFor(user),user:{id:user.id,name:user.name,email:user.email,role:user.role}})});
app.get('/api/me',auth,(req,res)=>{const u=db.users.find(u=>u.id===req.user.id);u?res.json({id:u.id,name:u.name,email:u.email,role:u.role}):res.status(401).json({error:'Account not found.'})});
app.get('/api/trips',auth,(req,res)=>res.json(db.trips.filter(t=>t.userId===req.user.id)));
app.post('/api/trips',auth,async(req,res)=>{const {title,destinationId,startDate,endDate,travelers}=req.body;if(!title?.trim()||!destinationId||!startDate||!endDate||!Number.isInteger(Number(travelers))||Number(travelers)<1)return res.status(400).json({error:'Complete the trip name, destination, travel dates and traveller count.'});if(new Date(endDate)<new Date(startDate))return res.status(400).json({error:'Return date must be on or after departure date.'});const trip={...req.body,id:randomUUID(),userId:req.user.id,title:title.trim(),travelers:Number(travelers),createdAt:new Date().toISOString()};db.trips.push(trip);await save();res.status(201).json(trip)});
app.put('/api/trips/:id',auth,async(req,res)=>{const i=db.trips.findIndex(t=>t.id===req.params.id&&t.userId===req.user.id);if(i<0)return res.status(404).json({error:'Trip not found.'});db.trips[i]={...db.trips[i],...req.body,id:db.trips[i].id,userId:req.user.id,updatedAt:new Date().toISOString()};await save();res.json(db.trips[i])});
app.delete('/api/trips/:id',auth,async(req,res)=>{const n=db.trips.length;db.trips=db.trips.filter(t=>t.id!==req.params.id||t.userId!==req.user.id);if(db.trips.length===n)return res.status(404).json({error:'Trip not found.'});await save();res.json({message:'Trip deleted.'})});
app.get('/api/admin/overview',auth,admin,(req,res)=>res.json({users:db.users.map(({id,name,email,role})=>({id,name,email,role})),trips:db.trips,destinations:db.destinations}));
app.post('/api/admin/destinations',auth,admin,async(req,res)=>{if(!req.body.name?.trim())return res.status(400).json({error:'Destination name is required.'});const d={...req.body,id:req.body.id||req.body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-')};if(db.destinations.some(x=>x.id===d.id))return res.status(409).json({error:'A destination with that ID already exists.'});db.destinations.push(d);await save();res.status(201).json(d)});
app.put('/api/admin/destinations/:id',auth,admin,async(req,res)=>{const i=db.destinations.findIndex(d=>d.id===req.params.id);if(i<0)return res.status(404).json({error:'Destination not found.'});db.destinations[i]={...db.destinations[i],...req.body,id:req.params.id};await save();res.json(db.destinations[i])});
app.delete('/api/admin/destinations/:id',auth,admin,async(req,res)=>{const n=db.destinations.length;db.destinations=db.destinations.filter(d=>d.id!==req.params.id);if(n===db.destinations.length)return res.status(404).json({error:'Destination not found.'});await save();res.json({message:'Destination deleted.'})});
app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));
const clientIndexPath = path.join(clientBuildPath, 'index.html');
const hasClientBuild = await fs.access(clientIndexPath).then(() => true).catch(() => false);
if (hasClientBuild) {
  app.use(express.static(clientBuildPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(clientIndexPath, error => { if (error) next(error); });
  });
}
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Something went wrong. Please try again.'})});
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const port = Number(process.env.PORT || process.env.TRIPMATE_API_PORT || 4011);
  const host = process.env.TRIPMATE_HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
  app.listen(port, host, () => console.log(`TripMate server listening at http://${host}:${port}`));
}
