import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/AuthModal';

// ─────────────────────────────────────────────────
// Time slots available for booking (1-hour blocks)
// ─────────────────────────────────────────────────
const ALL_SLOTS = [
  { label: '06:00 – 07:00', start: '06:00', end: '07:00' },
  { label: '07:00 – 08:00', start: '07:00', end: '08:00' },
  { label: '08:00 – 09:00', start: '08:00', end: '09:00' },
  { label: '09:00 – 10:00', start: '09:00', end: '10:00' },
  { label: '10:00 – 11:00', start: '10:00', end: '11:00' },
  { label: '11:00 – 12:00', start: '11:00', end: '12:00' },
  { label: '12:00 – 13:00', start: '12:00', end: '13:00' },
  { label: '13:00 – 14:00', start: '13:00', end: '14:00' },
  { label: '14:00 – 15:00', start: '14:00', end: '15:00' },
  { label: '15:00 – 16:00', start: '15:00', end: '16:00' },
  { label: '16:00 – 17:00', start: '16:00', end: '17:00' },
  { label: '17:00 – 18:00', start: '17:00', end: '18:00' },
  { label: '18:00 – 19:00', start: '18:00', end: '19:00' },
  { label: '19:00 – 20:00', start: '19:00', end: '20:00' },
  { label: '20:00 – 21:00', start: '20:00', end: '21:00' },
];

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ─────────────────────────────────────────────────
// Send confirmation email via Supabase Edge Function
// Returns { success: boolean, error: string|null }
// NEVER throws — booking must remain saved even if email fails.
// ─────────────────────────────────────────────────
async function sendConfirmationEmail({ name, email, registrationNo, date, startTime, endTime, bookingId }) {
  try {
    const { data, error: fnError } = await supabase.functions.invoke(
      'send-booking-confirmation',
      { body: { name, email, registrationNo, date, startTime, endTime, bookingId } },
    );

    if (fnError) {
      // Edge Function itself threw (network / deploy error)
      console.error('[TurfPage] Edge Function invocation error:', fnError.message);
      return { success: false, error: fnError.message };
    }

    // Edge Function returned a structured error response
    if (data?.error) {
      console.error('[TurfPage] Edge Function returned error:', data.error, data.detail ?? '');
      return { success: false, error: data.error };
    }

    console.log('[TurfPage] Confirmation email sent successfully to', email);
    return { success: true, error: null };
  } catch (unexpected) {
    // Should never happen — safety net
    console.error('[TurfPage] Unexpected error in sendConfirmationEmail:', unexpected);
    return { success: false, error: String(unexpected) };
  }
}

