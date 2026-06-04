// ================================================================
//  Summer Shine — Booking System
//  Bookings are stored in localStorage (keyed by date+time slot)
//  and submitted via Netlify Forms (which emails your brother).
//  Netlify sends an email notification on every new form submission
//  — configure at: app.netlify.com > Forms > Notifications.
// ================================================================

const SLOTS_PER_DAY = 4;          // max bookings per day before it shows "full"
const TIME_SLOTS = [
  '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'
];

// ---- State ----
let currentYear, currentMonth;
let selectedDate = null;
let selectedTime = null;

// ---- DOM refs ----
const calGrid           = document.getElementById('calGrid');
const calMonthYear      = document.getElementById('calMonthYear');
const timeslotContainer = document.getElementById('timeslotContainer');
const timeslotGrid      = document.getElementById('timeslotGrid');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const bookingForm       = document.getElementById('bookingForm');
const successMessage    = document.getElementById('successMessage');
const selectedSlotLabel = document.getElementById('selectedSlotLabel');
const hiddenDate        = document.getElementById('hiddenDate');
const hiddenTime        = document.getElementById('hiddenTime');
const hiddenTotal       = document.getElementById('hiddenTotal');
const estimateSummary   = document.getElementById('estimateSummary');
const bookEstimateDisplay = document.getElementById('bookEstimateDisplay');

// ---- Load bookings from localStorage ----
function loadBookings() {
  try { return JSON.parse(localStorage.getItem('summershine_bookings') || '{}'); }
  catch { return {}; }
}
function saveBookings(bookings) {
  localStorage.setItem('summershine_bookings', JSON.stringify(bookings));
}
function getBookingsForDate(dateStr) {
  const bookings = loadBookings();
  return bookings[dateStr] || [];
}
function isSlotBooked(dateStr, time) {
  return getBookingsForDate(dateStr).includes(time);
}
function isDateFull(dateStr) {
  return getBookingsForDate(dateStr).length >= SLOTS_PER_DAY;
}
function bookSlot(dateStr, time) {
  const bookings = loadBookings();
  if (!bookings[dateStr]) bookings[dateStr] = [];
  if (!bookings[dateStr].includes(time)) bookings[dateStr].push(time);
  saveBookings(bookings);
}

// ---- Calendar ----
function initCalendar() {
  const now = new Date();
  currentYear  = now.getFullYear();
  currentMonth = now.getMonth();
  renderCalendar();
}

function renderCalendar() {
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  calMonthYear.textContent = `${months[currentMonth]} ${currentYear}`;

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  calGrid.innerHTML = '';

  // Day name headers
  dayNames.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name'; el.textContent = d;
    calGrid.appendChild(el);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day cal-empty';
    calGrid.appendChild(el);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = day;

    const date = new Date(currentYear, currentMonth, day);
    const dateStr = formatDate(date);
    const isPast = date < today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isFull = isDateFull(dateStr);

    if (date.toDateString() === today.toDateString()) el.classList.add('cal-today');

    if (isPast || isWeekend) {
      el.classList.add('cal-past');
    } else if (isFull) {
      el.classList.add('cal-booked-full');
      el.title = 'Fully booked';
    } else {
      if (selectedDate === dateStr) el.classList.add('selected');
      el.addEventListener('click', () => selectDate(dateStr, date));
    }

    calGrid.appendChild(el);
  }
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function prettyDate(dateStr) {
  const [y,m,d] = dateStr.split('-').map(Number);
  return new Date(y, m-1, d).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function selectDate(dateStr, dateObj) {
  selectedDate = dateStr;
  selectedTime = null;
  renderCalendar();
  renderTimeslots(dateStr);
  bookingForm.style.display = 'none';
}

// ---- Timeslots ----
function renderTimeslots(dateStr) {
  selectedDateLabel.textContent = prettyDate(dateStr);
  timeslotGrid.innerHTML = '';

  TIME_SLOTS.forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'timeslot-btn';
    btn.textContent = slot;

    if (isSlotBooked(dateStr, slot)) {
      btn.disabled = true;
      btn.title = 'Already booked';
    } else {
      btn.addEventListener('click', () => selectSlot(slot));
    }
    timeslotGrid.appendChild(btn);
  });

  timeslotContainer.style.display = '';
}

function selectSlot(time) {
  selectedTime = time;
  document.querySelectorAll('.timeslot-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent === time);
  });
  showBookingForm();
}

// ---- Booking Form ----
function showBookingForm() {
  hiddenDate.value = selectedDate;
  hiddenTime.value = selectedTime;
  selectedSlotLabel.textContent = `📅 ${prettyDate(selectedDate)} at ${selectedTime}`;

  // Pull estimate from sessionStorage if available
  try {
    const est = JSON.parse(sessionStorage.getItem('summershine_estimate'));
    if (est && est.total > 0) {
      hiddenTotal.value = `$${est.total}`;
      bookEstimateDisplay.textContent = `$${est.total}`;
      estimateSummary.style.display = '';
    }
  } catch { /* no estimate */ }

  bookingForm.style.display = '';
  bookingForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- Form submission ----
bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedDate || !selectedTime) {
    alert('Please select a date and time first.');
    return;
  }
  if (isSlotBooked(selectedDate, selectedTime)) {
    alert('Sorry, that slot was just taken. Please choose another.');
    renderTimeslots(selectedDate);
    bookingForm.style.display = 'none';
    return;
  }

  const email = document.getElementById('custEmail').value;
  const formData = new FormData(bookingForm);

  try {
    const response = await fetch('/book.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    });

    if (response.ok) {
      // Persist booking locally to prevent double-booking
      bookSlot(selectedDate, selectedTime);

      // Show success
      document.getElementById('confirmedEmail').textContent = email;
      document.getElementById('confirmedSlot').textContent =
        `${prettyDate(selectedDate)} at ${selectedTime}`;
      bookingForm.style.display = 'none';
      timeslotContainer.style.display = 'none';
      successMessage.style.display = '';
      successMessage.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert('Submission failed — please try again or call us directly.');
    }
  } catch {
    alert('Network error — please check your connection and try again.');
  }
});

// ---- Nav buttons ----
document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
});

// ---- Init ----
initCalendar();
