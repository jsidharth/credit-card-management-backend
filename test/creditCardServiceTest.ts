import { assert } from 'chai';
import db from '../db';
import {
    getAllCreditCardDetails,
    addNewCreditCard,
    luhn10CardNumberValidator,
    checkCreditCardAlreadyExists
} from './../src/creditCard.service';
import sinon from 'sinon';

describe('Check all card details are fetched', () => {
    before(() => {
        db.serialize(() => {
            db.run(`DROP TABLE IF EXISTS card_details`);
            db.run(`CREATE TABLE IF NOT EXISTS card_details (
                cardId INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                cardNumber TEXT NOT NULL,
                cardBalance INTEGER,
                cardLimit INTEGER NOT NULL
             )`);
            db.run(`INSERT INTO card_details (name, cardNumber, cardBalance, cardLimit) VALUES ('John Doe',
                '5555555555554444', 1000, 5000)`);
            db.run(`INSERT INTO card_details (name, cardNumber, cardBalance, cardLimit) VALUES ('Joe Smith',
            '5105105105105100', 100, 1000)`);
        });
    });

    it('Empty array when db error', (done) => {
        const mock = sinon.stub(db, 'all');
        mock.throws([]);
        getAllCreditCardDetails().catch(rows => {
            assert.isEmpty(rows);
            mock.restore();
            done();
        });
    });

    it('No rows are returned when no card details are present', (done) => {
        const mock = sinon.stub(db, 'all');
        mock.yields(null, []);
        getAllCreditCardDetails().then(rows => {
            assert.isEmpty(rows);
            mock.restore();
            done();
        });
    });

    it('All rows are returned', (done) => {
        getAllCreditCardDetails().then(rows => {
            assert.isTrue(rows.length === 2);
            done();
        });
    });
});

describe('Check credit card validation algoritm', () => {
    it('Check valid credit card', () => {
        const cardNumber: string = '5555555555554444';
        const isValid = luhn10CardNumberValidator(cardNumber);
        assert.isTrue(isValid);
    });
    it('Check Invalid credit card', () => {
        const cardNumber: string = '5555555555554442';
        const isValid = luhn10CardNumberValidator(cardNumber);
        assert.isFalse(isValid);
    });
});

describe('Check credit card already exists', () => {
    before(() => {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS card_details (
                cardId INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                cardNumber TEXT NOT NULL,
                cardBalance INTEGER,
                cardLimit INTEGER NOT NULL
             )`);
            db.run(`INSERT INTO card_details (name, cardNumber, cardBalance, cardLimit) VALUES ('John Doe',
                '5555555555554444', 1000, 5000)`);
        });
    });
    it('Check if a card already exists when given same card number', (done) => {
        const checkCardNumber = '5555555555554444';
        checkCreditCardAlreadyExists(checkCardNumber).then(isValid => {
            assert.isTrue(isValid);
            done();
        });
    });
    it('Check Invalid credit card', (done) => {
        const mock = sinon.stub(db, 'get');
        mock.yields(null, {});
        const checkCardNumber = '5555555555554441';
        checkCreditCardAlreadyExists(checkCardNumber).then(isValid => {
            assert.isFalse(isValid);
            mock.restore();
            done();
        });
    });
});

describe('Add new card', () => {
    before(() => {
        db.serialize(() => {
            db.run(`DROP TABLE IF EXISTS card_details`);
            db.run(`CREATE TABLE card_details (
                cardId INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                cardNumber TEXT NOT NULL,
                cardBalance INTEGER,
                cardLimit INTEGER NOT NULL
             )`);
        });
    });
    it('Check if name is empty', (done) => {
        const payload = {
            "name": "",
            "cardNumber": "5555555555554444",
            "cardLimit": 1000
        }
        addNewCreditCard(payload).catch(error => {
            assert.equal(error, 'Name cannot be empty');
            done();
        });
    });
    it('Check if card number is valid length', (done) => {
        const payload = {
            "name": "John Done",
            "cardNumber": "555555555",
            "cardLimit": 1000
        }
        addNewCreditCard(payload).catch(error => {
            assert.equal(error, 'Invalid card number');
            done();
        });
    });
    it('Check if card limit is valid', (done) => {
        const payload = {
            "name": "John Done",
            "cardNumber": "5555555555554444",
            "cardLimit": -100
        }
        addNewCreditCard(payload).catch(error => {
            assert.equal(error, 'Invalid card limit');
            done();
        });
    });
    it('Check if card number is luhn10 valid', (done) => {
        const payload = {
            "name": "John Done",
            "cardNumber": "5555555555554441",
            "cardLimit": 1000
        }
        addNewCreditCard(payload).catch(error => {
            assert.equal(error, 'Card Number is not valid');
            done();
        });
    });
    it('Check if valid card is inserted', (done) => {
        const payload = {
            "name": "John Done",
            "cardNumber": "5555555555554444",
            "cardLimit": 1000
        }
        const newCard = {
            cardId: 1,
            name: "John Done",
            cardNumber: "5555555555554444",
            cardBalance: 0,
            cardLimit: 1000
        };
        addNewCreditCard(payload).then(row => {
            assert.deepEqual(row, newCard);
            done();
        });
    });
    it('Check if valid card is not inserted on db error', (done) => {
        const payload = {
            "name": "John Done",
            "cardNumber": "5105105105105100",
            "cardLimit": 1000
        }
        const mockInsert = sinon.stub(db, 'run');
        mockInsert.yields(`Error while adding card details for ${payload.cardNumber}`);
        addNewCreditCard(payload).catch(row => {
            assert.equal(row, `Error while adding card details for 5105105105105100`);
            mockInsert.restore();
            done();
        });
    });
});