import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://rjxgeboozisiuvgqnrer.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqeGdlYm9vemlzaXV2Z3FucmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjIzNzgsImV4cCI6MjA5MTM5ODM3OH0.GlV73pv9SxciWnCJdCRdMKLpedGkXLC2zjFSppfiN6A';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || 'BO_evzYtAO2GOfhgpzfU9B0aE2UBUKAp3EBdiz76q79-j3KubTH872rot7CWONEsaL7DBIce9cLp1DVgZYurMw8';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'xrTdWIrvmKnJY_TVC07jOQRRdBlegETiqlShgrRCMik';

webpush.setVapidDetails(
  'mailto:admin@vertexlab.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(bodyParser.json());

  // API Routes
  app.post("/api/push/subscribe", async (req, res) => {
    const { subscription, userId } = req.body;
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert([{ 
          endpoint: subscription.endpoint, 
          subscription: subscription, 
          user_id: userId 
        }], { onConflict: 'endpoint' });

      if (error) throw error;
      res.status(201).json({ success: true });
    } catch (error: any) {
      console.error("Subscription Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/push/broadcast", async (req, res) => {
    const { title, body, icon, url, adminEmail, adminPass } = req.body;

    // Fast check for admin - in a real app use proper auth
    if (adminEmail !== "admin@vertexlab@gmail.com" || adminPass !== "Vertexlab0123") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*');

      if (error) throw error;
      if (!subscriptions || subscriptions.length === 0) {
        return res.json({ success: true, sentCount: 0, message: "No subscribers found" });
      }

      const payload = JSON.stringify({ 
        title, 
        body, 
        icon: icon || 'https://i.ibb.co/1frr1Y2p/file-00000000cc7071fa90708dc0dd61a9f4.png',
        url: url || '/'
      });

      const results = await Promise.allSettled(
        subscriptions.map(sub => 
          webpush.sendNotification(sub.subscription, payload)
        )
      );

      // Clean up invalid subscriptions
      const invalidEndpoints = results
        .map((res, i) => {
          if (res.status === 'rejected' && (res.reason.statusCode === 410 || res.reason.statusCode === 404)) {
            return subscriptions[i].endpoint;
          }
          return null;
        })
        .filter(Boolean);

      if (invalidEndpoints.length > 0) {
        await supabase.from('push_subscriptions').delete().in('endpoint', invalidEndpoints);
      }

      res.json({ 
        success: true, 
        sentCount: results.filter(r => r.status === 'fulfilled').length,
        removedCount: invalidEndpoints.length
      });
    } catch (error: any) {
      console.error("Broadcast Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
