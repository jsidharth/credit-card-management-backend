export default {
    'getAllCreditCards': 'SELECT * FROM card_details',
    'insertNewCreditCard': `INSERT INTO card_details (name, cardNumber, cardBalance, cardLimit) VALUES (?, ?, ?, ?)`,
    'checkCreditCardExists': 'SELECT * FROM card_details WHERE cardNumber = ?'
}