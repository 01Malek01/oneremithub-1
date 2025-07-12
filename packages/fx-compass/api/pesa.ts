import axios from "axios";
 
export default async function handler(req, res) {
  try {
    const response = await axios.get(
      "https://api.pesapeer.com/v2/public/currency-pairs"
    );
    // Optionally, set CORS headers if you want this endpoint to be public
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Pesa rates" });
  }
}
