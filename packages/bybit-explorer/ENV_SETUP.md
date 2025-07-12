
# Environment Variables Setup

This application uses environment variables for configuring Bybit API credentials. Follow these steps to set up your environment:

## Setting Up the `.env` File

1. Create a file named `.env` in the root directory of the project (if not already present)
2. Add your Bybit API credentials:

```
# Bybit API Credentials
VITE_BYBIT_API_KEY=your_api_key_here
VITE_BYBIT_API_SECRET=your_api_secret_here

# Optional: Set to true to use testnet instead of mainnet
VITE_BYBIT_USE_TESTNET=false
```

3. Replace `your_api_key_here` and `your_api_secret_here` with your actual Bybit API key and secret.

## Security Notes

- The `.env` file is listed in `.gitignore` and should never be committed to version control
- Environment variables with the `VITE_` prefix are exposed to your client-side code
- For production, set these variables in your hosting provider's environment configuration

## Accessing Environment Variables

In your code, you can access these variables using:

```typescript
const apiKey = import.meta.env.VITE_BYBIT_API_KEY;
const apiSecret = import.meta.env.VITE_BYBIT_API_SECRET;
const useTestnet = import.meta.env.VITE_BYBIT_USE_TESTNET === 'true';
```
