/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { Database } from './src/server/db.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Log requests for analytics and debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API ROUTES ---

// PORTFOLIO API
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolio = await Database.getPortfolio();
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});



// BLOG API
app.get('/api/blog', async (req, res) => {
  try {
    const blog = await Database.getBlogPosts();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});



// INQUIRIES & CONTACT API
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Database.getInquiries();
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, service, message } = req.body;
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: 'Please furnish all fields (Name, Email, Service, and Message)' });
    }

    const saved = await Database.addInquiry({ name, email, service, message });

    // Simulate sending email notification for demo:
    console.log(`[EMAIL SIMULATOR] Sending email to Agency Admins (thefusionhubofficial@gmail.com):`);
    console.log(`Subject: New Inquiry Received from ${name} - ${service}`);
    console.log(`Body:\n---\nHello Admin,\n\nA new inquiry is pending response:\nClient: ${name} (${email})\nRequested Service: ${service}\n\nClient Message:\n"${message}"\n\nConfigure replies via the Admin Panel.\n---`);

    res.json({
      success: true,
      data: saved,
      message: 'Your inquiry has been stored successfully. An agency representative will contact you shortly!'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server could not record and send the inquiry notification' });
  }
});



// SERVICE CATEGORIES API
app.get('/api/team', async (req, res) => {
  try {
    const team = await Database.getTeam();
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load team members' });
  }
});

app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await Database.getTestimonials();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});



// --- CLIENT SERVER CONFIG & VITE INTEGRATION ---
async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    // Production Mode: Serve compiled assets static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development Mode: Use Vite's live dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // Start core Express server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[THE FUSION HUB SERVER] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[THE FUSION HUB SERVER] Mode: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed", err);
});
