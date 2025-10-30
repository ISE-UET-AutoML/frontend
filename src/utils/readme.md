# Image Upload to S3 - Technical Documentation

## Overview

This document describes the architecture and implementation of the chunked image upload system to AWS S3 for the Astral ML platform. The system divides large datasets into manageable chunks, creates ZIP archives, and uploads them to S3 using presigned URLs.

## Architecture

### Core Components

1. **File Organization** (`utils/file.js`)
   - `organizeFiles()` - Groups files by label based on directory structure
   - `createChunks()` - Divides organized files into fixed-size chunks
   - `validateFiles()` - Validates file types against allowed extensions

2. **ZIP Creation & Upload** (`utils/uploadZipS3.js`)
   - `uploadZippedFilesToS3()` - Creates ZIP archives and uploads to S3
   - `uploadFilesToS3()` - Handles individual file uploads with presigned URLs
   - `parseAndValidateFiles()` - Parses file paths and removes duplicates

3. **S3 Upload Utility** (`utils/s3.js`)
   - `uploadToS3()` - Core function for PUT requests to S3 presigned URLs

4. **Orchestration** (`components/projects/CreateProjectModal.jsx`)
   - Coordinates the entire upload workflow
   - Manages state and progress
   - Handles dataset initialization and finalization

## Upload Flow

### Step 1: File Organization

```javascript
const fileMap = organizeFiles(files);
// Input: [{ path: 'train/dog/img1.jpg', fileObject: File }, ...]
// Output: Map {
//   'dog' => [{ path: 'train/dog/img1.jpg', label: 'dog', fileObject: File }],
//   'cat' => [{ path: 'train/cat/img2.jpg', label: 'cat', fileObject: File }],
//   'unlabeled' => [{ path: 'img3.jpg', label: null, fileObject: File }]
// }
```

**Logic:**
- Files with path structure `folder/label/filename.ext` are grouped by label
- Files with fewer than 3 path segments are marked as 'unlabeled'
- Preserves original File objects and metadata (bounding boxes, etc.)

### Step 2: Chunk Creation

```javascript
const chunks = createChunks(fileMap, IMG_NUM_IN_ZIP);
// Output: [
//   { name: 'chunk_dog_0.zip', files: [...], label: 'dog' },
//   { name: 'chunk_dog_1.zip', files: [...], label: 'dog' },
//   { name: 'chunk_cat_0.zip', files: [...], label: 'cat' },
//   { name: 'chunk_unlabel_0.zip', files: [...], label: null }
// ]
```

**Parameters:**
- `IMG_NUM_IN_ZIP` - Maximum number of images per chunk (defined in constants)

**Naming Convention:**
- Labeled data: `chunk_{label}_{index}.zip`
- Unlabeled data: `chunk_unlabel_{index}.zip`

### Step 3: Index Generation

```javascript
const indexData = {
    dataset_title: "My Dataset",
    dataset_type: "IMAGE",
    files: [
        { path: "dataset_id/train/dog/img1.jpg", chunk: "chunk_dog_0.zip" },
        { path: "dataset_id/train/dog/img2.jpg", chunk: "chunk_dog_0.zip" }
    ],
    chunks: [
        { name: "chunk_dog_0.zip", file_count: 100 },
        { name: "chunk_cat_0.zip", file_count: 150 }
    ]
};
```

**Purpose:**
- Maps each file to its containing chunk
- Provides metadata for backend processing
- Stored as `{dataset_id}/index.json` in S3

### Step 4: Presigned URL Request

```javascript
const presignPayload = {
    dataset_title: datasetID,
    files: [
        { key: "dataset_id/index.json", type: "application/json" },
        { key: "dataset_id/zip/chunk_dog_0.zip", type: "application/zip" },
        { key: "dataset_id/zip/chunk_cat_0.zip", type: "application/zip" }
    ]
};

const { data: presignedUrls } = await datasetAPI.createPresignedUrls(presignPayload);
// Returns: [
//   { key: "dataset_id/index.json", url: "https://s3.amazonaws.com/..." },
//   { key: "dataset_id/zip/chunk_dog_0.zip", url: "https://s3.amazonaws.com/..." }
// ]
```

### Step 5: ZIP Creation and Upload

```javascript
// For each chunk
const zip = new JSZip();
for (const file of chunk.files) {
    // Construct path within ZIP
    let zipPath = file.path.split('/').slice(-2).join('/');
    if (file.path.split('/').length === 2) {
        zipPath = `unlabel_${file.path.split('/').pop()}`;
    } else {
        zipPath = file.path.split('/').slice(-2).join('_');
    }
    zip.file(zipPath, file.fileObject);
}

const zipBlob = await zip.generateAsync({ type: 'blob' });
await uploadToS3(presignedUrl, zipBlob);
```

