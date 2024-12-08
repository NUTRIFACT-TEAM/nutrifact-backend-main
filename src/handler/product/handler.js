const InputError = require('../../exceptions/InputError');
const { nanoid } = require('nanoid');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Firestore } = require('@google-cloud/firestore');
const db = new Firestore();
const storeImageProduct = require('../../services/product/storeImageProduct');
const storeDataProduct = require('../../services/product/storeDataProduct');
const getDataProduct = require('../../services/product/getDataProduct');

async function inferenceService(imageStream, barcodeId) {
    try {
        const form = new FormData();
        form.append('imageNutri', imageStream, 'imageNutri.png');  
        form.append('barcodeId', barcodeId);

        const response = await axios.post(process.env.endpointML, form, { 
            headers: { ...form.getHeaders() }
        });

        return response.data; //mengebalikan objek respons Axios
    } catch (error) {
        console.error('Error sending image to Flask:', error);
        throw error;
    }
}

async function postNewProductHandler(request, h) {
    try {
        const userId = request.auth.credentials?.user?.id;
        console.log('User ID from token:', userId);

        const { barcodeId, merk, varian, image, imageNutri } = request.payload;
        console.log(request.payload);

        if (!barcodeId && !merk && !image && !imageNutri) {
            return h.response({
              status: 400,
              message: 'All Field is required',
            }).code(400);
          }

        // barcode ID dari rafi
        // const barcodeId = nanoid(16);
        const imageName = await storeImageProduct(barcodeId, image, image.hapi.filename);

        // Panggil Flask service untuk mendapatkan fat, sugar, dan healthGrade
        const { fat, sugar, healthGrade } = await inferenceService(imageNutri, barcodeId);

        const newdata = {
            barcodeId: barcodeId,
            merk: merk,
            varian: varian,
            imageURL: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${process.env.BUCKET_DESTINATION_PRODUCT}/${imageName}`,
            fat: fat,
            healthGrade: healthGrade,
            sugar: sugar
        };

        await storeDataProduct(barcodeId, newdata);

        // Penambahan points untuk users melaui userId(jwt)
        const usersCollection = db.collection('users');
        const userDoc = await usersCollection.doc(userId).get();

        if (!userDoc.exists) {
            console.error('User not found:', userId);
            return h.response({ status: 404, message: 'User not found' }).code(404);
        }

        const currentPoints = userDoc.data().points || 0;
        console.log('Current points:', currentPoints);

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