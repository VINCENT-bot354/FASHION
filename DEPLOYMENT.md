# Deployment Guide for CHARA WARDROBES AND PERFUMES

This guide will help you deploy your Flask application to Render.com.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account to host your code
- A Render account (free tier available)

## Steps to Deploy

### 1. Push your code to a Git repository

First, create a repository on GitHub, GitLab, or Bitbucket and push your code there:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

### 2. Sign up for Render

Go to [Render](https://render.com/) and sign up for an account if you don't have one already.

### 3. Create a New Web Service

1. From your Render dashboard, click "New" and select "Web Service".
2. Connect your Git repository.
3. Configure the service:
   - Name: `chara-wardrobes` (or any name you prefer)
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn main:app`
   - Instance Type: Free (or choose a paid plan if you need more resources)

### 4. Set Environment Variables

Add the following environment variable:
- Key: `SESSION_SECRET`
- Value: (Generate a random string or secure password)

### 5. Deploy

Click "Create Web Service" and Render will begin deploying your application. This may take a few minutes.

### 6. Access Your Application

Once the deployment is complete, you can access your application using the URL provided by Render (typically something like `https://your-service-name.onrender.com`).

## Updating Your Application

When you make changes to your code:

1. Push the changes to your Git repository:
```bash
git add .
git commit -m "Description of changes"
git push
```

2. Render will automatically detect the changes and deploy the updated version.

## Important Notes

- Make sure the `UPLOAD_FOLDER` exists on Render. Render has an ephemeral filesystem, so any uploaded images will be lost when the service restarts. For production, consider using a service like AWS S3 for file storage.
- Your application stores product data in a JSON file. Render's filesystem is ephemeral, meaning that changes to files will be lost when the service restarts. For a more permanent solution, consider migrating to a database like PostgreSQL (which Render offers) for production.

## Troubleshooting

If your application fails to deploy or isn't working correctly:

1. Check the logs in your Render dashboard
2. Ensure all dependencies are listed in `requirements.txt`
3. Make sure your start command is correct
4. Verify that all necessary environment variables are set