**ZIP Structure:**
```
chunk_dog_0.zip
├── dog_img1.jpg
├── dog_img2.jpg
└── dog_img3.jpg

chunk_unlabel_0.zip
├── unlabel_img4.jpg
└── unlabel_img5.jpg
```

## Current Implementation Details

### File Validation

```javascript
const validateFiles = (files, datasetType) => {
    const allowedExtensionsByType = {
        IMAGE: ['jpg', 'jpeg', 'png', 'webp'],
        TEXT: ['csv'],
        TABULAR: ['csv'],
        MULTIMODAL: ['jpg', 'jpeg', 'png', 'webp', 'csv'],
    };
    
    const allowedExts = allowedExtensionsByType[datasetType] || [];
    return files.filter((file) => {
        const filePath = file.webkitRelativePath || file.name || '';
        return isAllowedExtension(filePath, allowedExts);
    });
};
```

### Upload Function

```javascript
export const uploadToS3 = async (presignedUrl, data) => {
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
};
```

## Known Limitations

### 1. Sequential Upload
**Issue:** Uploads are processed one at a time in a for-loop
```javascript
for (const file of s3Files) {
    await uploadToS3(urlData.url, zipBlob); // Waits for each to complete
}
```
**Impact:** Very slow for datasets with many chunks

### 2. No Progress Tracking
**Issue:** Only console.log statements, no UI feedback
**Impact:** Users cannot monitor upload progress

### 3. No Retry Mechanism
**Issue:** Single network failure aborts entire upload
**Impact:** Poor reliability on unstable connections

### 4. Memory Inefficiency
**Issue:** Entire ZIP generated in memory before upload
```javascript
const zipBlob = await zip.generateAsync({ type: 'blob' });
```
**Impact:** Can crash browser with large chunks

### 5. Fixed Chunk Size
**Issue:** IMG_NUM_IN_ZIP is constant, regardless of file sizes
**Impact:** Some chunks may be very large (many high-res images)

### 6. No Resume Support
**Issue:** Browser refresh loses all progress
**Impact:** Large uploads must restart from beginning

## Recommended Improvements

### Priority 1: Parallel Upload with Concurrency Control

```javascript
const CONCURRENT_UPLOADS = 3;

const uploadChunksInParallel = async (s3Files, presignedUrls) => {
    const results = [];
    const queue = [...s3Files];
    
    const uploadWorker = async () => {
        while (queue.length > 0) {
            const file = queue.shift();
            if (!file) break;
            
            const urlData = presignedUrls.find(u => u.key === file.key);
            if (!urlData) {
                results.push({ key: file.key, status: 'error', error: 'No presigned URL' });
                continue;
            }
            
            try {
                if (file.type === 'application/json') {
                    await uploadToS3(
                        urlData.url, 
                        new Blob([file.content], { type: 'application/json' })
                    );
                } else {
                    const zipBlob = await createZipBlob(file.files);
                    await uploadToS3(urlData.url, zipBlob);
                }
                
                results.push({ key: file.key, status: 'success' });
                updateProgress(results.length, s3Files.length);
            } catch (error) {
                results.push({ key: file.key, status: 'error', error: error.message });
            }
        }
    };
    
    const workers = Array(CONCURRENT_UPLOADS).fill(null).map(() => uploadWorker());
    await Promise.all(workers);
    
    return results;
};
```

**Benefits:**
- 3x faster uploads (3 concurrent uploads)
- Better bandwidth utilization
- Maintains browser stability

### Priority 2: Progress Tracking with XMLHttpRequest

```javascript
export const uploadToS3WithProgress = async (presignedUrl, data, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                onProgress?.(percentComplete);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });
        
        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', data.type || 'application/octet-stream');
        xhr.send(data);
    });
};
```

**UI Integration:**
```javascript
const [uploadState, setUploadState] = useState({
    total: 0,
    completed: 0,
    currentChunk: '',
    percentage: 0,
    bytesUploaded: 0,
    totalBytes: 0
});

const updateProgress = (completed, total, chunkName, percentage) => {
    setUploadState({
        total,
        completed,
        currentChunk: chunkName,
        percentage: Math.round((completed / total) * 100)
    });
};
```

### Priority 3: Retry Logic with Exponential Backoff

