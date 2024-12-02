const { Firestore } = require('@google-cloud/firestore');

async function storeAwardData(awardId, awardData) {
    const db = new Firestore();

    try {
        const awardsCollection = db.collection('awards');
        await awardsCollection.doc(awardId).set(awardData);
        return awardData;  
    } catch (error) {
        console.error('Error storing award data:', error);
        throw new Error('Failed to store award data');
    }
}

module.exports = storeAwardData;
