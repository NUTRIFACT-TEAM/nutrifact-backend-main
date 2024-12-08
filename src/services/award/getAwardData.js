// Import Firestore class from the Google Cloud Firestore SDK
const { Firestore } = require('@google-cloud/firestore');

/**
 * Retrieves award data from the Firestore database.
 * This function connects to the 'awards' collection in Firestore and fetches all documents in it.
 * If no documents are found, it returns an empty array.
 * 
 * @returns {Promise<Array>} - A promise that resolves to an array of award data objects.
 * @throws {Error} - Throws an error if there is a failure while fetching the data.
 */
async function getAwardData() {
    // Instantiate a Firestore database connection
    const db = new Firestore();

    try {
        // Access the 'awards' collection in Firestore
        const awardsCollection = db.collection('awards');
        
        // Fetch all documents in the 'awards' collection
        const snapshot = await awardsCollection.get();

        // Check if the collection is empty and return an empty array if so
        if (snapshot.empty) {
            return [];
        }

        // Map through the documents and return their data
        const awards = snapshot.docs.map(doc => doc.data());
        return awards;
    } catch (error) {
        // Log the error if something goes wrong
        console.error('Error fetching award data:', error);
        
        // Throw a new error with a custom message
        throw new Error('Failed to fetch award data');
    }
}

// Export the getAwardData function for use in other modules
module.exports = getAwardData;
