// Import the Firestore class from the Google Cloud Firestore SDK
const { Firestore } = require('@google-cloud/firestore');

/**
 * Stores product nutritional data in the Firestore database.
 * This function adds or updates a document in the 'productNutri' collection based on the provided product ID.
 * 
 * @param {string} id - The unique product ID (barcode ID) used as the document ID in Firestore.
 * @param {Object} data - The product data to be stored, which includes nutritional information like fat, sugar, health grade, etc.
 * @returns {Promise} - A promise that resolves when the data has been successfully stored in Firestore.
 */
async function storeDataProduct(id, data) {
  // Instantiate a Firestore database connection
  const db = new Firestore();

  // Reference the 'productNutri' collection in Firestore
  const predictCollection = db.collection('productNutri');

  try {
    // Store the product data in Firestore using the provided product ID (id) as the document ID
    await predictCollection.doc(id).set(data);
    console.log('Product data stored successfully:', id);
  } catch (error) {
    // Log any errors that occur while storing data
    console.error('Error storing product data for id:', id, error);
    throw new Error('Failed to store product data');
  }
}

// Export the storeDataProduct function for use in other parts of the application
module.exports = storeDataProduct;
