# Summer Shine Window Cleaning — Website

A static website for Summer Shine Window Cleaning, built with plain HTML/CSS/JS and deployed on Netlify.

## Pages
| Page | File |
|------|------|
| Home | `index.html` |
| Before & After gallery | `before-after.html` |
| Instant estimate calculator | `estimate.html` |
| Book appointment | `book.html` |

## Adding your photos
Place images in the `/images/` folder and update the `src` attributes:

| What | File name expected |
|------|--------------------|
| Hero crew photo | `images/crew.jpg` |
| Before/After pair 1 | `images/before1.jpg` / `images/after1.jpg` |
| Before/After pair 2 | `images/before2.jpg` / `images/after2.jpg` |
| Before/After pair 3 | `images/before3.jpg` / `images/after3.jpg` |

## Pricing
Edit `js/estimate.js` — top of file:
```js
const PRICES = { small: 5, medium: 10, large: 20 };
```

## Booking email notifications
1. Deploy to Netlify (drag-and-drop the folder at app.netlify.com or connect your Git repo).
2. Netlify automatically detects the `data-netlify="true"` form.
3. Go to **app.netlify.com → your site → Forms → Notifications** and add your email (`michaelwyattnelson@gmail.com`) as an email notification target.
4. Every new booking submission will trigger an email with all the customer details and their chosen slot.

## Overbooking prevention
- Booked slots are stored in `localStorage` on the customer's browser immediately after a successful form submission.
- The calendar marks days as **fully booked** (red) once `SLOTS_PER_DAY` (default: 4) bookings exist for that day.
- To change the daily capacity, edit `js/booking.js`:
  ```js
  const SLOTS_PER_DAY = 4;
  ```
- For a production multi-user booking system (true server-side slot locking), a Netlify Function + database (e.g. Supabase free tier) would be the next step — easy to add later.

## Local preview
Open `index.html` in your browser, or run a simple server:
```sh
npx serve .
```
