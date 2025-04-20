const express = require('express');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const app = express();
const port = 3000;

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST request to upload an image
app.post('/upload-image', async (req, res) => {
  const { robloSecurityCookie, csrfToken, userId, filePath, displayName, description, assetType } = req.body;

  if (!robloSecurityCookie || !csrfToken || !userId || !filePath || !displayName || !description || !assetType) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Function to upload the image
    const uploadResponse = await uploadImage(filePath, displayName, description, assetType, robloSecurityCookie, csrfToken, userId);
    res.status(200).json({ message: 'Image uploaded successfully', data: uploadResponse });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image' });
  }
});

// Function to upload the image
async function uploadImage(filePath, displayName, description, assetType, robloSecurityCookie, csrfToken, userId) {
  try {
    const form = new FormData();
    form.append('fileContent', fs.createReadStream(filePath));
    form.append('request', JSON.stringify({
      displayName,
      description,
      assetType,
      creationContext: {
        creator: {
          userId,
        },
        expectedPrice: 0,
      },
    }));

    const response = await axios.post('https://apis.roblox.com/assets/user-auth/v1/assets', form, {
      headers: {
        ...form.getHeaders(),
        'X-CSRF-TOKEN': csrfToken,
        'Cookie': `.ROBLOSECURITY=${robloSecurityCookie}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
