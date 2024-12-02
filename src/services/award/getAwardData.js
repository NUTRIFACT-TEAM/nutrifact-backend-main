const { Firestore } = require('@google-cloud/firestore');

async function getAwardData() {
    const db = new Firestore();

    try {
        const awardsCollection = db.collection('awards');
        const snapshot = await awardsCollection.get();

        if (snapshot.empty) {
            return [];
        }

        const awards = snapshot.docs.map(doc => doc.data());
        return awards;
    } catch (error) {
        console.error('Error fetching award data:', error);
        throw new Error('Failed to fetch award data');
    }
}

module.exports = getAwardData;
