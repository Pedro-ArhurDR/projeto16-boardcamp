import { Router } from "express";

import {findGames,findCategories, findCustomersById,
    findCustomers, updateCustomer,findRentals,createRental,finishRental , removeRental,createGame, createCategorie,createCustomer} from '../controllers/boardcamp.controller.js'

const router = Router();

router.get("/categories", findCategories);
router.post("/categories", createCategorie);
router.post("/games", createGame);
router.get("/games", findGames);
router.get("/customers", findCustomers);
router.get("/customers/:id", findCustomersById);
router.post("/customers", createCustomer);
router.put("/customers/:id", updateCustomer);
router.get("/rentals", findRentals);
router.post("/rentals", createRental)
router.post("/rentals/:id/return", finishRental)
router.delete("/rentals/:id", removeRental);

export default router;
