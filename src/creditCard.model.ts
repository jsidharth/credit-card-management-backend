export interface Card {
    cardId: Number,
    name: string,
    cardNumber: string,
    cardBalance: number,
    cardLimit: number
};

export interface CardPayload {
    name: string,
    cardNumber: string,
    cardLimit: number
}