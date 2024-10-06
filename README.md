
# Node.js Analytics Application

This is a Node.js application designed to generate and analyze random analytics and uptime data. It provides APIs for data retrieval and management, and includes scripts to generate mock data.


## Installation

#### Clone the repository:

```bash
https://github.com/aravindpj/Node.js-Analytics-Application.git
cd project-name

```
#### Install dependencies:

```bash
npm install
```

#### Setup environment variables:
Create a `config.env` file in the root directory and add the required environment variables. Example
```bash
PORT=4000
DATABASE=mongodb atlas url
NODE_ENV=development
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=60
```

#### Run the Application
To start the server, use the command:
```bash
npm start
```





## API Documentation

For detailed API documentation and examples of requests, please refer to our Postman collection:

[API Documentation on Posman](https://documenter.getpostman.com/view/22641994/2sAXqmBQtS)


## Generated Data and Upload Script

The project contains random analytics and uptime data that can be uploaded to your database using the provided script

### Uploading Data:
#### Clear the Database:
- Before uploading new data, ensure the database is cleared to avoid duplicate records

#### Run the Upload Script:

- The script uploadData.js is provided to upload random data stored in JSON files. After clearing the database, you can upload the data again by running the following command:

```bash
 node uploadData.js
```
#### View Uploaded Data:
Once the data has been uploaded, you can access it through the API endpoints.


