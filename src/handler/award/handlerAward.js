// Import dependencies
const { Firestore } = require('@google-cloud/firestore');
const { nanoid } = require('nanoid');
const getAwardData = require('../../services/award/getAwardData');

/**
 * Handles the retrieval of all available awards.
 * 
 * @async
 * @function getAllAwardsHandler
 * @param {Object} request - The request object containing the HTTP request details.
 * @param {Object} h - The response toolkit object used to return responses.
 * @returns {Object} - Returns a response containing the list of awards.
 */
async function getAllAwardsHandler(request, h) {
    try {
        // Fetch all available awards from the service
        const awards = await getAwardData();

        // Return a successful response with the list of awards
        return h.response({
            status: 200,
            data: awards,
        }).code(200);
    } catch (error) {
        console.error('Error fetching awards data:', error);
        
        // Return a server error if fetching awards fails
        return h.response({
            status: 500,
            message: 'ERROR Fetching Awards Data',
        }).code(500);
    }
}

/**
 * Handles the redemption of an award using points.
 * 
 * @async
 * @function redeemAwardHandler
 * @param {Object} request - The request object containing the HTTP request details.
 * @param {Object} h - The response toolkit object used to return responses.
 * @returns {Object} - Returns a response indicating the outcome of the redemption process.
 */
const redeemAwardHandler = async (request, h) => {
    // Extract awardId from the payload and userId from authentication credentials
    const { awardId } = request.payload;
    const userId = request.auth.credentials.user.id;
    const db = new Firestore();

    try {
        // Fetch user and award data from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        const awardDoc = await db.collection('awards').doc(awardId).get();

        // Check if either user or award does not exist
        if (!userDoc.exists || !awardDoc.exists) {
            return h.response({ status: 404, message: 'User or Award not found' }).code(404);
        }

        // Extract user and award data from Firestore documents
        const userData = userDoc.data();
        const awardData = awardDoc.data();

        // Check if the user has enough points for the redemption
        if (userData.points < awardData.pointsRequired) {
            return h.response({ status: 400, message: 'Your points are insufficient' }).code(400);
        }

        // Deduct points from the user and update their record
        await db.collection('users').doc(userId).update({
            points: userData.points - awardData.pointsRequired,
        });

        // Create a redeem history entry
        const redeemHistory = {
            awardId,
            awardName: awardData.name,
            pointsRedeemed: awardData.pointsRequired,
            imageURL: awardData.imageURL,
            redeemedAt: new Date().toISOString(),
        };

        // Log the redemption in the redeemHistory collection
        await db.collection('redeemHistory').add({
            userId,
            ...redeemHistory,
        });

        // Return a successful response indicating the award was redeemed
        return h.response({
            status: 200,
            message: `Award "${awardData.name}" redeemed successfully`,
        }).code(200);
    } catch (error) {
        console.error('Error in redeemAwardHandler:', error);
        
        // Return a server error if redemption fails
        return h.response({
            status: 500,
            message: 'Failed to redeem award!',
        }).code(500);
    }
};

/**
 * Handles the retrieval of the user's redemption history.
 * 
 * @async
 * @function getRedeemHistoryHandler
 * @param {Object} request - The request object containing the HTTP request details.
 * @param {Object} h - The response toolkit object used to return responses.
 * @returns {Object} - Returns a response containing the user's redemption history.
 */
const getRedeemHistoryHandler = async (request, h) => {
    // Extract userId from the authenticated user's credentials
    const userId = request.auth.credentials.user.id;
    const db = new Firestore();

    try {
        // Fetch the user's redeem history, sorted by the redemption date (descending)
        const historySnapshot = await db
            .collection('redeemHistory')
            .where('userId', '==', userId)
            .orderBy('redeemedAt', 'desc')
            .get();

        // If no history is found, return an empty list
        if (historySnapshot.empty) {
            return h.response({
                status: 'success',
                message: 'No redeem history found.',
                data: [],
            }).code(200);
        }

        // Extract and format the redeem history data
        const history = historySnapshot.docs.map(doc => doc.data());

        // Return a successful response with the redeem history
        return h.response({
            status: 'success',
            message: 'Redeem history found.',
            data: history,
        }).code(200);
    } catch (error) {
        console.error('Error fetching redeem history:', error);
        
        // Return a server error if fetching the history fails
        return h.response({
            status: 500,
            message: 'Failed to fetch redeem history.',
        }).code(500);
    }
};

// Export the handlers to be used by other modules
module.exports = { getAllAwardsHandler, redeemAwardHandler, getRedeemHistoryHandler };
