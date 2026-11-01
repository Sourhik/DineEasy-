import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Table Reservation Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="bg-theme-page min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-charcoal-900">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 bg-white px-3.5 py-1.5 rounded-full border border-cream-300 shadow-sm inline-block">
            Get In Touch
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight theme-canvas-title">
            Contact DineEasy Concierge
          </h1>
          <p className="text-sm sm:text-base theme-canvas-sub max-w-xl mx-auto">
            Have questions about booking a table, partnering your restaurant, or platform support? We are here to help 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-charcoal-900">Phone Support</h4>
                <p className="text-xs text-charcoal-600 mt-0.5">+1 (800) 555-DINE</p>
                <p className="text-[11px] text-charcoal-400 mt-1">Mon-Sun, 9:00 AM - 11:00 PM</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-burgundy-50 border border-burgundy-200 flex items-center justify-center text-burgundy-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-charcoal-900">Email Inquiries</h4>
                <p className="text-xs text-charcoal-600 mt-0.5">concierge@dineeasy.com</p>
                <p className="text-[11px] text-charcoal-400 mt-1">Average response time: 2 hours</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-charcoal-50 border border-charcoal-200 flex items-center justify-center text-charcoal-700 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-charcoal-900">Headquarters</h4>
                <p className="text-xs text-charcoal-600 mt-0.5">100 Culinary Avenue, Suite 400</p>
                <p className="text-[11px] text-charcoal-400 mt-1">Metropolis Dining District</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-cream-200 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900">Message Received!</h3>
                <p className="text-sm text-charcoal-600 max-w-md mx-auto">
                  Thank you for reaching out, {formData.name}. Our concierge team will contact you shortly at {formData.email}.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'Table Reservation Inquiry', message: '' });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-charcoal-900 text-white font-bold text-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="flex items-center gap-2 border-b border-cream-200 pb-3 mb-2">
                  <MessageSquare className="w-4 h-4 text-gold-600" />
                  <h3 className="font-serif text-base font-bold text-charcoal-900">
                    Send Us a Message
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-charcoal-700">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-charcoal-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-charcoal-700">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +1 555-0199"
                      className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-charcoal-700">Inquiry Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500"
                    >
                      <option value="Table Reservation Inquiry">Table Reservation Inquiry</option>
                      <option value="Restaurant Partnership Request">Restaurant Partnership Request</option>
                      <option value="Billing & Support">Billing & Support</option>
                      <option value="General Feedback">General Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-700">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you with your dining experience?"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending message...' : 'Send Message to Concierge'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