// ─────────────────────────────────────────────────
// VIEW: Info view (before booking flow)
// ─────────────────────────────────────────────────
function TurfInfoView({ onBookClick }) {
  return (
    <div className="turf-page">
      {/* Header */}
      <div className="turf-header">
        <div className="turf-header-info">
          <h2>Floor 13 — Terrace Turf</h2>
          <p>Sports facility on the rooftop terrace. Book a slot to play on the campus turf.</p>
        </div>
        <div className="turf-badge">
          <span>⚽</span> Turf Available
        </div>
      </div>

      {/* Content */}
      <div className="turf-content">
        {/* Left: Visual */}
        <div className="turf-map-panel">
          <h3>Facility Overview</h3>
          <div className="turf-visual">
            <div className="turf-field">
              <span className="turf-field-icon">⚽</span>
              <div className="turf-field-label">VISTAS Terrace Turf</div>
              <div className="turf-field-sub">Full-size artificial grass • Floodlit • Open air</div>
            </div>
            <div className="turf-amenities">
              <div className="turf-amenity-item"><span>🛋️</span><span>Sitting Area — Rest and viewing gallery</span></div>
              <div className="turf-amenity-item"><span>🥤</span><span>Roof Sky Bar — Beverages and snacks</span></div>
              <div className="turf-amenity-item"><span>🪴</span><span>Open Garden — Relaxation zone</span></div>
              <div className="turf-amenity-item"><span>🛗</span><span>Lift access from all floors</span></div>
              <div className="turf-amenity-item"><span>⏰</span><span>Operating hours: 6:00 AM – 9:00 PM</span></div>
            </div>
          </div>
        </div>

        {/* Right: CTA */}
        <div className="turf-booking-panel turf-cta-panel">
          <div className="turf-cta-content">
            <span className="turf-cta-icon">🗓️</span>
            <h3>Book the Turf</h3>
            <p>
              Reserve your slot for the VISTAS rooftop turf.<br />
              Login required to complete your booking.
            </p>
            <button
              className="booking-confirm-btn"
              id="book-turf-btn"
              onClick={onBookClick}
              style={{ marginTop: '1.5rem' }}
            >
              🏟️ Book Turf
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// VIEW: Booking form (after login)
// ─────────────────────────────────────────────────
function TurfBookingView({ user, profile, onLogout }) {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);  // start times booked for current date
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingState, setBookingState] = useState('idle'); // 'idle' | 'confirm' | 'submitting' | 'done'
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');
  // 'sending' while email is in-flight, 'sent' on success, 'failed' if Resend rejected it
  const [emailStatus, setEmailStatus] = useState('sending'); // 'sending' | 'sent' | 'failed'

  // Fetch booked slots for selected date
  const fetchBookedSlots = useCallback(async (date) => {
    setLoadingSlots(true);
    const { data, error } = await supabase
      .from('turf_bookings')
      .select('start_time')
      .eq('booking_date', date)
      .eq('status', 'confirmed');
    setLoadingSlots(false);
    if (error) { console.warn('Fetch slots error:', error.message); return; }
    setBookedSlots((data || []).map((r) => r.start_time));
  }, []);

  useEffect(() => {
    fetchBookedSlots(selectedDate);
  }, [selectedDate, fetchBookedSlots]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
    setBookingState('idle');
    setBookingError('');
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setBookingState('confirm');
    setBookingError('');
  };

  // ── Confirm and create booking ──
  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedDate) return;
    setBookingState('submitting');
    setBookingError('');

    // Double-check availability (race-condition guard)
    const { data: clash } = await supabase
      .from('turf_bookings')
      .select('id')
      .eq('booking_date', selectedDate)
      .eq('start_time', selectedSlot.start)
      .eq('status', 'confirmed')
      .single();

    if (clash) {
      setBookingError('Sorry, this slot was just booked by someone else. Please pick another.');
      setBookingState('idle');
      fetchBookedSlots(selectedDate);
      return;
    }

    const { data: booking, error: insertError } = await supabase
      .from('turf_bookings')
      .insert({
        user_id: user.id,
        registration_no: profile?.registration_no || '',
        booking_date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        status: 'confirmed',
      })
      .select()
      .single();

    if (insertError) {
      // Unique constraint violation → slot already taken
      if (insertError.code === '23505') {
        setBookingError('This slot was just taken. Please choose another.');
      } else {
        setBookingError('Booking failed: ' + insertError.message);
      }
      setBookingState('idle');
      fetchBookedSlots(selectedDate);
      return;
    }

    // ── Show success screen immediately; send email in background ──
    setConfirmedBooking(booking);
    setEmailStatus('sending');
    setBookingState('done');
    fetchBookedSlots(selectedDate);

    // Await the email so we can show accurate feedback on the success screen.
    // The booking is already saved regardless of the email result.
    const emailResult = await sendConfirmationEmail({
      name: profile?.name || user.email,
      email: user.email,
      registrationNo: profile?.registration_no || 'N/A',
      date: formatDateDDMMYYYY(selectedDate),
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      bookingId: booking.id,
    });
    setEmailStatus(emailResult.success ? 'sent' : 'failed');
  };

  const handleBack = () => {
    setBookingState('idle');
    setSelectedSlot(null);
    setBookingError('');
  };

  return (
    <div className="turf-page">
      {/* Header */}
      <div className="turf-header">
        <div className="turf-header-info">
          <h2>Floor 13 — Turf Booking</h2>
          <p>
            Logged in as <strong>{profile?.name || user.email}</strong>
            {profile?.registration_no && (
              <span style={{ color: 'var(--gold-300)', marginLeft: '0.5rem' }}>
                ({profile.registration_no})
              </span>
            )}
          </p>
        </div>
        <button className="turf-logout-btn" id="turf-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Success Screen */}
      {bookingState === 'done' && confirmedBooking && (
        <div className="turf-booking-done">
          <div className="booking-done-icon">🎉</div>
          <h3>Booking Confirmed!</h3>
          <div className="booking-done-details">
            <div className="booking-detail-row">
              <span>Facility</span><span>Turf, Floor 13</span>
            </div>
            <div className="booking-detail-row">
              <span>Registration No</span>
              <span>{profile?.registration_no || 'N/A'}</span>
            </div>
            <div className="booking-detail-row">
              <span>Name</span><span>{profile?.name || user.email}</span>
            </div>
            <div className="booking-detail-row">
              <span>Date</span><span>{formatDateDisplay(confirmedBooking.booking_date)}</span>
            </div>
            <div className="booking-detail-row">
              <span>Time</span>
              <span>{confirmedBooking.start_time} – {confirmedBooking.end_time}</span>
            </div>
            <div className="booking-detail-row">
              <span>Booking ID</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>{confirmedBooking.id}</span>
            </div>
          </div>

          {/* ── Email status feedback — accurate, never lies ── */}
          {emailStatus === 'sending' && (
            <p className="booking-done-email-note" role="status">
              📧 Sending confirmation email to <strong>{user.email}</strong>…
            </p>
          )}
          {emailStatus === 'sent' && (
            <p className="booking-done-email-note" role="status">
              📧 Confirmation email sent to <strong>{user.email}</strong>
            </p>
          )}
          {emailStatus === 'failed' && (
            <p className="booking-done-email-note booking-done-email-warn" role="alert">
              ⚠️ Your booking is confirmed and saved, but the confirmation email could not be sent to <strong>{user.email}</strong>.
              Please note your Booking ID above.
            </p>
          )}

          <button
            className="booking-confirm-btn"
            id="book-another-btn"
            onClick={() => { setBookingState('idle'); setSelectedSlot(null); setConfirmedBooking(null); setEmailStatus('sending'); }}
            style={{ marginTop: '1.5rem' }}
          >
            Book Another Slot
          </button>
        </div>
      )}

      {/* Booking Form */}
      {bookingState !== 'done' && (
        <div className="turf-content">
          {/* Left: Info */}
          <div className="turf-map-panel">
            <h3>Facility Overview</h3>
            <div className="turf-visual">
              <div className="turf-field">
                <span className="turf-field-icon">⚽</span>
                <div className="turf-field-label">VISTAS Terrace Turf</div>
                <div className="turf-field-sub">Full-size artificial grass • Floodlit • Open air</div>
              </div>
              <div className="turf-amenities">
                <div className="turf-amenity-item"><span>🛋️</span><span>Sitting Area</span></div>
                <div className="turf-amenity-item"><span>🥤</span><span>Roof Sky Bar</span></div>
                <div className="turf-amenity-item"><span>🪴</span><span>Open Garden</span></div>
                <div className="turf-amenity-item"><span>⏰</span><span>6:00 AM – 9:00 PM</span></div>
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="turf-booking-panel">
            <h3>🗓️ Book a Slot</h3>

            {/* Error */}
            {bookingError && (
              <div className="turf-booking-error" role="alert">{bookingError}</div>
            )}

            {/* Confirm screen */}
            {bookingState === 'confirm' && selectedSlot && (
              <div className="booking-confirm-screen" id="booking-confirm-screen">
                <h4>Confirm Your Booking</h4>
                <div className="booking-confirm-details">
                  <div className="booking-detail-row">
                    <span>Facility</span><span>VISTAS Turf — Floor 13</span>
                  </div>
                  <div className="booking-detail-row">
                    <span>Registration No</span>
                    <span>{profile?.registration_no || 'N/A'}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span>Name</span><span>{profile?.name || user.email}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span>Date</span><span>{formatDateDDMMYYYY(selectedDate)}</span>
                  </div>
                  <div className="booking-detail-row">
                    <span>Time</span>
                    <span>{selectedSlot.start} – {selectedSlot.end}</span>
                  </div>
                </div>
                <div className="booking-confirm-actions">
                  <button
                    className="booking-confirm-btn"
                    id="confirm-booking-btn"
                    onClick={handleConfirmBooking}
                    disabled={bookingState === 'submitting'}
                  >
                    {bookingState === 'submitting' ? '⏳ Confirming…' : '✅ Confirm Booking'}
                  </button>
                  <button
                    className="booking-back-btn"
                    id="booking-back-btn"
                    onClick={handleBack}
                    disabled={bookingState === 'submitting'}
                  >
                    ← Change Slot
                  </button>
                </div>
              </div>
            )}

            {/* Date + slots */}
            {bookingState === 'idle' && (
              <>
                {/* Date Picker */}
                <div className="booking-form-group">
                  <label htmlFor="booking-date">Select Date</label>
                  <input
                    id="booking-date"
                    type="date"
                    className="booking-input"
                    value={selectedDate}
                    min={getTodayString()}
                    onChange={handleDateChange}
                  />
                  {selectedDate && (
                    <small style={{ color: 'var(--ink-2)', fontSize: '0.78rem' }}>
                      {formatDateDisplay(selectedDate)}
                    </small>
                  )}
                </div>

                {/* Time Slots */}
                <div className="booking-form-group">
                  <label>
                    Select Time Slot
                    {loadingSlots && <span style={{ marginLeft: '0.5rem', color: 'var(--ink-2)', fontSize: '0.8rem' }}>Loading…</span>}
                  </label>
                  <div className="time-slots-grid">
                    {ALL_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot.start);
                      const cls = ['time-slot-btn', isBooked ? 'slot-booked' : ''].filter(Boolean).join(' ');
                      return (
                        <button
                          key={slot.start}
                          className={cls}
                          disabled={isBooked}
                          onClick={() => !isBooked && handleSlotClick(slot)}
                          title={isBooked ? 'Already booked' : `Book ${slot.label}`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="slot-legend">
                    <span className="slot-legend-item"><span className="slot-legend-dot available" />Available</span>
                    <span className="slot-legend-item"><span className="slot-legend-dot booked" />Booked</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────
export default function TurfPage() {
  const { user, profile, loading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // When user logs in via modal → go straight to booking view
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowBooking(true);
  };

  // "Book Turf" button pressed — require auth
  const handleBookClick = () => {
    if (user) {
      setShowBooking(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowBooking(false);
  };

  if (loading) {
    return (
      <div className="turf-page turf-loading">
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <>
      {/* Auth Modal overlay */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Page content */}
      {showBooking && user ? (
        <TurfBookingView user={user} profile={profile} onLogout={handleLogout} />
      ) : (
        <TurfInfoView onBookClick={handleBookClick} />
      )}
    </>
  );
}
