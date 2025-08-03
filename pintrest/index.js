// A simple test function to see if Vercel routing works.
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('Hello from Vercel! If you can see this, the routing is fixed.');
};