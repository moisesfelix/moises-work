The backend structure has been created in `packages/functions` as requested.

Here is a summary of the new structure:

-   `packages/functions/src/api/services/gemini.service.ts`: This service contains the core logic for interacting with the Google Gemini API. It's adapted from your frontend service to run in a Node.js environment.
-   `packages/functions/src/api/controllers/gemini.controller.ts`: This controller handles the incoming HTTP requests, calls the appropriate service methods, and sends the responses.
-   `packages/functions/src/api/routes/gemini.routes.ts`: This file defines the API endpoints (e.g., `/api/v1/gemini/generate-article`) and maps them to the controller functions.
-   `packages/functions/src/api/index.ts`: This sets up the main Express application, including middleware for CORS and JSON parsing, and registers the API routes.
-   `packages/functions/src/index.ts`: This is the entry point for your Firebase Functions, which exports the Express app as a cloud function.

The API endpoints are available under the `/api/v1/gemini` prefix. For example, to generate an article, you would make a POST request to `/api/v1/gemini/generate-article`.

**Important:** For the service to work, you need to set your Gemini API key in the Firebase environment configuration. You can do this by running the following command in your terminal:

```bash
firebase functions:config:set gemini.key="YOUR_API_KEY"
```

After setting the key, you will need to deploy your functions for the configuration to be applied:

```bash
firebase deploy --only functions
```
