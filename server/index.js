import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeDatabase } from "./db/index.js";
import { runDueSchedules } from './services/recurrence.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json());
const db = initializeDatabase();

function getProviders() {
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
  const host = (process.env.SMTP_HOST || "").toLowerCase();
  const gmailConfigured = smtpConfigured && host.includes("gmail");
  const outlookConfigured =
    smtpConfigured && (host.includes("office365") || host.includes("outlook"));
  return [
    {
      id: "gmail",
      name: "Google Gmail",
      type: "mail",
      connected: gmailConfigured,
      description: gmailConfigured
        ? "Connected through configured Gmail SMTP."
        : "Configure Gmail SMTP credentials in .env.",
    },
    {
      id: "outlook",
      name: "Microsoft Outlook",
      type: "mail",
      connected: outlookConfigured,
      description: outlookConfigured
        ? "Connected through configured Outlook SMTP."
        : "Configure Outlook SMTP credentials in .env.",
    },
    {
      id: "stripe",
      name: "Stripe",
      type: "payments",
      connected: Boolean(process.env.STRIPE_SECRET_KEY),
      description: "Add STRIPE_SECRET_KEY to enable payment links.",
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      type: "accounting",
      connected: Boolean(
        process.env.QUICKBOOKS_CLIENT_ID &&
        process.env.QUICKBOOKS_CLIENT_SECRET,
      ),
      description: "Add QuickBooks OAuth credentials to enable sync.",
    },
  ];
}

