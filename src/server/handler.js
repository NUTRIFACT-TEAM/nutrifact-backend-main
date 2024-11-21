const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const getDataFirestore = require('../services/getData');
const InputError = require('../exceptions/InputError');
// const { nanoid } = require('nanoid');
const { nanoid } = require('nanoid');


async function postNewProductHandler(request, h) {
    
    /** TODO: disini ntar manggil request.payload image, juga request.server.app model */ 
    

    try {
        
        /** TODO: disini ntar manggil var sugar, fat, dan healthGrade dari fungsi 
         * inference Server dengan parameter model,image*/ 

        const { merk, varian } = request.payload;

        const newVarian = varian;

        const barcodeId = nanoid(16);
        
        
        /** FIXME: output merk dan varian tidak keluar pada body, find another alternative */
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

async function getProductbyScan(request, h) {
    
}



module.exports = {postNewProductHandler};
