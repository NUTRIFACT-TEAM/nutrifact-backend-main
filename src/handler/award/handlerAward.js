const { Firestore } = require('@google-cloud/firestore');
const { nanoid } = require('nanoid');
const storeImageAward = require('../../services/award/storeImageAward');
const storeAwardData = require('../../services/award/storeAwardData');
const getAwardData = require('../../services/award/getAwardData');

async function postNewAwardHandler(request, h) {
    const { name, description, image, pointsRequired } = request.payload;

    try {
        const awardId = nanoid(16);

        const imageName = await storeImageAward(awardId, image, image.hapi.filename);

        const awardData = {
            awardId,
            name,
            description,
            imageURL: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/imageAward/${imageName}`,
            pointsRequired,
        };

        await storeAwardData(awardId, awardData);

        return h.response({
            status: 'success',
            message: 'Award added successfully!',
            data: awardData,
        }).code(201);
    } catch (error) {
        console.error('Error in postNewAwardHandler:', error);
        return h.response({
            status: 400,
            message: 'Failed to add award!',
            error: error.message,
        }).code(400);
    }
}

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
            return h.response({ status: 400, message: 'Insufficient points' }).code(400);
        }

        await db.collection('users').doc(userId).update({
            points: userData.points - awardData.pointsRequired,
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

module.exports = { postNewAwardHandler, getAllAwardsHandler, redeemAwardHandler };
