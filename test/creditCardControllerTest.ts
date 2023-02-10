import app from './../index';
import chai from 'chai';
import chaiHttp from 'chai-http';
import db from './../db';
import sinon from 'sinon';

chai.should();
chai.use(chaiHttp);


describe('Credit Cards API', () => {
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
    describe('Get all credit cards', () => {
        it('Should return all the credit cards', (done) => {
            chai.request(app)
                .get('/api/v1/creditcard/all')
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                    response.body.length.should.not.be.eq(0);
                    done();
                });
        });
        it('Should return all the credit cards', (done) => {
            const mock = sinon.stub(db, 'all');
            mock.yields([], null);
            chai.request(app)
                .get('/api/v1/creditcard/all')
                .end((err, response) => {
                    response.should.have.status(500);
                    mock.restore();
                    done();
                });
        });
    });
})