app.get("/api/providers", (_req, res) => res.json(getProviders()));
app.get('/api/integrations', (_req, res) => res.json(db.prepare('SELECT provider, status, account_label, connected_at, last_error FROM integrations ORDER BY provider').all()))
app.put('/api/integrations/:provider', (req, res) => {
  const { status = 'connected', accountLabel = '', config = {} } = req.body
  db.prepare(`INSERT INTO integrations (provider, status, account_label, config_json, connected_at, last_error) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, NULL) ON CONFLICT(provider) DO UPDATE SET status=excluded.status, account_label=excluded.account_label, config_json=excluded.config_json, connected_at=excluded.connected_at, last_error=NULL`).run(req.params.provider, status, accountLabel, JSON.stringify(config))
  res.json(db.prepare('SELECT provider, status, account_label, connected_at, last_error FROM integrations WHERE provider = ?').get(req.params.provider))
})
app.delete('/api/integrations/:provider', (req, res) => { db.prepare('DELETE FROM integrations WHERE provider = ?').run(req.params.provider); res.status(204).end() })
app.get('/api/recurring', (_req, res) => res.json(db.prepare('SELECT s.*, c.name AS client_name, p.amount AS current_amount FROM recurring_schedules s JOIN clients c ON c.id = s.client_id LEFT JOIN schedule_price_history p ON p.schedule_id = s.id AND p.id = (SELECT id FROM schedule_price_history WHERE schedule_id = s.id ORDER BY effective_from DESC, id DESC LIMIT 1) ORDER BY s.next_run_at').all()));
app.post('/api/recurring/run', (_req, res) => res.json({ created: runDueSchedules(db) }));
app.post('/api/recurring/:id/price', (req, res) => { const { amount, effectiveFrom, priceChangeNote = false } = req.body; if (!(Number(amount) > 0) || !effectiveFrom) return res.status(400).json({ error: 'Enter a valid amount and effective date.' }); const result = db.prepare('INSERT INTO schedule_price_history (schedule_id, amount, effective_from, price_change_note) VALUES (?, ?, ?, ?)').run(req.params.id, Number(amount), effectiveFrom, priceChangeNote ? 1 : 0); res.status(201).json(db.prepare('SELECT * FROM schedule_price_history WHERE id = ?').get(result.lastInsertRowid)); });
app.get("/api/business-profile", (_req, res) =>
  res.json(db.prepare("SELECT * FROM business_profile WHERE id = 1").get()),
);
app.put("/api/business-profile", (req, res) => {
  const {
    name = "",
    address = "",
    email = "",
    phone = "",
    paymentInstructions = "",
  } = req.body;
  db.prepare(
    "UPDATE business_profile SET name = ?, address = ?, email = ?, phone = ?, payment_instructions = ? WHERE id = 1",
  ).run(name, address, email, phone, paymentInstructions);
  res.json(db.prepare("SELECT * FROM business_profile WHERE id = 1").get());
});
app.get("/api/clients", (_req, res) =>
  res.json(
    db
      .prepare(
        `SELECT c.*, COUNT(i.id) AS invoice_count, COALESCE(SUM(CASE WHEN i.status != 'Paid' THEN i.amount ELSE 0 END), 0) AS outstanding FROM clients c LEFT JOIN invoices i ON i.client_id = c.id GROUP BY c.id ORDER BY c.name`,
      )
      .all(),
  ),
);
app.get("/api/clients/:id/invoices", (req, res) =>
  res.json(
    db
      .prepare("SELECT * FROM invoices WHERE client_id = ? ORDER BY id DESC")
      .all(req.params.id),
  ),
);
app.post("/api/clients", (req, res) => {
  const {
    name,
    email,
    company = "",
    address = "",
    phone = "",
    notes = "",
  } = req.body;
  if (!name || !email)
    return res
      .status(400)
      .json({ error: "Client name and email are required." });
  try {
    const result = db
      .prepare(
        "INSERT INTO clients (name, email, company, address, phone, notes) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(name, email, company, address, phone, notes);
    res
      .status(201)
      .json(
        db
          .prepare("SELECT * FROM clients WHERE id = ?")
          .get(result.lastInsertRowid),
      );
  } catch (error) {
    res
      .status(409)
      .json({
        error: error.message.includes("UNIQUE")
          ? "A client with this email already exists."
          : error.message,
      });
  }
});
app.patch("/api/clients/:id", (req, res) => {
  const {
    name,
    email,
    company = "",
    address = "",
    phone = "",
    notes = "",
  } = req.body;
  if (!name || !email)
    return res
      .status(400)
      .json({ error: "Client name and email are required." });
  try {
    db.prepare(
      "UPDATE clients SET name = ?, email = ?, company = ?, address = ?, phone = ?, notes = ? WHERE id = ?",
    ).run(name, email, company, address, phone, notes, req.params.id);
    res.json(
      db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id),
    );
  } catch (error) {
    res
      .status(409)
      .json({
        error: error.message.includes("UNIQUE")
          ? "A client with this email already exists."
          : error.message,
      });
  }
});
app.delete("/api/clients/:id", (req, res) => {
  const linked = db
    .prepare("SELECT COUNT(*) AS count FROM invoices WHERE client_id = ?")
    .get(req.params.id).count;
  if (linked > 0)
    return res
      .status(409)
      .json({
        error: "This client has linked invoices and cannot be deleted.",
      });
  db.prepare("DELETE FROM clients WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
app.get("/api/invoices", (_req, res) =>
  res.json(
    db
      .prepare(
        "SELECT i.*, c.name AS client_name, c.email AS client_email, c.address AS client_address FROM invoices i LEFT JOIN clients c ON c.id = i.client_id ORDER BY i.id DESC",
      )
      .all(),
  ),
);
app.post("/api/invoices", (req, res) => {
  const {
    clientId,
    clientName,
    clientEmail,
    clientAddress = "",
    description,
    amount,
    dueDate,
    currency = "USD",
    paymentInstructions = "",
  } = req.body;
  let client = clientId
    ? db.prepare("SELECT * FROM clients WHERE id = ?").get(clientId)
    : null;
  if (!client && clientName && clientEmail) {
    try {
      const result = db
        .prepare("INSERT INTO clients (name, email, address) VALUES (?, ?, ?)")
        .run(clientName, clientEmail, clientAddress);
      client = db
        .prepare("SELECT * FROM clients WHERE id = ?")
        .get(result.lastInsertRowid);
    } catch (error) {
      client = db
        .prepare("SELECT * FROM clients WHERE email = ?")
        .get(clientEmail);
      if (!client) return res.status(409).json({ error: error.message });
    }
  }
  if (!client || !description || !amount)
    return res
      .status(400)
      .json({
        error: "Select a client or enter the recipient name and email.",
      });
  const next =
    db.prepare("SELECT COUNT(*) AS count FROM invoices").get().count + 1;
  const number = `INV-${new Date().getFullYear()}-${String(next).padStart(4, "0")}`;
  const result = db
    .prepare(
      "INSERT INTO invoices (number, client_id, client_name, client_email, description, amount, currency, payment_instructions, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      number,
      client.id,
      client.name,
      client.email,
      description,
      Number(amount),
      currency,
      paymentInstructions,
      dueDate || null,
    );
  res
    .status(201)
    .json(
      db
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(result.lastInsertRowid),
    );
});
app.patch('/api/invoices/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['Draft', 'Sent', 'Paid', 'Overdue'].includes(status)) return res.status(400).json({ error: 'Invalid invoice status.' });
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? OR number = ?').get(req.params.id, req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
  db.prepare('UPDATE invoices SET status = ?, sent_at = CASE WHEN ? = \'Sent\' THEN CURRENT_TIMESTAMP ELSE sent_at END WHERE id = ?').run(status, status, invoice.id);
  res.json(db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice.id));
});
app.delete('/api/invoices/:id', (req, res) => {
  const invoice = db.prepare('SELECT id FROM invoices WHERE id = ? OR number = ?').get(req.params.id, req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
  db.prepare('DELETE FROM invoices WHERE id = ?').run(invoice.id);
  res.status(204).end();
});
app.post('/api/payments', (req, res) => {
  const { invoiceId, method = 'Manual', date, amount } = req.body;
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? OR number = ?').get(invoiceId, invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
  if (!date || !(Number(amount) > 0)) return res.status(400).json({ error: 'Payment date and amount are required.' });
  const result = db.prepare('INSERT INTO payments (invoice_id, client_id, date, source, method, amount) VALUES (?, ?, ?, ?, ?, ?)').run(invoice.id, invoice.client_id, date, 'Manual', method, Number(amount));
  db.prepare("UPDATE invoices SET status = 'Paid' WHERE id = ?").run(invoice.id);
  res.status(201).json(db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid));
});
function createPdf(invoice) {
  return new Promise((resolve) => {
    const chunks = [];
    const doc = new PDFDocument({ margin: 55 });
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.fontSize(28).fillColor("#6952c9").text("INVOICE", { align: "right" });
    doc
      .moveDown()
      .fontSize(11)
      .fillColor("#333")
      .text(invoice.number, { align: "right" })
      .text(`Issued ${new Date(invoice.created_at).toLocaleDateString()}`, {
        align: "right",
      });
    doc
      .moveDown(3)
      .fontSize(12)
      .text("BILL TO", { continued: false })
      .fontSize(16)
      .text(invoice.client_name)
      .fontSize(11)
      .fillColor("#666")
      .text(invoice.client_email);
    doc
      .moveDown(3)
      .fillColor("#333")
      .fontSize(12)
      .text("DESCRIPTION", 55)
      .text("DUE DATE", 350)
      .text("AMOUNT", 470);
    doc
      .moveTo(55, doc.y + 8)
      .lineTo(540, doc.y + 8)
      .strokeColor("#dddddd")
      .stroke();
    doc
      .moveDown()
      .fontSize(11)
      .text(invoice.description, 55)
      .text(invoice.due_date || "No due date", 350)
      .text(`${invoice.currency} ${Number(invoice.amount).toFixed(2)}`, 470);
    doc
      .moveDown(3)
      .fontSize(18)
      .text(`Total  ${invoice.currency} ${Number(invoice.amount).toFixed(2)}`, {
        align: "right",
      });
    if (invoice.payment_instructions)
      doc
        .moveDown(3)
        .fontSize(12)
        .fillColor("#333")
        .text("Notes & Payment Instructions")
        .fontSize(10)
        .fillColor("#666")
        .text(invoice.payment_instructions);
    doc
      .moveDown(4)
      .fontSize(10)
      .fillColor("#777")
      .text("Thank you for your business.", { align: "center" });
    doc.end();
  });
}
app.get("/api/invoices/:id/pdf", async (req, res) => {
  const invoice = db
    .prepare("SELECT * FROM invoices WHERE id = ? OR number = ?")
    .get(req.params.id, req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found." });
  const pdf = await createPdf(invoice);
  res
    .set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
    })
    .send(pdf);
});
app.post('/api/invoices/preview/pdf', async (req, res) => {
  const invoice = { number: req.body.number || 'PREVIEW', client_name: req.body.clientName || 'Client', client_email: req.body.clientEmail || '', description: req.body.description || 'Line item', amount: Number(req.body.amount || 0), currency: req.body.currency || 'USD', due_date: req.body.dueDate || null, created_at: new Date().toISOString(), payment_instructions: req.body.paymentInstructions || '' }
  const pdf = await createPdf(invoice)
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${invoice.number}.pdf"` }).send(pdf)
})
app.post("/api/invoices/:id/send", async (req, res) => {
  const invoice = db
    .prepare("SELECT * FROM invoices WHERE id = ? OR number = ?")
    .get(req.params.id, req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found." });
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  )
    return res
      .status(400)
      .json({
        error:
          "Email is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and INVOICE_FROM to .env.",
      });
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const pdf = await createPdf(invoice);
    await transporter.sendMail({
      from: process.env.INVOICE_FROM || process.env.SMTP_USER,
      to: invoice.client_email,
      subject: `${invoice.number} from ${process.env.BUSINESS_NAME || "Your business"}`,
      text: `Hello ${invoice.client_name},\n\nPlease find invoice ${invoice.number} attached.\n\nThank you.`,
      attachments: [{ filename: `${invoice.number}.pdf`, content: pdf }],
    });
    db.prepare(
      "UPDATE invoices SET status = 'Sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(invoice.id);
    res.json({
      ok: true,
      message: `Invoice ${invoice.number} sent to ${invoice.client_email}.`,
    });
  } catch (error) {
    res.status(500).json({ error: `Email failed: ${error.message}` });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (_req, res) =>
    res.sendFile(path.join(__dirname, "../dist/index.html")),
  );
}
app.listen(port, () =>
  console.log(`Invoice API running on http://localhost:${port}`),
);
