import { connectionDB } from "../database/db.js";
import dayjs from 'dayjs';
import birthdaySchema from "../schemas/birthdaySchema.js";

export async function createCategorie(req,res){
  const { name } = req.body;
  try {
    const {rows} = await connectionDB.query("SELECT * FROM categories;")

    if(name.length === 0){
      res.sendStatus(400)
      return
    }
    for(let i=0; i< rows.length;i++ ){
      if(rows[i].name.includes(name)){
        console.log('contem')
        res.sendStatus(409)
        return
      }
    }
    await connectionDB.query(
      "INSERT INTO categories (name) VALUES ($1);",
      [name]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function findCategories(req, res) {
  try {
    const { rows } = await connectionDB.query("SELECT * FROM categories;");
    console.table(rows)
    res.send(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}



export async function createGame(req,res){
  const { name,stockTotal,pricePerDay,image,categoryId } = req.body;

  try {
    const {rows} = await connectionDB.query("SELECT * FROM games;")
    const categoriesId = await connectionDB.query("SELECT * FROM categories WHERE id=$1",[categoryId])
    if(name.length === 0 ||stockTotal<=0||pricePerDay<=0||categoriesId.rows[0].name.length ===0 ){
      res.sendStatus(400)
      return
    }
    for(let i=0; i< rows.length;i++ ){
      if(rows[i].name.includes(name)){
        console.log('contem game')
        res.sendStatus(409)
        return
      }
    }
    await connectionDB.query(
      'INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1, $2, $3, $4, $5);',
      [name,image,stockTotal,categoryId,pricePerDay]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function findGames(req,res){
  const {name}= req.query
  console.log(name)
  try {
    const { rows } = await connectionDB.query('SELECT games.*,categories.name as "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id;');
    if(name){
      const  gameE  = await connectionDB.query(`SELECT games.*,categories.name as "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id WHERE LOWER (games.name) LIKE LOWER('%${name}%');`);
      console.log(gameE.rows)
      if(gameE.rows.length!==0){
        console.table(gameE.rows)
        res.send(gameE.rows)
        return
      }
      else{
        res.send(gameE.rows)
        return
      }
    }
    console.table(rows)
    res.send(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}



export async function findCustomers(req,res){
  const {cpf}= req.query
  console.log(cpf)
  try {
    const { rows } = await connectionDB.query("SELECT * FROM customers;");
    if(cpf){
      const  cpfE  = await connectionDB.query(`SELECT * FROM customers WHERE cpf LIKE '${cpf}%';`);
      console.table(cpfE.rows)
      if(cpfE.rows.length!==0){
        res.send(cpfE.rows)
        return
      }
    }
    res.send(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function findCustomersById(req, res) {
  const { id } = req.params;
  console.log(id )
  try {
    const { rows } = await connectionDB.query(
      "SELECT * FROM customers WHERE id=$1;",
      [id ]
    );

    if (rows.length === 0) {
      res.status(404).send("Não existe ninguem registrado com esse id");
    }

    res.send(rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function createCustomer(req,res){
  const { name,phone,cpf,birthday } = req.body;
  const user = req.body
  console.log(user)
  try {
    const { error,value } = birthdaySchema.validate(user, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      console.log(value)
      return res.status(400).send(errors);
    }
    const {rows} = await connectionDB.query("SELECT * FROM customers;")
    for(let i=0; i< rows.length;i++ ){
      if(rows[i].cpf.includes(cpf)){
        console.log('contem')
        res.sendStatus(409)
        return
      }
    }

    await connectionDB.query(
      "INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4);",
      [name,phone,cpf,birthday]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function updateCustomer(req, res) {
  const user = req.body;
  const { id } = req.params;
  console.log(user)
  try {
    const { error,value } = birthdaySchema.validate(user, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      console.log(value)
      return res.status(400).send(errors);
    }

    const {rows} = await connectionDB.query("SELECT * FROM customers WHERE id = $1;",[id])
    console.table(rows)
    console.log(user.cpf.toString()===rows[0].cpf)
    
    if(user.cpf.toString()===rows[0].cpf){
      await connectionDB.query(
        "UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5",
        [user.name, user.phone, user.cpf, user.birthday, id]
      );
      res.sendStatus(200);
      return
    }

    const allUsers = await connectionDB.query("SELECT * FROM customers")
    for(let i=0; i< allUsers.rows.length;i++ ){
      if(allUsers.rows[i].cpf.includes(user.cpf)){
        console.log('contem')
        res.sendStatus(409)
        return
      }
    }


    await connectionDB.query(
      "UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5",
      [user.name, user.phone, user.cpf, user.birthday, id]
    );
    res.sendStatus(200);

  } catch (err) {
    res.status(500).send(err.message);
  }
}


export async function findRentals(req,res){
  const {gameId,customerId}= req.query
  console.log(gameId)
  try {
    const { rows } = await connectionDB.query(`SELECT  
    rentals.*,json_build_object('id',games.id,'name',games.name,'categoryId',games."categoryId",'categoryName',categories.name) AS game, 
    JSON_BUILD_OBJECT ('id',customers.id,'name',customers.name ) AS customer
     FROM rentals INNER JOIN games ON rentals."gameId" = games.id JOIN categories ON games."categoryId" = categories.id 
     JOIN customers ON rentals."customerId" = customers.id;`);
    console.table(rows[0].game.id)
    if(gameId){
      const  gameIdE  = await connectionDB.query(`SELECT rentals.*,
      json_build_object('id',games.id,'name',games.name) AS game FROM rentals 
      INNER JOIN games ON rentals."gameId" = games.id
      WHERE games.id = ${gameId};`);
        res.send(gameIdE.rows)
        return
      
    }
    if(customerId){
      const customerIdE  = await connectionDB.query(`SELECT rentals.*,
json_build_object('id',customers.id,'name',customers.name) AS customer,
      json_build_object('id',games.id,'name',games.name) AS game FROM rentals 
      INNER JOIN customers ON rentals."customerId" = customers.id INNER JOIN games ON rentals."gameId" = games.id
      WHERE customers.id = ${customerId};`);
        res.send(customerIdE.rows)
        return

    }
    res.send(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function createRental(req,res){
  const {customerId,gameId,daysRented} = req.body
  const timeElapsed = Date.now();
  const rentDate = new Date(timeElapsed).toLocaleDateString();
  console.log(rentDate)
  try {
    const {rows} = await connectionDB.query('SELECT * FROM rentals WHERE "gameId"=$1;',[gameId])
    console.log('alugueis deste jogo',rows.length)
    const gamesId = await connectionDB.query(`SELECT * FROM games WHERE id ='${gameId}';`)
    console.log('stock',gamesId.rows[0].stockTotal)
    const idCustomer = await connectionDB.query(`SELECT * FROM customers WHERE id ='${customerId}';`)
    console.log(idCustomer.rows.length)

    if(rows.length+1>gamesId.rows[0].stockTotal){
      console.log('unidades de jogo insuficientes')
      res.sendStatus(400)
      return
    }
    if(daysRented<=0){
      console.log('dias insuficientes')
      res.sendStatus(400)
      return
    }
    if(idCustomer.rows.length===0){
      console.log('id customer nao encontrado')
      res.sendStatus(400)
      return
    }
    if(gamesId.rows.length===0){
      console.log('id game nao encontrado')
      res.sendStatus(400)
      return
    }
    const originalPrice = gamesId.rows[0].pricePerDay*daysRented
    await connectionDB.query(
      'INSERT INTO rentals ("customerId","gameId","daysRented","rentDate","originalPrice","returnDate","delayFee") VALUES ($1, $2, $3, $4, $5,$6,$7);',
      [customerId,gameId,daysRented,rentDate,originalPrice,null,null]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }

}

export async function finishRental(req,res){
  const {id} = req.params
  let delayFee = null
  try{
    const {rows} = await connectionDB.query('SELECT * FROM rentals WHERE "id"=$1;',[id])
    if(rows.length===0 ||rows[0].returnDate !== null ){
      res.sendStatus(400)
      return
    }
    console.log(rows)
    const timeElapsed = Date.now();
    const returnDate = new Date(timeElapsed).toLocaleDateString().split("/")
    const dateRented = rows[0].rentDate.toLocaleDateString().split("/")

    if(returnDate[0]-dateRented[0]>rows[0].daysRented){
      delayFee = rows[0].originalPrice/rows[0].daysRented/100 * (returnDate[0]-dateRented[0]-rows[0].daysRented)
    }
    await connectionDB.query(
      'UPDATE rentals SET "returnDate"=$1,"delayFee"=$2 WHERE id=$3;',
      [returnDate, delayFee, id]
    );
    res.sendStatus(201);
  }
  catch (err) {
    res.status(500).send(err.message);
  }
}


export async function removeRental(req, res) {
  const { id } = req.params;

  try {
    const {rows} = await connectionDB.query('SELECT * FROM rentals WHERE "id"=$1;',[id])
    if(rows.length===0){
      res.sendStatus(404)
      return
    }
    if(rows[0].returnDate === null){
      res.sendStatus(400)
      return
    }
    
    await connectionDB.query("DELETE FROM rentals WHERE id=$1", [id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

