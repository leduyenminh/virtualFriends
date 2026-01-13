# API Keys Setup

## SerpAPI (Web Search)
1. Go to https://serpapi.com/
2. Sign up for an account.
3. Get your API key from the dashboard.
4. Set environment variable: `SERP_API_KEY=your_key`

## Google Sheets API
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing.
3. Enable Google Sheets API.
4. Create a Service Account: IAM & Admin > Service Accounts > Create Service Account.
5. Generate a key (JSON) for the service account.
6. Download the JSON file and place it in the project (e.g., /path/to/credentials.json).
7. Set environment variable: `GOOGLE_CREDENTIALS_PATH=/path/to/credentials.json`
8. Share the created sheets with the service account email if needed.

## Microsoft Graph API (PowerPoint)
1. Go to Azure Portal: https://portal.azure.com/
2. Register an app: Azure Active Directory > App registrations > New registration.
3. Note the Application (client) ID and Directory (tenant) ID.
4. Add a client secret: Certificates & secrets > New client secret.
5. Set environment variables:
   - `MICROSOFT_CLIENT_ID=your_client_id`
   - `MICROSOFT_CLIENT_SECRET=your_client_secret`
   - `MICROSOFT_TENANT_ID=your_tenant_id`
6. Grant permissions: API permissions > Add permission > Microsoft Graph > Application permissions (e.g., Files.ReadWrite.All).

## Canva API
1. Go to Canva Developers: https://www.canva.com/developers/
2. Sign up and get API key.
3. Set environment variable: `CANVA_API_KEY=your_key`

## Adobe Lightroom API
1. Adobe Creative SDK: https://www.adobe.io/apis/creativecloud.html
2. Register app and get credentials.
3. Set environment variables as needed.

Note: For full OAuth user flows, additional setup is required, but this uses service accounts/app-only auth for server-side operations.