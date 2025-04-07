# Deployment Guide for CHARA FASHION AND FRAGRANCE

This guide will help you deploy your Flask application with PostgreSQL database to Render.com.

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

### 3. Create a PostgreSQL Database

1. From your Render dashboard, click "New" and select "PostgreSQL".
2. Configure the database:
   - Name: `chara-fashion-db` (or any name you prefer)
   - Database: `chara_fashion_db`
   - User: (Render will generate this)
   - Choose the free plan or another plan based on your needs
3. Click "Create Database" and wait for it to be provisioned
4. Once created, note the "External Database URL" - you'll need this for the next step

### 4. Create a New Web Service

1. From your Render dashboard, click "New" and select "Web Service".
2. Connect your Git repository.
3. Configure the service:
   - Name: `chara-fashion` (or any name you prefer)
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn main:app`
   - Instance Type: Free (or choose a paid plan if you need more resources)

### 5. Set Environment Variables

Add the following environment variables:
- Key: `SESSION_SECRET`
  - Value: (Generate a random string or secure password)
- Key: `DATABASE_URL`
  - Value: (Paste the "External Database URL" from your PostgreSQL database)

### 6. Deploy

Click "Create Web Service" and Render will begin deploying your application. This may take a few minutes.

### 7. Access Your Application

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
- Your application uses a PostgreSQL database provided by Render, which is persistent and will maintain your data even when the service restarts.
- The free tier PostgreSQL database on Render has some limitations on storage and connections. Monitor your usage if you expect high traffic.

## Troubleshooting

If your application fails to deploy or isn't working correctly:

1. Check the logs in your Render dashboard
2. Ensure all dependencies are listed in `requirements.txt` (especially psycopg2-binary for PostgreSQL)
3. Make sure your start command is correct
4. Verify that all necessary environment variables are set
5. Check PostgreSQL connection by viewing the logs