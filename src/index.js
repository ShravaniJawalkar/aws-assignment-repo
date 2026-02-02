const AWS = require('aws-sdk');

const sns = new AWS.SNS();
const sqs = new AWS.SQS();

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const PROJECT_NAME = process.env.PROJECT_NAME;
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

console.log(`UploadsNotificationFunction initialized for project: ${PROJECT_NAME}`);

exports.handler = async (event) => {
    console.log(`Received event: ${JSON.stringify(event)}`);
    
    try {
        const records = event.Records || [];
        const results = [];
        
        for (const record of records) {
            try {
                // Parse SQS message
                const messageBody = JSON.parse(record.body);
                console.log(`Processing SQS message: ${JSON.stringify(messageBody)}`);
                
                // Publish to SNS
                const params = {
                    TopicArn: SNS_TOPIC_ARN,
                    Subject: `Upload Notification - ${PROJECT_NAME}`,
                    Message: JSON.stringify({
                        project: PROJECT_NAME,
                        timestamp: new Date().toISOString(),
                        originalMessage: messageBody
                    })
                };
                
                const snsResult = await sns.publish(params).promise();
                console.log(`Published to SNS: ${snsResult.MessageId}`);
                
                results.push({
                    messageId: record.messageId,
                    status: 'success',
                    snsMessageId: snsResult.MessageId
                });
                
                // Delete message from SQS
                await sqs.deleteMessage({
                    QueueUrl: process.env.SQS_QUEUE_URL,
                    ReceiptHandle: record.receiptHandle
                }).promise();
                
            } catch (error) {
                console.error(`Error processing record: ${error.message}`, error);
                results.push({
                    messageId: record.messageId,
                    status: 'failed',
                    error: error.message
                });
            }
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Processed messages',
                results: results
            })
        };
        
    } catch (error) {
        console.error(`Handler error: ${error.message}`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};
