const express = require('express');
const router = express.Router();
const multer = require('multer');
const imagekit = require('../config/imagekit');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');

// Multer storage (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname || `upload_${Date.now()}`,
      folder: '/banners', // Change folder if needed
    });

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.url,
      fileId: result.fileId,
      filePath: result.filePath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// Add link preview endpoint for Editor.js LinkTool
router.post('/fetchUrl', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: 0, error: 'No URL provided' });
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const getMeta = (name) =>
      $(`meta[name='${name}']`).attr('content') ||
      $(`meta[property='og:${name}']`).attr('content') ||
      $(`meta[property='twitter:${name}']`).attr('content') || '';
    const title = $('title').text() || getMeta('title');
    const description = getMeta('description');
    const image = getMeta('image');
    res.json({
      success: 1,
      meta: {
        title,
        description,
        image,
      },
    });
  } catch (err) {
    res.status(500).json({ success: 0, error: 'Failed to fetch link preview', details: err.message });
  }
});

// Get all images from ImageKit folder
router.get('/images', async (req, res) => {
  try {
    // Try to get images from banners folder first
    let result = await imagekit.listFiles({
      path: '/banners',
      sort: 'DESC_CREATED',
      limit: 30,
    });

    // If no images in banners folder, get all images
    if (result.length === 0) {
      result = await imagekit.listFiles({
        sort: 'DESC_CREATED',
        limit: 30,
      });
    }

    res.json(result);
  } catch (err) {
    console.error('ImageKit listFiles error:', err);
    res.status(500).json({ error: 'Failed to fetch images', details: err.message });
  }
});

// Delete image by fileId
router.delete('/delete/:fileId', async (req, res) => {
  const fileId = req.params.fileId; // gets everything after /delete/
  try {
    const result = await imagekit.deleteFile(fileId);
    res.json({ message: 'Deleted', result });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', details: err });
  }
});

// Alternative delete by URL
router.post('/delete', async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const extractImageKitFileId = require('../utils/extractImageKitFileId');
    const filePath = extractImageKitFileId(imageUrl);
    
    if (!filePath) {
      return res.status(400).json({ error: 'Invalid ImageKit URL' });
    }

    // List files to find the file by path
    const files = await imagekit.listFiles({
      path: '/' + filePath.split('/').slice(0, -1).join('/'),
      searchQuery: `name="${filePath.split('/').pop().split('.')[0]}"`,
    });

    if (files.length > 0) {
      const result = await imagekit.deleteFile(files[0].fileId);
      res.json({ message: 'Deleted', result });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

module.exports = router;
