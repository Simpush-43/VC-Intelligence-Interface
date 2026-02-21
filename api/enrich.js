import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// Helper to set CORS headers on the response
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "Invalid request. Expected JSON body with a 'url' string." });
    }

    // 1. Fetch the HTML
    const pageResponse = await fetch(url);
    if (!pageResponse.ok) {
      return res.status(502).json({ error: `Failed to fetch URL: ${pageResponse.status}` });
    }

    const html = await pageResponse.text();

    // 2. Extract meaningful textual content with Cheerio
    const $ = cheerio.load(html);

    // Strip non-content tags to avoid feeding CSS/JS into the model
    $('script, style, noscript, template, svg, iframe').remove();

    const title = $('head > title').first().text().trim();
    const metaDescription =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';
    const mainHeading = $('h1').first().text().trim();

    const bodyTextRaw = $('body').text() || '';
    const bodyText = bodyTextRaw.replace(/\s+/g, ' ').trim();

    const parts = [];
    if (title) parts.push(`Title: ${title}`);
    if (metaDescription) parts.push(`Meta description: ${metaDescription}`);
    if (mainHeading) parts.push(`Main heading: ${mainHeading}`);
    if (bodyText) parts.push(`Body text: ${bodyText}`);

    let text = parts.join('\n\n').trim();

    // Truncate to keep it fast
    if (text.length > 8000) {
      text = text.slice(0, 8000);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
    }

    // 3. Call Google Gemini (FREE TIER)
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.5-flash as it is extremely fast and free
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json", // Forces clean JSON output
      }
    });

    const prompt = `You are an assistant that analyzes SaaS company webpages for venture capital investors.
Analyze the text and return a JSON object with strictly these keys:
- "summary" (1-2 sentences)
- "what_they_do" (array of 3-6 bullet points explaining their core product/service)
- "keywords" (array of 5-10 short strings)
- "signals" (array of 2-4 inferred business signals, e.g., 'careers page exists', 'enterprise focus', 'SOC2 compliant')

Guidelines:
- Focus ONLY on business / product / market / customer value content.
- If the text contains raw code, ignore it.
- If there is no business information, set: "summary": "Insufficient business content.", "what_they_do": [], "keywords": [], "signals": []

TEXT TO ANALYZE:
${text}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { raw: responseText };
    }

    // 4. Send back the data
    return res.status(200).json({
      url,
      result: parsed,
    });
    
  } catch (error) {
    console.error('Error in /api/enrich:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

