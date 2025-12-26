// ImagePickerViewer.jsx
import { defineComponent, ref, onBeforeUnmount } from 'vue';
import { css } from 'goober';

export default defineComponent({
  name: 'ImageEncoding',
  setup() {
    // State management
    const selectedImage = ref(null);
    const blobUrl = ref('');
    const fileInputRef = ref(null);
    const imageInfo = ref({
      name: '',
      size: 0,
      type: '',
      lastModified: null
    });
    const loading = ref(false);
    const encodingResult = ref('');
    const isEncoding = ref(false);

    // Handle file selection
    function handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      processImageFile(file);
    }

    // Process the selected image file
    async function processImageFile(file) {
      loading.value = true;

      try {
        // Create blob URL
        if (blobUrl.value) {
          URL.revokeObjectURL(blobUrl.value);
        }

        const url = URL.createObjectURL(file);
        blobUrl.value = url;

        // Set image info
        imageInfo.value = {
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          lastModified: new Date(file.lastModified).toLocaleDateString(),
          actualSize: file.size,
          mimeType: file.type
        };

        selectedImage.value = {
          id: 'uploaded-' + Date.now(),
          name: file.name,
          url: url,
          size: formatFileSize(file.size),
          dimensions: 'Loading...',
          date: 'Just now'
        };

        // Get image dimensions
        await getImageDimensions(url);

      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image file');
      } finally {
        loading.value = false;
      }
    }

    // Get image dimensions
    function getImageDimensions(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          selectedImage.value.dimensions = `${img.width}x${img.height}`;
          imageInfo.value.dimensions = `${img.width}x${img.height}`;
          resolve();
        };
        img.onerror = () => {
          selectedImage.value.dimensions = 'Unknown';
          imageInfo.value.dimensions = 'Unknown';
          resolve();
        };
        img.src = url;
      });
    }

    // Convert file to base64
    function convertToBase64() {
      if (!selectedImage.value) {
        alert('Please select an image first');
        return;
      }

      isEncoding.value = true;

      fetch(selectedImage.value.url)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result;
            encodingResult.value = base64;
            isEncoding.value = false;
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          console.error('Error converting to base64:', error);
          encodingResult.value = 'Error: ' + error.message;
          isEncoding.value = false;
        });
    }

    // Clear everything
    function clearAll() {
      if (blobUrl.value && blobUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl.value);
      }
      selectedImage.value = null;
      blobUrl.value = '';
      encodingResult.value = '';
      imageInfo.value = {
        name: '',
        size: 0,
        type: '',
        lastModified: null
      };

      // Clear file input
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    }

    // Open file picker
    function openFilePicker() {
      fileInputRef.value?.click();
    }

    // Copy base64 to clipboard
    function copyToClipboard() {
      if (!encodingResult.value) return;

      navigator.clipboard.writeText(encodingResult.value)
        .then(() => {
          // Show temporary success message
          const copyBtn = document.querySelector('.copy-button');
          if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = 'rgba(100, 255, 100, 0.1)';
            copyBtn.style.borderColor = 'rgba(100, 255, 100, 0.2)';
            copyBtn.style.color = '#99ff99';

            setTimeout(() => {
              copyBtn.textContent = originalText;
              copyBtn.style.background = 'rgba(100, 180, 255, 0.1)';
              copyBtn.style.borderColor = 'rgba(100, 180, 255, 0.2)';
              copyBtn.style.color = '#a7d7ff';
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          alert('Failed to copy to clipboard');
        });
    }

    // Helper functions
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Cleanup on unmount
    onBeforeUnmount(() => {
      if (blobUrl.value && blobUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl.value);
      }
    });

    return () => (
      <div class={s.app}>
        <div class={s.headerContainer}>
          <h1 class={s.title}>
            <svg class={s.titleIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Image to Base64 Converter
          </h1>
          <p class={s.subtitle}>Upload images to convert them to Base64 format</p>
        </div>

        <div class={s.content}>
          {/* Left panel - Image selection */}
          <div class={s.leftPanel}>
            <div class={s.uploadSection}>
              <div class={s.uploadCard} onClick={openFilePicker}>
                <svg class={s.uploadIcon} width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div class={s.uploadText}>
                  <div class={s.uploadTitle}>Click to upload an image</div>
                  <div class={s.uploadSubtitle}>or drag and drop</div>
                </div>
                <div class={s.uploadFormat}>PNG, JPG, WEBP, GIF up to 10MB</div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style="display: none"
                onChange={handleFileSelect}
              />
            </div>

            {selectedImage.value && (
              <div class={s.imageInfoCard}>
                <h4>Selected Image</h4>
                <div class={s.infoRow}>
                  <span class={s.infoLabel}>Name:</span>
                  <span class={s.infoValue}>{imageInfo.value.name}</span>
                </div>
                <div class={s.infoRow}>
                  <span class={s.infoLabel}>Size:</span>
                  <span class={s.infoValue}>{imageInfo.value.size}</span>
                </div>
                <div class={s.infoRow}>
                  <span class={s.infoLabel}>Dimensions:</span>
                  <span class={s.infoValue}>{imageInfo.value.dimensions}</span>
                </div>
                <div class={s.infoRow}>
                  <span class={s.infoLabel}>Type:</span>
                  <span class={s.infoValue}>{imageInfo.value.type}</span>
                </div>
                <button
                  class={s.convertButton}
                  onClick={convertToBase64}
                  disabled={loading.value || isEncoding.value}
                >
                  Convert to Base64
                </button>
              </div>
            )}
          </div>

          {/* Right panel - Base64 output */}
          <div class={s.rightPanel}>
            <div class={s.outputSection}>
              <div class={s.outputHeader}>
                <h3>Base64 Output</h3>
                {encodingResult.value && (
                  <button class={`${s.copyButton} copy-button`} onClick={copyToClipboard}>
                    Copy Base64
                  </button>
                )}
              </div>

              {encodingResult.value ? (
                <div class={s.outputContent}>
                  <div class={s.stats}>
                    <span>Length: {encodingResult.value.length} characters</span>
                    <span>Type: {imageInfo.value.type}</span>
                  </div>
                  <pre class={s.base64Output}>{encodingResult.value}</pre>
                </div>
              ) : (
                <div class={s.emptyState}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M13 10V3L4 14H11V21L20 10H13Z"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div class={s.emptyText}>Base64 output will appear here</div>
                  <div class={s.emptySubtext}>Upload an image and click "Convert to Base64"</div>
                </div>
              )}

              {(loading.value || isEncoding.value) && (
                <div class={s.loadingOverlay}>
                  <div class={s.spinner}></div>
                  {loading.value ? 'Loading image...' : 'Converting to Base64...'}
                </div>
              )}
            </div>

            <div class={s.instructions}>
              <h4>How to use:</h4>
              <ol class={s.instructionList}>
                <li>Upload an image using the upload area</li>
                <li>Click "Convert to Base64" button</li>
                <li>Copy the Base64 string using the copy button</li>
                <li>Use the Base64 string in your application</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

const s = {
  app: css`
    min-height: 100vh;
    padding: 28px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: Inter, system-ui;
    color: #e6eef8;
    background: #0a0e1a;
  `,
  headerContainer: css`
    margin-bottom: 28px;
  `,
  title: css`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px;
    color: #f1f8ff;
  `,
  titleIcon: css`
    color: #64b4ff;
  `,
  subtitle: css`
    font-size: 14px;
    color: rgba(230, 240, 255, 0.6);
    margin: 0;
  `,
  content: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  `,
  leftPanel: css`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  uploadSection: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  uploadCard: css`
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border: 2px dashed rgba(100, 180, 255, 0.2);
    border-radius: 16px;
    padding: 60px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
      border-color: rgba(100, 180, 255, 0.4);
      background: rgba(100, 180, 255, 0.03);
      transform: translateY(-2px);
    }
  `,
  uploadIcon: css`
    color: #64b4ff;
  `,
  uploadText: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  uploadTitle: css`
    font-weight: 600;
    color: #eaf4ff;
    font-size: 16px;
  `,
  uploadSubtitle: css`
    font-size: 14px;
    color: rgba(230, 240, 255, 0.6);
  `,
  uploadFormat: css`
    font-size: 12px;
    color: rgba(230, 240, 255, 0.4);
  `,
  imageInfoCard: css`
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.03);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(2,6,23,0.6);

    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #f1f8ff;
    }
  `,
  infoRow: css`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    margin-bottom: 8px;
  `,
  infoLabel: css`
    color: rgba(230, 240, 255, 0.6);
    min-width: 80px;
  `,
  infoValue: css`
    color: #eaf4ff;
    word-break: break-all;
  `,
  convertButton: css`
    width: 100%;
    margin-top: 20px;
    background: linear-gradient(135deg, rgba(100, 180, 255, 0.15), rgba(100, 180, 255, 0.1));
    border: 1px solid rgba(100, 180, 255, 0.2);
    color: #a7d7ff;
    padding: 14px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(100, 180, 255, 0.25), rgba(100, 180, 255, 0.2));
      border-color: rgba(100, 180, 255, 0.3);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
  rightPanel: css`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  outputSection: css`
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.03);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(2,6,23,0.6);
    position: relative;
    min-height: 500px;
  `,
  outputHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #f1f8ff;
    }
  `,
  copyButton: css`
    background: rgba(100, 180, 255, 0.1);
    border: 1px solid rgba(100, 180, 255, 0.2);
    color: #a7d7ff;
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;

    &:hover {
      background: rgba(100, 180, 255, 0.15);
      border-color: rgba(100, 180, 255, 0.3);
    }
  `,
  outputContent: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  stats: css`
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: rgba(230, 240, 255, 0.6);
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  `,
  base64Output: css`
    margin: 0;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    line-height: 1.4;
    color: rgba(230, 240, 255, 0.8);
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 400px;
    overflow-y: auto;
    padding: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);
  `,
  loadingOverlay: css`
    position: absolute;
    inset: 0;
    background: rgba(10, 14, 26, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: rgba(230, 240, 255, 0.7);
    font-size: 14px;
    border-radius: 16px;
    backdrop-filter: blur(2px);
  `,
  spinner: css`
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: rgba(100, 180, 255, 0.8);
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
  emptyState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    height: 400px;
    color: rgba(230, 240, 255, 0.4);
    text-align: center;

    svg {
      color: rgba(100, 180, 255, 0.2);
    }
  `,
  emptyText: css`
    font-size: 16px;
    font-weight: 500;
    color: rgba(230, 240, 255, 0.6);
  `,
  emptySubtext: css`
    font-size: 14px;
    color: rgba(230, 240, 255, 0.4);
  `,
  instructions: css`
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.03);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(2,6,23,0.6);

    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #f1f8ff;
    }
  `,
  instructionList: css`
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: rgba(230, 240, 255, 0.7);
    font-size: 14px;
    line-height: 1.5;

    li {
      padding-left: 8px;
    }
  `,
};
