import {Request, Response, Router} from "express";
import {getAllCreditCardDetails, addNewCreditCard} from "./creditCard.service";

const creditCardRouter = Router();

creditCardRouter.get("/all", async (req: Request, res:Response) => {
    try {
        const cards =  await getAllCreditCardDetails();
        return res.status(200).send(cards);
    } catch(err) {
        return res.status(500).send(err);
    }
});

creditCardRouter.post("/new", async (req: Request, res:Response) => {
    try {
        const result =  await addNewCreditCard(req.body);
        return res.status(201).send(result);
    } catch(err) {
        return res.status(500).send(err);
    }
});

export default creditCardRouter;