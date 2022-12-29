let express = require('express');
let app = express();
let dotenv = require('dotenv');
dotenv.config()
let port = process.env.PORT || 7800;
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let mongoUrl = process.env.LiveMongo;
let cors = require('cors')
let bodyParser = require('body-parser')
let db;

//middleware
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())


app.get('/',(req,res) => {
    res.send('Hii from Express')
})

app.get('/viewItemDetails',  (request, response)=> {
    if (db) {
        db.collection('products').find().toArray( (error, result) =>{
            if (error) {
                response.send({
                    message: 'not found!',
                    status: 404
                });
            } else {

                response.send({ status: 200, message: "item details retrieved successfully", data: result })
            }
        })
    } else {
        response.send({
            message: 'Db connection error!',
            status: 500
        });
    }
})

app.get('/category_id',(req,res)=>{
    let categoryId = Number(req.query.categoryId);
    let prodId = Number(req.query.prodId)
    let query = {}
    if(categoryId){
        query = {category_id:categoryId}
    }else if(prodId){
        query = {"itemTypes.type_id":prodId}
    }else{
        query = {}
    }
    db.collection('products').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

app.get('/filter/:productId',(req,res) => {
    let query = {};
    let sort = {cost:1};
    let categoryId=Number(req.params.Categoryid);
    let productId = Number(req.params.productid);
    let type = Number(req.query.typeId);
    let lcost = Number(req.query.lcost);
    let hcost = Number(req.query.hcost);

    if(req.query.sort){
        sort={cost:req.query.sort}
    }

    if(hcost && lcost && categoryId){
        query={
            "itemTypes.type_id":productId,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    else if(hcost && lcost){
        query={
            "itemTypes.type_id":productId,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    else if(categoryId){
        query={
            "itemTypes.type_id":productId,
            "category.category_id":categoryId
        }
    }else{
        query={
            "itemTypes.type_id":productId
        }
    }
    db.collection('products').find(query).sort(sort).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

app.get('/menu/:id',(req,res)=>{
    let id = Number(req.params.id)
    db.collection('menu').find({restaurant_id:id}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})



// list of mealType
app.get('/mealType',(req,res)=>{
    db.collection('mealType').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

// order
app.get('/orders',(req,res)=>{
    //let email = req.query.email
    let email = req.query.email;
    let query = {}
    if(email){
        //query={email:email}
        query={email}
    }else{
        query={}
    }
    db.collection('orders').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})
app.get('/orders',(req,res)=>{
    //let email = req.query.email
    let email = req.query.email;
    let query = {}
    if(email){
        //query={email:email}
        query={email}
    }else{
        query={}
    }
    db.collection('orders').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//placeorder
app.post('/menuItem',(req,res) => {
    if(Array.isArray(req.body.id)){
        db.collection('menu').find({menu_id:{$in:req.body.id}}).toArray((err,result) => {
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Invalid Input')
    }
    
})

//updateOrder
app.put('/updateOrder/:id',(req,res) => {
    let oid = Number(req.params.id);
    db.collection('orders').updateOne(
        {id:oid},
        {
            $set:{
                "status":req.body.status,
                "bank_name":req.body.bank_name,
                "date":req.body.date
            }
        },(err,result) => {
            if(err) throw err;
            res.send('Order Updated')
        }
    )
})


//deleteOrder
app.delete('/deleteOrder/:id',(req,res) => {
    let _id = mongo.ObjectId(req.params.id);
    db.collection('orders').remove({_id},(err,result) => {
        if(err) throw err;
        res.send('Order Deleted')
    })
})


//connection with db
MongoClient.connect(mongoUrl,(err,client) => {
    if(err) console.log('Error while connecting');
    db = client.db('AP');
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`)
    })

})


