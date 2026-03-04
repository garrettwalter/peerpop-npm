# peerpop

The official [PeerPop](https://peerpop.io) Node.js SDK.

V1 (1.2.3) offers event listing (past/upcoming) and webhook verification in one line.

For more information, see the [PeerPop SDK documentation](https://docs.peerpop.io/beta-features/peerpop-sdk).

## Install

```bash
npm install peerpop
```

## Events

List a user's past or upcoming events from the public API. You need the user ID and your API key (e.g. `process.env.PEERPOP_API_KEY`).

```js
const peerpop = require("peerpop");

// Upcoming events
const upcoming = await peerpop.events.list("upcoming", userId, process.env.PEERPOP_API_KEY);

// Past events
const past = await peerpop.events.list("past", userId, process.env.PEERPOP_API_KEY);
```

- **`peerpop.events.list(type, userId, apiKey)`** — `type` is `"upcoming"` or `"past"`. Returns a Promise that resolves to the API response (parsed JSON).

## React: EventDisplayButton

A button that opens a modal with an iframe showing your event URL (e.g. ticket or event page). Requires React 16.8+.

### Live demo

**[→ Try it in your browser](https://garrettwalter.github.io/peerpop-npm/)** — click “Get Tickets” to open the event in a modal (uses [this event](https://peerpop.io/view/events/wickedhalloweenparty+2025-10-30)).

To run the demo locally: `cd examples/demo && npm install && npm run dev`, then open http://localhost:5173.

**Props**

| Prop           | Type   | Default        | Description                                                                 |
|----------------|--------|----------------|-----------------------------------------------------------------------------|
| `url`          | string | (required)     | Event URL to load in the iframe (e.g. ticket or event page).                |
| `buttonText`   | string | `"Get Tickets"`| Label for the trigger button.                                               |
| `buttonStyles` | string | —              | Optional CSS class name(s) for the button.                                  |
| `modalStyles`  | string | —              | Optional CSS class name(s) for the modal content (the box around the iframe). |

The modal is centered on desktop and full-screen on viewports ≤768px. The modal and iframe use an `id` derived from `url` for targeting.

**Working example**

Copy this into your React app. Clicking the button opens a modal with the live event page:

```jsx
import EventDisplayButton from "peerpop/react";

function App() {
  return (
    <EventDisplayButton
      url="https://peerpop.io/view/events/wickedhalloweenparty+2025-10-30"
      buttonText="Get Tickets"
    />
  );
}
```

Or with custom classes:

```jsx
<EventDisplayButton
  url="https://peerpop.io/view/events/wickedhalloweenparty+2025-10-30"
  buttonText="Get Tickets"
  buttonStyles="my-btn-class"
  modalStyles="my-modal-class"
/>
```

```js
// CommonJS
const EventDisplayButton = require("peerpop/react");
```

## Webhook verification

### One-line verify

Use the **raw** request body (the exact string or buffer as received) and the `X-Webhook-Signature` header:

```js
const peerpop = require("peerpop");

// In your webhook handler (you must have access to the raw body)
const payload = peerpop.webhook.verify(req.rawBody, req.headers["x-webhook-signature"], process.env.PEERPOP_API_KEY);
// payload is { phone, email, action, amount, event, metadata }
```

If the signature is missing (you didn’t set a secret), invalid, or expired, `verify()` throws. Catch and return 400:

```js
try {
  const payload = peerpop.webhook.verify(req.rawBody, req.headers["x-webhook-signature"], process.env.PEERPOP_API_KEY);
  // use payload
} catch (err) {
  res.status(400).send(err.message);
}
```

Errors have `err.code` set to `PEERPOP_WEBHOOK_INVALID` or `PEERPOP_WEBHOOK_EXPIRED`.

### Express (raw body required)

Verification must run on the **raw** body. Use `express.raw()` for the webhook route so the body isn’t parsed as JSON before verification:

```js
const express = require("express");
const peerpop = require("peerpop");

const app = express();

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  peerpop.webhook.middleware(process.env.PEERPOP_API_KEY),
  (req, res) => {
    const payload = req.webhookPayload; // already verified and parsed
    console.log(payload);
    res.send("OK");
  }
);
```

If verification fails, the middleware responds with 400 and does not call your route.

For more on webhooks, see the [PeerPop Webhook documentation](https://docs.peerpop.io/beta-features/webhook).

## API

- **`peerpop.events.list(type, userId, apiKey)`**  
  Returns a Promise that resolves to the API response. `type` is `"past"` or `"upcoming"`.

- **`peerpop.webhook.verify(req.rawBody, signatureHeader, secret)`**  
  Returns the parsed payload object, or throws if signature is invalid/expired. Use when you have the raw body string (or buffer converted to string).

- **`peerpop.webhook.middleware(secret)`**  
  Express middleware that verifies the request and sets `req.webhookPayload`. Use with `express.raw({ type: "application/json" })` on that route.

## Signature format

PeerPop sends `X-Webhook-Signature: t=<unix_timestamp>,v1=<hmac_sha256_hex>`. The HMAC is over `timestamp + "." + req.rawBody` with your webhook secret. Signatures older than 5 minutes are rejected (replay protection).
