const { Firestore } = require('@google-cloud/firestore');
const { nanoid } = require('nanoid');
const getAwardData = require('../../services/award/getAwardData');

//List produl award yang tersedia
async function getAllAwardsHandler(request, h) {
    try {
        const awards = await getAwardData();

        return h.response({
            status: 200,
            data: awards,
        }).code(200);
    } catch (error) {
        console.error('Error fetching awards data:', error);
        return h.response({
            status: 500,
            message: 'ERROR Fetching Awards Data',
        }).code(500);
    }
}


//Proses redeem point untuk ditukar ke produk award
const redeemAwardHandler = async (request, h) => {
    const { awardId } = request.payload;
    const userId = request.auth.credentials.user.id;
    const db = new Firestore();

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const awardDoc = await db.collection('awards').doc(awardId).get();

        if (!userDoc.exists || !awardDoc.exists) {
            return h.response({ status: 404, message: 'User or Award not found' }).code(404);
        }

        const userData = userDoc.data();
        const awardData = awardDoc.data();

        if (userData.points < awardData.pointsRequired) {
            return h.response({ status: 400, message: 'Your points are insufficient' }).code(400);
        }

        // Update user's points
        await db.collection('users').doc(userId).update({
            points: userData.points - awardData.pointsRequired,
        });

        // Log redeem history
        const redeemHistory = {
            awardId,
            awardName: awardData.name,
            pointsRedeemed: awardData.pointsRequired,
            redeemedAt: new Date().toISOString(),
        };

        await db.collection('redeemHistory').add({
            userId,
            ...redeemHistory,
        });

        return h.response({
            status: 200,
            message: `Award "${awardData.name}" redeemed successfully`,
        }).code(200);
    } catch (error) {
        console.error('Error in redeemAwardHandler:', error);
        return h.response({
            status: 500,
            message: 'Failed to redeem award!',
        }).code(500);
    }
};

// History redeem users
const getRedeemHistoryHandler = async (request, h) => {
    const userId = request.auth.credentials.user.id;
    const db = new Firestore();

    try {
        const historySnapshot = await db
            .collection('redeemHistory')
            .where('userId', '==', userId)
            .orderBy('redeemedAt', 'desc') // Sort by redemption date
            .get();

        if (historySnapshot.empty) {
            return h.response({
                status: 'success',
                message: 'No redeem history found.',
                data: [],
            }).code(200);
        }

        const history = historySnapshot.docs.map(doc => doc.data());

        return h.response({
            status: 'success',
            message: 'Redeem history found.',
            data: history,
        }).code(200);
    } catch (error) {
        console.error('Error fetching redeem history:', error);
        return h.response({
            status: 500,
            message: 'Failed to fetch redeem history.',
        }).code(500);
    }
};

module.exports = { getAllAwardsHandler, redeemAwardHandler, getRedeemHistoryHandler  };
