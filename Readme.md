# Backend Project

This backend project is built using Node.js, Express.js, and Mongoose, with MongoDB Atlas as the database service. The project adheres to modern industry standards to ensure scalability, maintainability, and best practices. Postman is utilized for API testing throughout the development process.

# Key Features:

## File Handling:

Utilizes Multer middleware for efficient file upload handling.

## Authentication and Authorization:

Employs refresh and access tokens for secure user authorization and session management.

## Security:

Passwords are encrypted using bcrypt to safeguard user credentials, minimizing risks in the event of data leaks.

## Cloud Storage:

Integrates Cloudinary to store images and video files securely. Cloudinary provides easily manageable URLs for server-side storage and retrieval.

## Cookie Management:

Incorporates cookie-parser to set and clear cookies as needed for session handling and user experience optimization.

## CORS Handling:

Configures CORS (Cross-Origin Resource Sharing) to define and secure allowed origins for API access.

# Core Functionalities:

The project replicates core YouTube functionalities, offering the following features:

## User Management:

Sign Up, Login, Logout

## Password Management: 

Change Password, Password Encryption

## Update User Details: 

Name, Email, Password, Profile Image, Cover Image

Fetch User Profile Details

Fetch User Watch History

Refresh Access Token

## Video Management:

Upload Video, Delete Video, Update Video Details

Search Videos

Toggle Video Visibility: Publish/Private

Fetch Video Details

## Interaction:

Watch and interact with videos uploaded by other users

Comment on Videos

Like Videos and Comments

## Playlist Management:

Create, Update, and Delete Playlists

Add and Remove Videos from Playlists

## Channel Management:

Subscribe to Channels

View Subscription List

View Subscribers List

## Miscellaneous:

Fetch User Liked Videos

Tweet Content (YouTube Community Post Style):

Create, Update, Delete Tweets

Like Tweets

## Technologies Used:

Node.js for server-side JavaScript execution

Express.js for building RESTful APIs

Mongoose for MongoDB object modeling

MongoDB Atlas for cloud database services

Cloudinary for media storage

Multer for file uploads

bcrypt for password encryption

cookie-parser for cookie management

CORS for secure cross-origin API requests

## How to Run the Project:

Clone the Repository:

[git clone](https://github.com/PushpendraJaat/videos-app-backend-like-youtube.git)

Navigate to the Project Directory:

```bash
cd videos-app-backend-like-youtube
```

## Install Dependencies:

```bash
npm install
```

## Set Up Environment Variables:

Create a .env file in the root directory.

Add the following variables:

```bash
MONGO_URI=<your_mongo_db_uri>
CLOUDINARY_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
PORT=<your_preferred_port>
CORS_ORIGIN=<your_origin_domain>
ACCESS_TOKEN_SECRET=<your_access_token>
ACCESS_TOKEN_EXPIRY=<access_token_expiry_time>
REFRESS_TOKEN_SECRET=<your_refresh_token>
REFRESS_TOKEN_EXPIRY=<your_refresh_token_expiry_time>
```

## Run the Project:

```bash
npm start
```

## API Testing:

Use Postman or any API testing tool to interact with the endpoints.

This project serves as a comprehensive backend for a video-sharing platform, closely mirroring the functionalities of YouTube while leveraging modern tools and techniques for efficient and scalable development.
