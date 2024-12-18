# CollaborHub: Data Science Solutions Website
This is an innovative platform where data providers can provide data securely to model trainers through the platform to train the model. The model trainer can't access the data directly. Model trainers can just use the data to train. The folder structure and some basic functionalities are allowed (i.e., .head()) for training. When the model trainer writes the code, Gemini checks it, and either approves or rejects it. If the model trainer writes any such code that violates the data provider's data privacy, Gemini rejects that, and the code cell doesn't execute. Setup the project and check out the 'Federated Training". 

## Demo

This is the demo video link of the project: [https://youtu.be/eAFerDGQ3os?si=ttllP5-pXwUlZyZ3](https://youtu.be/eAFerDGQ3os?si=ttllP5-pXwUlZyZ3)

## Installation 
To install the project, clone the repository: 
```bash
git clone https://github.com/1203mueed/Data-Science-Solutions-Website.git
cd Data-Science-Solutions-Website
```
Install the dependencies
```bash
npm install
```
## Environment Setup

**Instructions for the user:**

You need to create a `.env` file in the `src/server` folder. The `.env` file should contain the following:

```env
PYTHON_EXECUTABLE=path_to_python_exe
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_uri
```

## Starting the Application

#### Start the Server
From the project’s root directory, run:
```bash
node src/server/server.js
```
#### Start the Kernel
Navigate to the `src/server` directory and start the kernel:
```bash
cd src/server
python kernel_server.py
```

#### Start the React Application
Return to the project’s root directory and run:
```bash
npm start
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
