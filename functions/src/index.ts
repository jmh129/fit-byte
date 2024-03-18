/* eslint-disable */

import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
// Import the Google Cloud client library
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize the Firebase Admin SDK
admin.initializeApp();

const visionClient = new ImageAnnotatorClient();

export const processDocumentUpload = onRequest(async (request, response) => {
  // Extract the document URL from the request body
  const { documentUrl } = request.body;

  if (!documentUrl) {
    response.status(400).send('No document URL provided');
    return;
  }

  logger.info('Received document for processing:', { documentUrl });

  try {
    // Assuming the URL directly points to an accessible image file
    const [result] = await visionClient.textDetection(documentUrl);
    const detections = result.textAnnotations;
    const detectedText =
      detections!.length > 0 ? detections![0].description : 'No text detected';

    logger.info('Detected text:', { detectedText });

    // Optionally, save the detected text to Firestore or perform further processing
    // Example Firestore save:
    // const docRef = admin.firestore().collection('detectedTexts').doc();
    // await docRef.set({
    //   documentUrl,
    //   detectedText,
    //   timestamp: admin.firestore.FieldValue.serverTimestamp(),
    // });

    response.send({ detectedText });
  } catch (error) {
    logger.error('Error processing document:', error);
    response.status(500).send('Error processing document');
  }
});
