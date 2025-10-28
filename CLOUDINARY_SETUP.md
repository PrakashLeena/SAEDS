# Cloudinary Integration Guide

## Overview
This project uses Cloudinary for managing and storing:
- **Member Profile Photos** - User profile images
- **Book Cover Images** - Book cover artwork
- **Book PDFs** - Digital book files

## Configuration

### Backend Setup

1. **Environment Variables**
   Add these to your `.env` file in the backend directory:
   ```env
   CLOUDINARY_CLOUD_NAME=ds2z0fox9
   CLOUDINARY_API_KEY=128966933841541
   CLOUDINARY_API_SECRET=SgEU1B33BQOPwfrjOw--MWLdFc4
   ```

2. **Cloudinary Folders Structure**
   Files are organized in the following folders:
   - `saeds/profile-photos/` - User profile images
   - `saeds/book-covers/` - Book cover images
   - `saeds/book-pdfs/` - Book PDF files

### API Endpoints

#### Upload Profile Photo
```
POST /api/upload/profile-photo
Content-Type: multipart/form-data
Body: profilePhoto (file)
```

#### Upload Book Cover
```
POST /api/upload/book-cover
Content-Type: multipart/form-data
Body: coverImage (file)
```

#### Upload Book PDF
```
POST /api/upload/book-pdf
Content-Type: multipart/form-data
Body: pdfFile (file)
```

#### Delete File
```
DELETE /api/upload/delete/:publicId
```

### File Constraints

| File Type | Max Size | Allowed Formats |
|-----------|----------|-----------------|
| Profile Photos | 5 MB | JPG, PNG, GIF, WEBP |
| Book Covers | 5 MB | JPG, PNG, GIF, WEBP |
| Book PDFs | 50 MB | PDF |

## Frontend Usage

### UserForm Component
The UserForm now includes:
- Drag & drop photo upload
- Photo preview with remove option
- Manual URL input as fallback
- Upload progress indication

### BookForm Component
The BookForm now includes:
- Cover image upload with preview
- PDF upload with status indicator
- Replace/remove functionality
- Manual URL input for both cover and PDF

## Features

✅ **Direct File Upload** - Upload files directly from the admin panel  
✅ **Cloud Storage** - All files stored securely on Cloudinary  
✅ **Automatic Optimization** - Images automatically optimized for web  
✅ **CDN Delivery** - Fast global content delivery  
✅ **File Validation** - Type and size validation before upload  
✅ **Preview Support** - Live preview of uploaded images  
✅ **Fallback URLs** - Manual URL input option available  

## Security Notes

⚠️ **Important**: Never commit your `.env` file to version control!

The `.env` file is already in `.gitignore` to prevent accidental commits.

## Cloudinary Account Details

- **Cloud Name**: ds2z0fox9
- **Key Name**: Root
- **Dashboard**: https://console.cloudinary.com/

## Testing

To test the upload functionality:

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Navigate to the admin panel:
   - Add Member: `/admin/users/add`
   - Add Book: `/admin/books/add`

3. Try uploading:
   - A profile photo (JPG/PNG, < 5MB)
   - A book cover (JPG/PNG, < 5MB)
   - A book PDF (PDF, < 50MB)

## Troubleshooting

### Upload fails with "Failed to upload"
- Check your internet connection
- Verify Cloudinary credentials in `.env`
- Check file size limits
- Ensure file type is supported

### Images not displaying
- Verify the URL returned from Cloudinary
- Check browser console for CORS errors
- Ensure Cloudinary account is active

### PDF upload timeout
- Large PDFs may take time to upload
- Check file size (max 50MB)
- Verify stable internet connection

## Support

For Cloudinary-specific issues, refer to:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
