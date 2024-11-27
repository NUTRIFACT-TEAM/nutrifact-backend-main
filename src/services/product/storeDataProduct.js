const { Firestore } = require('@google-cloud/firestore');
 
async function storeDataProduct(id, data) {
  const db = new Firestore();
 
  const predictCollection = db.collection('productNutri');
  return predictCollection.doc(id).set(data);
}
 
module.exports = storeDataProduct;
