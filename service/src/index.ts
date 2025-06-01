import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Placeholder for the controller function
const unstableSleep = async (req: Request, res: Response) => {
  const delaySeconds = Math.random() * 5;
  setTimeout(() => {
    res.status(200).send(`Slept for ${delaySeconds.toFixed(2)} seconds`);
  }, delaySeconds * 1000);
};

// New route for /unstable-sleep
app.get('/unstable-sleep', unstableSleep);

// Only start server if the file is run directly (e.g., not when imported as a module for testing)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app; // Export the app for testing