```javascript
const uploadWithRetry = async (
    presignedUrl, 
    data, 
    maxRetries = 3,
    onProgress = null
) => {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            if (onProgress) {
                return await uploadToS3WithProgress(presignedUrl, data, onProgress);
            }
            return await uploadToS3(presignedUrl, data);
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries - 1) {
                throw error;
            }
            
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Upload attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
};
```

**Retry Schedule:**
- Attempt 1: Immediate
- Attempt 2: After 2 seconds
- Attempt 3: After 4 seconds
- Attempt 4: After 8 seconds (if maxRetries = 4)

### Priority 4: Dynamic Chunk Size Based on File Sizes

```javascript
const createDynamicChunks = (fileMap, targetSizeMB = 50) => {
    const chunks = [];
    const targetSizeBytes = targetSizeMB * 1024 * 1024;
    
    for (const [label, files] of fileMap.entries()) {
        let currentChunk = [];
        let currentSize = 0;
        let chunkIndex = 0;
        
        for (const file of files) {
            const fileSize = file.fileObject.size;
            
            if (currentSize + fileSize > targetSizeBytes && currentChunk.length > 0) {
                chunks.push({
                    name: label === 'unlabeled' 
                        ? `chunk_unlabel_${chunkIndex}.zip`
                        : `chunk_${label}_${chunkIndex}.zip`,
                    files: currentChunk,
                    label: label === 'unlabeled' ? null : label,
                    estimatedSize: currentSize
                });
                
                chunkIndex++;
                currentChunk = [];
                currentSize = 0;
            }
            
            currentChunk.push(file);
            currentSize += fileSize;
        }
        
        if (currentChunk.length > 0) {
            chunks.push({
                name: label === 'unlabeled'
                    ? `chunk_unlabel_${chunkIndex}.zip`
                    : `chunk_${label}_${chunkIndex}.zip`,
                files: currentChunk,
                label: label === 'unlabeled' ? null : label,
                estimatedSize: currentSize
            });
        }
    }
    
    return chunks;
};
```

**Advantages:**
- More predictable chunk sizes
- Better memory management
- Optimized for network transfer

### Priority 5: Upload State Persistence

```javascript
const UPLOAD_STATE_KEY_PREFIX = 'upload_state_';
const STATE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const saveUploadState = (datasetID, state) => {
    const stateData = {
        ...state,
        timestamp: Date.now()
    };
    localStorage.setItem(
        `${UPLOAD_STATE_KEY_PREFIX}${datasetID}`, 
        JSON.stringify(stateData)
    );
};

const getUploadState = (datasetID) => {
    const key = `${UPLOAD_STATE_KEY_PREFIX}${datasetID}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;
    
    const state = JSON.parse(stored);
    
    if (Date.now() - state.timestamp > STATE_EXPIRY_MS) {
        localStorage.removeItem(key);
        return null;
    }
    
    return state;
};

const clearUploadState = (datasetID) => {
    localStorage.removeItem(`${UPLOAD_STATE_KEY_PREFIX}${datasetID}`);
};
```

**Usage:**
```javascript
const resumeUpload = async (datasetID, s3Files, presignedUrls) => {
    const savedState = getUploadState(datasetID);
    const completedChunks = new Set(savedState?.completedChunks || []);
    
    const remainingFiles = s3Files.filter(file => !completedChunks.has(file.key));
    
    for (const file of remainingFiles) {
        await uploadFile(file);
        completedChunks.add(file.key);
        
        saveUploadState(datasetID, {
            completedChunks: Array.from(completedChunks),
            totalFiles: s3Files.length
        });
    }
    
    clearUploadState(datasetID);
};
```

## Performance Optimization

### Compression Level Tuning

```javascript
const getOptimalCompressionLevel = (fileCount, totalSizeBytes) => {
    const averageFileSize = totalSizeBytes / fileCount;
    
    if (fileCount > 1000) return 3;
    if (averageFileSize > 5 * 1024 * 1024) return 6;
    if (averageFileSize < 100 * 1024) return 9;
    
    return 6;
};

const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
        level: getOptimalCompressionLevel(files.length, totalSize)
    },
    streamFiles: true
});
```

### Memory Management

```javascript
const processFilesInBatches = async (files, batchSize = 10) => {
    const zip = new JSZip();
    
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        for (const file of batch) {
            zip.file(file.path, file.fileObject);
        }
        
        if (i + batchSize < files.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    return zip.generateAsync({
        type: 'blob',
        streamFiles: true
    });
};
```

## Error Handling

### Comprehensive Error Types

```javascript
class UploadError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'UploadError';
        this.code = code;
        this.details = details;
    }
}

const ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    S3_ERROR: 'S3_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    ZIP_ERROR: 'ZIP_ERROR',
    PRESIGN_ERROR: 'PRESIGN_ERROR'
};

const handleUploadError = (error, context) => {
    if (error.response?.status === 403) {
        throw new UploadError(
            'Presigned URL expired or invalid',
            ERROR_CODES.PRESIGN_ERROR,
            { originalError: error, context }
        );
    }
    
    if (error.response?.status >= 500) {
        throw new UploadError(
            'S3 service error',
            ERROR_CODES.S3_ERROR,
            { status: error.response.status, context }
        );
    }
    
    if (!navigator.onLine) {
        throw new UploadError(
            'No internet connection',
            ERROR_CODES.NETWORK_ERROR,
            { context }
        );
    }
    
    throw error;
};
```

## Testing Recommendations

### Unit Tests

```javascript
describe('createChunks', () => {
    test('should divide files into chunks of specified size', () => {
        const fileMap = new Map([
            ['dog', Array(250).fill({ path: 'dog/img.jpg', fileObject: new File([], 'img.jpg') })]
        ]);
        
        const chunks = createChunks(fileMap, 100);
        
        expect(chunks).toHaveLength(3);
        expect(chunks[0].files).toHaveLength(100);
        expect(chunks[1].files).toHaveLength(100);
        expect(chunks[2].files).toHaveLength(50);
    });
    
    test('should handle unlabeled files correctly', () => {
        const fileMap = new Map([
            ['unlabeled', [{ path: 'img.jpg', fileObject: new File([], 'img.jpg') }]]
        ]);
        
        const chunks = createChunks(fileMap, 100);
        
        expect(chunks[0].name).toBe('chunk_unlabel_0.zip');
        expect(chunks[0].label).toBeNull();
    });
});
```

### Integration Tests

```javascript
describe('Upload Flow', () => {
    test('should upload all chunks successfully', async () => {
        const mockFiles = createMockFiles(150);
        const fileMap = organizeFiles(mockFiles);
        const chunks = createChunks(fileMap, 100);
        
        const presignedUrls = chunks.map(chunk => ({
            key: `dataset/zip/${chunk.name}`,
            url: 'https://mock-s3-url.com'
        }));
        
        const results = await uploadChunksInParallel(chunks, presignedUrls);
        
        expect(results.every(r => r.status === 'success')).toBe(true);
    });
});
```

## API Reference

### Functions

#### organizeFiles(files)
Organizes files by label based on directory structure.

**Parameters:**
- `files` (Array): Array of file objects with path and fileObject properties

**Returns:**
- Map<string, Array>: Map of label to array of files

#### createChunks(fileMap, chunkSize)
Divides organized files into chunks of specified size.

**Parameters:**
- `fileMap` (Map): Map of label to files
- `chunkSize` (number): Maximum files per chunk

**Returns:**
- Array<Object>: Array of chunk objects

#### uploadToS3(presignedUrl, data)
Uploads data to S3 using presigned URL.

**Parameters:**
- `presignedUrl` (string): S3 presigned URL
- `data` (Blob|File): Data to upload

**Returns:**
- Promise<boolean>: True if successful

## Configuration

### Constants

```javascript
// File: src/constants/file.js
export const IMG_NUM_IN_ZIP = 100; // Images per chunk
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
```

### Environment Variables

```
REACT_APP_MAX_CONCURRENT_UPLOADS=3
REACT_APP_UPLOAD_RETRY_ATTEMPTS=3
REACT_APP_CHUNK_SIZE_MB=50
```

## Monitoring and Logging

### Recommended Metrics

```javascript
const logUploadMetrics = {
    datasetId: string,
    totalFiles: number,
    totalChunks: number,
    totalSizeMB: number,
    startTime: timestamp,
    endTime: timestamp,
    duration: number,
    successfulChunks: number,
    failedChunks: number,
    averageChunkSizeMB: number,
    uploadSpeedMBps: number
};
```

## Migration Guide

To implement the recommended improvements:

1. Replace sequential upload loop with parallel upload function
2. Add progress tracking state management
3. Implement retry logic wrapper around upload calls
4. Update chunk creation to use dynamic sizing
5. Add upload state persistence hooks
6. Update UI components to display progress

Each improvement can be implemented incrementally without breaking existing functionality.

