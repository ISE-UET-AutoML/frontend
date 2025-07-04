export const uploadToS3 = async (presignedUrl, data) => {
    try {
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: data,
            headers: {
                'Content-Type': data.type || 'application/octet-stream',
            },
        });

        if (!response.ok) {
            throw new Error(`S3 upload failed with status ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
    }
};