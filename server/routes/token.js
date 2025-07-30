import express from "express";
import axios from "axios";
import { generateSignedJwt } from "../utils/jwtGenerator.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { code } = req.body;
  console.log("Received code:", code);
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const jwt = await generateSignedJwt();
    console.log("Generated JWT:", jwt);
    console.log("CLIENT_ASSERTION_TYPE:", process.env.CLIENT_ASSERTION_TYPE);
    console.log("Code----", code);
    console.log("TOKEN_ENDPOINT:", process.env.TOKEN_ENDPOINT);
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.CLIENT_ID,
      client_assertion_type: process.env.CLIENT_ASSERTION_TYPE,
      client_assertion: jwt,
      code_verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
    });
    console.log("Request parameters:", params.toString());
    //here is the problem
    const response = await axios.post(
      "https://esignet.ida.fayda.et/v1/esignet/oauth/v2/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    console.log("Token response:", response.data.access_token);
    res.json({ access_token: response.data.access_token });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Token request failed" });
  }
});

export default router;
