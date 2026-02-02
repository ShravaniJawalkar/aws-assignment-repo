const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const PROJECT_NAME = process.env.PROJECT_NAME;
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

console.log(`S3LogsFunction initialized for project: ${PROJECT_NAME}`);

exports.handler = async (event) => {
    console.log(`Received event: ${JSON.stringify(event)}`);
    
    try {
        // This is a demo function for testing S3 log handling
        const buckets = await s3.listBuckets().promise();
        
        console.log(`Found ${buckets.Buckets.length} S3 buckets`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `S3 logs processed for ${PROJECT_NAME}`,
                bucketsCount: buckets.Buckets.length,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error(`Handler error: ${error.message}`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
                message: 'Failed to process S3 logs'
            })
        };
    }
};
