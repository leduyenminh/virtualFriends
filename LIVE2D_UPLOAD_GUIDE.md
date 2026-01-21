# How to Import Live2D Models for Your Chatbot

This guide explains how to upload and use Live2D avatar models in your Magent chatbot application.

## Prerequisites

Before uploading Live2D models, ensure you have:

1. **Live2D Model Files**: A ZIP file containing your Live2D model files
2. **Thumbnail Image**: A representative image (JPG/PNG/GIF) for the avatar
3. **AvatarService Running**: The backend AvatarService must be running on port 8083

## Step-by-Step Guide

### 1. Access the Avatar Selector

1. Open your Magent chatbot application in the browser
2. The avatar section will display on the left side of the chat interface
3. You'll see existing avatars in a grid layout

### 2. Open the Upload Modal

1. Click the **"+ Upload New Avatar"** button in the avatar gallery header
2. This opens the Live2D model upload modal

### 3. Fill in Avatar Information

Complete the required fields:

- **Avatar Name** (required): Give your avatar a descriptive name
- **Description** (required): Describe your avatar's personality or appearance
- **Category**: Choose from:
  - Character (default)
  - Animal
  - Fantasy
  - Robot
  - Other
- **Tags** (optional): Add comma-separated tags like "cute, anime, character"

### 4. Upload Model Files

#### Live2D Model File (Required)
- Click the file drop zone or drag & drop your ZIP file
- The ZIP should contain your Live2D model files:
  - `.moc3` file (model definition)
  - Texture images (`.png`)
  - Motion files (optional)
  - Expression files (optional)
  - Physics files (optional)

**Supported formats**: `.zip` files only

#### Thumbnail Image (Required)
- Click the image drop zone or drag & drop an image
- Recommended size: 256x256 pixels
- Supported formats: JPG, PNG, GIF

### 5. Upload and Preview

1. Click **"Upload Avatar"** to start the upload process
2. The system will:
   - Validate the model files
   - Extract and store the Live2D model
   - Save the thumbnail image
   - Create the avatar record in the database

3. Once uploaded, the new avatar will appear in your gallery
4. The avatar will be automatically selected for preview

### 6. Test the Avatar

1. Use the emotion buttons (😐😊😢😠) to test different expressions
2. The avatar will display visual feedback based on the selected emotion
3. Chat with the bot to see emotion changes based on responses

## File Structure Requirements

Your Live2D model ZIP file should contain:

```
model.zip/
├── model.moc3          # Main model file
├── texture_00.png      # Texture images
├── texture_01.png      # (multiple textures supported)
├── motions/            # Optional motion folder
│   ├── idle.motion3.json
│   └── talk.motion3.json
├── expressions/        # Optional expression folder
│   ├── neutral.exp3.json
│   └── happy.exp3.json
└── physics/           # Optional physics folder
    └── physics3.json
```

## Troubleshooting

### Upload Fails
- **Check file sizes**: Models should be under 50MB total
- **Verify ZIP contents**: Ensure `.moc3` file is present
- **Check image format**: Thumbnail must be JPG, PNG, or GIF

### Avatar Doesn't Display
- **Check browser console** for JavaScript errors
- **Verify AvatarService** is running on port 8083
- **Check network tab** for failed API calls

### Model Validation Errors
- **Invalid model file**: Ensure `.moc3` file is valid Live2D format
- **Missing textures**: All referenced textures must be included
- **Corrupted ZIP**: Try re-zipping your model files

## API Endpoints

The upload process uses these backend endpoints:

- `POST /api/avatar/models` - Upload new avatar
- `GET /api/avatar/models` - List all avatars
- `GET /api/avatar/models/{id}/config` - Get Live2D configuration
- `GET /api/avatar/models/{id}/texture` - Get avatar texture

## Supported Live2D Features

Currently supported:
- ✅ Basic model rendering with PIXI.js
- ✅ Texture loading and display
- ✅ Emotion-based visual effects (tint, scale)
- ✅ Thumbnail preview
- ✅ Model validation

Future enhancements:
- 🔄 Full Live2D Cubism SDK integration
- 🔄 Motion playback
- 🔄 Expression animations
- 🔄 Physics simulation

## Tips for Best Results

1. **Optimize textures**: Use compressed PNGs for better performance
2. **Test emotions**: Upload avatars that work well with the emotion system
3. **Choose good thumbnails**: Clear, recognizable images for the gallery
4. **Use descriptive names**: Make it easy to find avatars in your collection

## Need Help?

If you encounter issues:
1. Check the browser developer console for errors
2. Verify all services are running (AvatarService on port 8083)
3. Ensure your Live2D model is compatible with Live2D Cubism 3.0+
4. Check the application logs for backend errors