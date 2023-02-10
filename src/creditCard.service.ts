import { Card, CardPayload} from "./creditCard.model";
import db from './../db';
import queries from './creditCard.queries';

const getAllCreditCardDetails = async (): Promise<Card[] | []> => {
    return new Promise((resolve, reject) => {
        db.all(queries.getAllCreditCards, [], (err: Error, rows: Card[]) => {
            if (err) {
                console.error('Error while getting all cards', err);
                return reject([]);
            }
            return resolve(rows);
        });
    });
};

const luhn10CardNumberValidator = (cardNumber: string): boolean => {
    let totalSum: number = 0;
    cardNumber.split("").reverse().forEach((digit, index) => {
        let parsedDigit: number = parseInt(digit);
        if (index % 2 === 0) {
            totalSum += parsedDigit;
        } else {
            let doubledValue = parsedDigit * 2;
            totalSum += doubledValue <= 9 ? doubledValue : ((doubledValue % 10) + 1);
        }
    });
    return (totalSum % 10) === 0;
};

const checkCreditCardAlreadyExists = async (cardNumber: string): Promise<boolean> => {
    return new Promise((resolve, _) => {
        db.get(queries.checkCreditCardExists, [cardNumber], (err: Error, row: Card) => {
            if (err) {
                console.error('Error while checking if card exists', err);
                return resolve(true);
            }
            if(row)
                return resolve(Object.keys(row).length !== 0);
            return resolve(false);
        });
    });
}

const addNewCreditCard = async (payload: CardPayload): Promise<Card | String> => {
    return new Promise(async (resolve, reject) => {
        const newCard: CardPayload = { ...payload };
        if (newCard.name.length === 0) {
            return reject('Name cannot be empty');
        }
        if (newCard.cardNumber.length <=15 || newCard.cardNumber.length >=20) {
            return reject('Invalid card number');
        }
        if (!newCard.cardLimit || newCard.cardLimit <= 0) {
            return reject('Invalid card limit');
        }
        if (!luhn10CardNumberValidator(newCard.cardNumber)) {
            // console.error(`${newCard.cardNumber} is not valid`);
            return reject('Card Number is not valid');
        }
        const cardExists = await checkCreditCardAlreadyExists(newCard.cardNumber);
        if (cardExists) {
            console.error(`${newCard.cardNumber} already exists`);
            return reject(`Card with card number ${newCard.cardNumber} already already exists`);
        }
        db.run(queries.insertNewCreditCard, [newCard.name, newCard.cardNumber, 0, newCard.cardLimit], (err: Error) => {
            if (err) {
                console.error('Insert into database failed', err);
                return reject(`Error while adding card details for ${newCard.cardNumber}`);
            }
            db.get(queries.checkCreditCardExists, [newCard.cardNumber], (_, row) => {
                console.log('Card successfully added to the database');
                return resolve(row);
            });
        });
    });
};

export {
    getAllCreditCardDetails,
    addNewCreditCard,
    luhn10CardNumberValidator,
    checkCreditCardAlreadyExists
}