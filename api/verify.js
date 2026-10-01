// Vercel serverless function — health/verification endpoint
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    service: 'Lyriqai',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  }));
};
