import axios from "axios";
import { generateSignature } from './FetchP2POrders';

export const fetchUserInfo = async (
  apiKey: string,
  apiSecret: string,
  recvWindow: string = '5000'
) => {
  try {
    const timestamp = Date.now().toString();
    const body = '';
    const message = timestamp + apiKey + recvWindow + body;
    const signature = await generateSignature(apiSecret, message);

    const headers = {
      'X-BAPI-API-KEY': apiKey,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': recvWindow,
      'X-BAPI-SIGN': signature,
    };

    const res = await axios.post(
      'https://api.bybit.com/v5/p2p/user/personal/info',
      body, // truly empty body
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}