const predictClassification = require('../../model/healthGrade');
const InputError = require('../../exceptions/InputError');
const { nanoid } = require('nanoid');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const storeImageProduct = require('../../services/product/storeImageProduct');
const storeDataProduct = require('../../services/product/storeDataProduct');
const getDataProduct = require('../../services/product/getDataProduct');

async function postNewProductHandler(request, h) {
    try {
        /** TODO: disini ntar manggil var sugar, fat, dan healthGrade dari fungsi 
         * inferenceService dengan parameter model,image*/
        const { merk, varian, image, fat, healthGrade, sugar } = request.payload;

        const barcodeId = nanoid(16);

        const imageName = await storeImageProduct(barcodeId, image, image.hapi.filename);

        const newdata = {
            barcodeId: barcodeId,
            merk: merk,
            varian: varian,
            imageURL: `https://storage.googleapis.com/bucket-nutrifact/imageProduct/${imageName}`,
            fat: fat,
            healthGrade: healthGrade,
            sugar: sugar
             /** TODO: disini ntar masukkin sugar, fat, healthGrade dari model ML */
        };

        await storeDataProduct(barcodeId, newdata);

        const usersCollection = db.collection('users');
        const userDoc = await usersCollection.doc(userId).get();

        if (!userDoc.exists) {
            console.error('User not found:', userId);
            return h.response({ status: 404, message: 'User not found' }).code(404);
        }

        const currentPoints = userDoc.data().points || 0;
        console.log('Current Points:', currentPoints);

        await usersCollection.doc(userId).update({ points: currentPoints + 5 });
        console.log('Points updated successfully for user:', userId);

        const response = h.response({
            status: 'success',
            message: 'Product added successfully!',
            data: newdata
        });
        response.code(201);
        return response;

    } catch (error) {
        console.error('Error in postNewProductHandler:', error);
        const response = h.response({
            status: 400,
            message: 'Failed to add product!',
            error: error.message
        });
        response.code(400);
        return response;
    }
}



async function getProductbyScanHandler(request, h) {
    const { barcodeId } = request.params;

    try {
        const prediction = await getDataProduct(barcodeId);

        if (!prediction) {
            const response = h.response({
                status: 404,
                message: 'Product Not Found'
            });
            response.code(404);
            return response;
        }

        const response = h.response({
            status: 200,
            data: prediction
        });
        response.code(200);
        return response;

    } catch (error) {
        console.error('Error fetching prediction history:', error);

        const response = h.response({
            status: 500,
            message: 'ERROR Fetching Prediction History'
        });
        response.code(500);
        return response;
    }
}




module.exports = { postNewProductHandler, getProductbyScanHandler };
