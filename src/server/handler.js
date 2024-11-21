const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const getDataFirestore = require('../services/getData');
const InputError = require('../exceptions/InputError');
const { nanoid } = require('nanoid');
const fs = require('fs');
const FormData = require('form-data');

async function postNewProductHandler(request, h) {

    /** TODO: disini ntar manggil request.payload image, juga request.server.app model */


    try {

        /** TODO: disini ntar manggil var sugar, fat, dan healthGrade dari fungsi 
         * inferenceService dengan parameter model,image*/

        const form = new FormData();
        form.append('merk', request.payload.merk);
        form.append('varian', request.payload.varian);
        
        /** TODO: parsing image untuk scan */
        // form.append('image', fs.createReadStream(request.payload.image.path));

        const { merk, varian } = request.payload;

        const newVarian = varian;

        const barcodeId = nanoid(16);

        const newdata = {
            barcodeId: barcodeId,
            merk: merk,
            varian: newVarian

            /** TODO: disini ntar masukkin sugar, fat, healthGrade */

        }

        /** TODO: Panggil fungsi storeData untuk nyimpen ke cloud: ON-PROGRESS */

        const response = h.response({
            status: 201,
            message: 'Product Added successfully!',
            data: newdata
        });
        response.code(201);
        return response;

    } catch (error) {
        const response = h.response({
            status: response.code(400),
            message: 'Failed to add product!'
        });
        response.code(400);
        return response;
    }
}

async function getProductbyScanHandler(request, h) {
    const { barcodeId } = request.params;

    try {
        const prediction = await getDataFirestore(barcodeId);

        if (!prediction) {
            const response = h.response({
                status: 404,
                message: 'Product tidak ditemukan'
            });
            response.code(404);
            return response;
        }

        const response = h.response({
            status: 'success',
            data: prediction
        });
        response.code(200);
        return response;
        
    } catch (error) {
        console.error('Error fetching prediction history:', error);

        const response = h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam mengambil riwayat prediksi'
        });
        response.code(500);
        return response;
    }
}




module.exports = { postNewProductHandler, getProductbyScanHandler};
