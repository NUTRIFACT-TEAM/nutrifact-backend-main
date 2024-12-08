// Import Firestore class from the Google Cloud Firestore SDK
const { Firestore } = require('@google-cloud/firestore');

/**
 * Retrieves product data based on the provided barcode ID from the Firestore database.
 * This function queries the 'productNutri' collection in Firestore using the barcode ID as the document ID,
 * and returns relevant product nutritional data.
 * 
 * @param {string} barcodeId - The barcode ID of the product to retrieve data for.
 * @returns {Promise<Object|null>} - A promise that resolves to the product data object or null if no matching document is found.
 */
async function getDataProduct(barcodeId) {
    // Instantiate a Firestore database connection
    const db = new Firestore();

    // Reference to the product document using the barcode ID as the document ID
    const predictDoc = db.collection('productNutri').doc(barcodeId);

    try {
        // Fetch the document from Firestore
        const doc = await predictDoc.get();

        // If the document doesn't exist, log the message and return null
        if (!doc.exists) {
            console.log('No matching document found for barcode:', barcodeId);
            return null;
        }

        // Extract the product data from the document and structure it
        const prediction = {
            barcodeId: doc.id, // The document ID is the barcode ID
            fat: doc.data().fat,
            healthGrade: doc.data().healthGrade,
            merk: doc.data().merk,
            sugar: doc.data().sugar,
            varian: doc.data().varian,
            imageURL: doc.data().imageURL
        };

        // Return the structured product data
        return prediction;
    } catch (error) {
        // Log any errors that occur while fetching the document
        console.error('Error fetching product data for barcode:', barcodeId, error);
        throw new Error('Failed to fetch product data');
    }
}

// Export the getDataProduct function for use in other modules
module.exports = getDataProduct;
