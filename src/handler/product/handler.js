// Required dependencies
const FormData = require('form-data'); // For sending data as form data in HTTP requests
const axios = require('axios'); // For making HTTP requests
const { Firestore } = require('@google-cloud/firestore'); // Google Firestore SDK for database interactions
const db = new Firestore(); // Firestore instance
const storeImageProduct = require('../../services/product/storeImageProduct'); // Service for storing product images
const storeDataProduct = require('../../services/product/storeDataProduct'); // Service for storing product data
const getDataProduct = require('../../services/product/getDataProduct'); // Service for retrieving product data

/**
 * Inference Service to get nutritional data (fat, sugar, health grade)
 * This function sends an image to a machine learning service for analysis.
 * 
 * @param {Stream} imageStream - The image stream for the product's nutritional information.
 * @param {string} barcodeId - The unique barcode ID of the product.
 * @returns {Object} - The response data from the machine learning service containing fat, sugar, and health grade information.
 */
async function inferenceService(imageStream, barcodeId) {
    try {
        // Create a new FormData object to append image and barcodeId
        const form = new FormData();
        form.append('imageNutri', imageStream, 'imageNutri.png');  
        form.append('barcodeId', barcodeId);

        // Send POST request to the machine learning service
        const response = await axios.post(process.env.endpointML, form, { 
            headers: { ...form.getHeaders() }
        });

        // Return the response data from the machine learning service
        return response.data;
    } catch (error) {
        // Log error if sending request fails
        console.error('Error sending image to Flask:', error);
        throw error; // Rethrow error for further handling
    }
}

/**
 * Handler for creating a new product entry.
 * This function processes the product details, stores the product image, calls the inference service for nutritional data,
 * stores the product data in Firestore, and updates user points.
 * 
 * @param {Object} request - The HTTP request object containing the product details.
 * @param {Object} h - The response toolkit object used to return a response to the client.
 * @returns {Object} - A response object indicating the success or failure of the operation.
 */
async function postNewProductHandler(request, h) {
    try {
        // Extract the user ID from the authentication token
        const userId = request.auth.credentials?.user?.id;
        console.log('User ID from token:', userId);

        // Destructure product details from request payload
        const { barcodeId, merk, varian, image, imageNutri } = request.payload;
        console.log(request.payload);

        // Validate required fields
        if (!barcodeId || !merk || !image || !imageNutri) {
            return h.response({
              status: 400,
              message: 'All Field is required', // Missing fields in the request
            }).code(400);
        }

        // Store product image in the cloud storage
        const imageName = await storeImageProduct(barcodeId, image, image.hapi.filename);

        // Call the inference service to retrieve nutritional data (fat, sugar, healthGrade)
        const { fat, sugar, healthGrade } = await inferenceService(imageNutri, barcodeId);

        // Prepare the new product data object
        const newdata = {
            barcodeId: barcodeId,
            merk: merk,
            varian: varian,
            imageURL: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${process.env.BUCKET_DESTINATION_PRODUCT}/${imageName}`,
            fat: fat,
            healthGrade: healthGrade,
            sugar: sugar
        };

        // Store the product data in Firestore
        await storeDataProduct(barcodeId, newdata);

        // Retrieve the user document from Firestore to update their points
        const usersCollection = db.collection('users');
        const userDoc = await usersCollection.doc(userId).get();

        // Handle case if user is not found
        if (!userDoc.exists) {
            console.error('User not found:', userId);
            return h.response({ status: 404, message: 'User not found' }).code(404);
        }

        // Get the current points of the user
        const currentPoints = userDoc.data().points || 0;
        console.log('Current points:', currentPoints);

        // Update user's points by adding 5
        await usersCollection.doc(userId).update({ points: currentPoints + 5 });
        console.log('Points updated successfully for user:', userId);

        // Return a success response with the product data
        const response = h.response({
            status: 'success',
            message: 'Product added successfully!',
            data: newdata
        });
        response.code(201);
        return response;

    } catch (error) {
        // Handle and log any errors during the product creation process
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

/**
 * Handler for retrieving product data based on scanned barcode.
 * This function fetches product data from the database using the barcode ID.
 * 
 * @param {Object} request - The HTTP request object containing the barcode ID.
 * @param {Object} h - The response toolkit object used to return a response to the client.
 * @returns {Object} - A response object containing the product data or an error message.
 */
async function getProductbyScanHandler(request, h) {
    const { barcodeId } = request.params;

    try {
        // Retrieve product data from Firestore using barcode ID
        const prediction = await getDataProduct(barcodeId);

        // Return 404 if the product is not found
        if (!prediction) {
            const response = h.response({
                status: 404,
                message: 'Product Not Found'
            });
            response.code(404);
            return response;
        }

        // Return product data if found
        const response = h.response({
            status: 200,
            data: prediction
        });
        response.code(200);
        return response;

    } catch (error) {
        // Log error if there's an issue fetching the product data
        console.error('Error fetching prediction history:', error);

        const response = h.response({
            status: 500,
            message: 'ERROR Fetching Prediction History'
        });
        response.code(500);
        return response;
    }
}

// Export the handlers for use in other parts of the application
module.exports = { postNewProductHandler, getProductbyScanHandler };
