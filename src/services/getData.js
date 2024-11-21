const { Firestore } = require('@google-cloud/firestore');

async function getDataFirestore(barcodeId) {
    const db = new Firestore();

    const predictDoc = db.collection('productNutri').doc(barcodeId);
    const doc = await predictDoc.get();

    if (!doc.exists) {
        console.log('No matching document.');
        return null;
    }

    const prediction = {
        barcodeId: doc.id,
        fat: doc.data().fat,
        healthGrade: doc.data().healthGrade,
        merk: doc.data().merk,
        sugar: doc.data().sugar,
        varian: doc.data().varian
    };

    return prediction;
}

module.exports = getDataFirestore;