const { Firestore } = require('@google-cloud/firestore');

// async function getDataFirestore(id) {

//     const db = new Firestore();

//     const predictCollection = db.collection('productNutri').doc(id);
//     const snapshot = await predictCollection.get();

//     if (snapshot.empty) {
//         console.log('No matching documents.');
//         return [];
//     }

//     const predictions = [];
//     snapshot.forEach(doc => {
//         productbyId.push({
//             barcodeId: doc.barcodeId,
//             fat: doc.fat,
//             // id: doc.id,
//             // history: {
//             //     result: doc.data().result,
//             //     createdAt: doc.data().createdAt,
//             //     suggestion: doc.data().suggestion,
//             //     id: doc.id
//             // }
//         });
//     });


//     return predictions;
// }

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