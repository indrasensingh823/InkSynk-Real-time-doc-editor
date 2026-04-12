import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Prism from '../components/Prism';
import Sidebar from '../components/Sidebar';

import '../styles/Home.css';

export default function Home() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const createNewDoc = () => {
    const id =
      Date.now().toString(36) + Math.random().toString(36).substr(2);
    navigate(`/documents/${id}`);
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Premium Background */}
      <div className="prism-background">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0.3}
          colorFrequency={1.2}
          noise={0.4}
          glow={1.2}
        />
      </div>

      {/* Blur + Transparent Layer */}
      <div className="prism-overlay"></div>
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>
      <div className="grid-overlay"></div>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-badge animate-fade-in">
          ⚡ Smart Real-Time Document Collaboration Platform
        </div>

        <div className="hero-content">
          <h1 className="hero-title animate-fade-in">
            Write, Collaborate & <span>Create Brilliant Docs</span> in Real-Time
          </h1>

          <p className="hero-subtitle animate-fade-in-delay">
            InkSync helps students, teams, creators, and professionals write
            faster, collaborate smarter, and stay productive — all in one
            beautiful workspace.
          </p>

          <div className="hero-buttons animate-pop-in">
            <button onClick={createNewDoc} className="cta-button primary">
              🚀 Start Writing Now
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="cta-button secondary"
            >
              ✨ Explore Templates
            </button>
          </div>

          <div className="hero-stats animate-slide-up">
            <div className="stat-box">
              <h3>10K+</h3>
              <p>Documents Created</p>
            </div>
            <div className="stat-box">
              <h3>99.9%</h3>
              <p>Auto Save Reliability</p>
            </div>
            <div className="stat-box">
              <h3>Real-Time</h3>
              <p>Instant Collaboration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-tag">✨ Features</div>
          <h2 className="section-title animate-slide-up">
            Powerful Features for Modern Workflows
          </h2>
          <p className="section-description animate-slide-up">
            Everything you need to write, organize, analyze, sketch, and
            collaborate seamlessly in one advanced workspace.
          </p>

          <div className="feature-grid">
            <div className="feature-card animate-card" onClick={createNewDoc}>
              <div className="feature-icon">➕</div>
              <h3>Real-Time Editing</h3>
              <p>
                Collaborate instantly with live document syncing, shared editing,
                and smooth team productivity.
              </p>
            </div>

            <div
              className="feature-card animate-card"
              onClick={() => navigate('/templates')}
            >
              <div className="feature-icon">📑</div>
              <h3>Professional Templates</h3>
              <p>
                Start faster with elegant, ready-to-use templates for notes,
                reports, letters, and more.
              </p>
            </div>

            <div
              className="feature-card animate-card"
              onClick={() => navigate('/word-counter')}
            >
              <div className="feature-icon">🔤</div>
              <h3>Advanced Analytics</h3>
              <p>
                Track words, reading time, writing density, and performance with
                intelligent writing insights.
              </p>
            </div>

            <div
              className="feature-card animate-card"
              onClick={() => navigate('/planner')}
            >
              <div className="feature-icon">📅</div>
              <h3>Productivity Tools</h3>
              <p>
                Plan tasks, structure your workflow, and stay organized with
                built-in productivity utilities.
              </p>
            </div>

            <div
              className="feature-card animate-card"
              onClick={() => navigate('/whiteboard')}
            >
              <div className="feature-icon">👨🏻‍🏫</div>
              <h3>Smart Whiteboard</h3>
              <p>
                Sketch, brainstorm, explain concepts, and export visual ideas
                with a smart digital board.
              </p>
            </div>

            <div
              className="feature-card animate-card"
              onClick={() => navigate('/documents')}
            >
              <div className="feature-icon">☁️</div>
              <h3>Cloud Access</h3>
              <p>
                Access your writing anywhere with seamless syncing and instant
                continuity across sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="steps-section">
        <div className="section-container">
          <div className="section-tag">⚙️ Workflow</div>
          <h2 className="section-title animate-slide-up">How It Works</h2>
          <p className="section-description animate-slide-up">
            Get started in seconds and collaborate without friction.
          </p>

          <div className="steps-container">
            <div className="step-card animate-card">
              <div className="step-number">1</div>
              <h3>Create or Join</h3>
              <p>
                Start a fresh document or jump into an existing workspace using
                a shareable link.
              </p>
            </div>

            <div className="step-card animate-card">
              <div className="step-number">2</div>
              <h3>Collaborate Live</h3>
              <p>
                Edit together in real-time, brainstorm instantly, and keep your
                team aligned.
              </p>
            </div>

            <div className="step-card animate-card">
              <div className="step-number">3</div>
              <h3>Save & Export</h3>
              <p>
                Auto-save protects your work while export options make sharing
                effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs */}
      <section id="blogs" className="blog-section">
        <div className="section-container">
          <div className="section-tag">📚 Knowledge Hub</div>
          <h2 className="section-title">Blogs & Webinars</h2>
          <p className="section-description">
            Learn productivity, collaboration, and smart document workflows.
          </p>

          <div className="blog-cards">
            <div className="blog-card">
              <h3>🔍 How Real-Time Collaboration Works</h3>
              <p>
                Understand the magic behind socket-based live syncing and how
                collaborative editors work under the hood.
              </p>
              <span className="blog-date">🗓️ June 2025</span>
            </div>

            <div className="blog-card">
              <h3>🎥 Webinar: Build a Doc Editor from Scratch</h3>
              <p>
                Explore our full live coding walkthrough session and learn how
                to architect your own collaborative editor.
              </p>
              <span className="blog-date">🗓️ May 2025</span>
            </div>

            <div className="blog-card">
              <h3>🧠 Productivity Tips for Remote Teams</h3>
              <p>
                Discover proven systems and digital habits that help remote
                teams work faster and smarter.
              </p>
              <span className="blog-date">🗓️ May 2025</span>
            </div>

            <div className="blog-card">
              <h3>💡 Top 5 Features Every Editor Should Have</h3>
              <p>
                From auto-save to export tools and templates — these are the
                must-have features users actually love.
              </p>
              <span className="blog-date">🗓️ June 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <div className="section-tag">💬 Testimonials</div>
          <h2 className="section-title animate-slide-up">
            Trusted by Thousands
          </h2>
          <p className="section-description animate-slide-up">
            Loved by students, educators, teams, founders, and professionals.
          </p>

          <div className="testimonials-grid">
            <div className="testimonial-card animate-card">
              <p>
                This tool has made my teaching workflow smoother and more
                interactive. It’s a must-have for modern educators.
              </p>
              <div className="quote-icon">❝</div>
              <div className="testimonial-author">
                <img
                  src="https://randomuser.me/api/portraits/men/67.jpg"
                  alt="Amit Verma"
                />
                <div>
                  <strong>Amit Verma</strong>
                  <span>Professor, Delhi University</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card animate-card">
              <div className="quote-icon">❝</div>
              <p>
                I use it daily for writing proposals and letters. The templates
                and real-time editing are just brilliant!
              </p>
              <div className="testimonial-author">
                <img
                  src="https://media.licdn.com/dms/image/v2/D4E03AQEyVjtZXXvJ8w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1725200277791?e=1762992000&v=beta&t=cOPnMk31jRQKi5Opueqfi63D-pP0ym_p86nUHvLcVS8"
                  alt="Indrasen Singh"
                />
                <div>
                  <strong>Indrasen Singh</strong>
                  <span>Student, Uttar Pradesh</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card animate-card">
              <div className="quote-icon">❝</div>
              <p>
                As a startup founder, this has been an essential tool for
                preparing investor decks and internal notes quickly.
              </p>
              <div className="testimonial-author">
                <img
                  src="https://randomuser.me/api/portraits/men/22.jpg"
                  alt="Rohan Mehta"
                />
                <div>
                  <strong>Rohan Mehta</strong>
                  <span>Founder, StartupX Bangalore</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card animate-card">
              <div className="quote-icon">❝</div>
              <p>
                This platform is perfect for school and college students. My
                notes are always saved and easy to access.
              </p>
              <div className="testimonial-author">
                <img
                  src="https://randomuser.me/api/portraits/women/58.jpg"
                  alt="Priya Singh"
                />
                <div>
                  <strong>Priya Singh</strong>
                  <span>B.Tech Student, IIT Kanpur</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card animate-card">
              <div className="quote-icon">❝</div>
              <p>
                This app helps me maintain my client documentation with zero
                hassle. It’s fast, reliable, and secure.
              </p>
              <div className="testimonial-author">
                <img
                  src="https://randomuser.me/api/portraits/men/45.jpg"
                  alt="Rajeev Nair"
                />
                <div>
                  <strong>Rajeev Nair</strong>
                  <span>Legal Advisor, Kochi</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card animate-card">
              <div className="quote-icon">❝</div>
              <p>
                Managing assignments and project reports is now easier than ever.
                A must-have tool for every student!
              </p>
              <div className="testimonial-author">
                <img
                  src="https://randomuser.me/api/portraits/women/47.jpg"
                  alt="Ananya Das"
                />
                <div>
                  <strong>Ananya Das</strong>
                  <span>MBA Student, IIM Calcutta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-section">
        <div className="section-container">
          <div className="section-tag">❓ FAQs</div>
          <h2 className="section-title animate-slide-up">
            Frequently Asked Questions
          </h2>

          <div className="faq-grid">
            <div className="faq-card animate-card">
              <h3>Is my data secure?</h3>
              <p>
                Yes, we use strong protection practices, encrypted workflows, and
                reliable backups to keep your content safe.
              </p>
            </div>

            <div className="faq-card animate-card">
              <h3>How many people can collaborate at once?</h3>
              <p>
                Multiple users can work together on a single document in
                real-time without friction.
              </p>
            </div>

            <div className="faq-card animate-card">
              <h3>What formats can I export to?</h3>
              <p>
                You can export your work into PDF, Word, TXT, and HTML formats
                while preserving content structure.
              </p>
            </div>

            <div className="faq-card animate-card">
              <h3>Can I use this offline?</h3>
              <p>
                Real-time collaboration requires internet currently, but offline
                improvements can be added later.
              </p>
            </div>

            <div className="faq-card animate-card">
              <h3>Is the app free to use?</h3>
              <p>
                Yes! Core features are free and designed to help students and
                professionals get started quickly.
              </p>
            </div>

            <div className="faq-card animate-card">
              <h3>Do I need to create an account?</h3>
              <p>
                No sign-up is required to start writing. Just open, create, and
                share your document instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="section-container cta-glass-box">
          <h2 className="animate-slide-up">
            Ready to Transform Your Workflow?
          </h2>
          <p className="animate-slide-up">
            Join thousands of users who write smarter and collaborate better
            with InkSync.
          </p>

          <div className="cta-buttons animate-slide-up">
            <button onClick={createNewDoc} className="cta-button primary">
              Start For Free
            </button>
            <button className="cta-button secondary">Schedule Demo</button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <div className="section-tag">📬 Contact</div>
          <h2>Get in Touch</h2>
          <p>Have questions or suggestions? We'd love to hear from you!</p>

          <div className="contact-icons">
            <a href="mailto:example@gmail.com" className="contact-icon">
              <i className="fas fa-envelope"></i>
              <span>Email Us</span>
            </a>

            <a
              href="https://facebook.com/"
              className="contact-icon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook"></i>
              <span>Facebook</span>
            </a>
          </div>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea
              placeholder="Your Message..."
              rows="4"
              required
            ></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="simple-footer">
        <div className="footer-container">
          <h2>InkSync</h2>
          <p>Collaborate. Write. Export. All in real-time.</p>
          <p className="footer-copy">© {new Date().getFullYear()} InkSync</p>
        </div>
      </footer>
    </div>
  );
}