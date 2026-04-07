import { useState } from 'react';
import { Form as FormPrimitive } from '@base-ui/react/form';
import { Field as FieldPrimitive } from '@base-ui/react/field';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { MapPin, Phone, Mail, Loader2 } from 'lucide-react';

/* ── Shared input wrapper style ── */
const inputStyle = {
  width: '100%',
  padding: '0.7rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'var(--light-bg)',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  color: 'var(--text-main)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.45rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--text-main)',
};

const errorStyle = {
  display: 'block',
  marginTop: '0.35rem',
  fontSize: '0.75rem',
  color: '#e53e3e',
};

/* ── Sub-components ── */
function Field({ children, name, style }) {
  return (
    <FieldPrimitive.Root name={name} style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {children}
    </FieldPrimitive.Root>
  );
}

function FieldLabel({ children }) {
  return <FieldPrimitive.Label style={labelStyle}>{children}</FieldPrimitive.Label>;
}

function FieldError({ children }) {
  return <FieldPrimitive.Error style={errorStyle}>{children}</FieldPrimitive.Error>;
}

function StyledInput(props) {
  return (
    <InputPrimitive
      style={inputStyle}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--cyan)';
        e.target.style.boxShadow = '0 0 0 3px rgba(31,202,211,0.15)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    />
  );
}

function StyledSelect({ children, ...props }) {
  return (
    <select
      style={inputStyle}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--cyan)';
        e.target.style.boxShadow = '0 0 0 3px rgba(31,202,211,0.15)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    >
      {children}
    </select>
  );
}

function StyledTextarea({ ...props }) {
  return (
    <textarea
      style={{ ...inputStyle, resize: 'none' }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--cyan)';
        e.target.style.boxShadow = '0 0 0 3px rgba(31,202,211,0.15)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    />
  );
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: 'none',
        background: loading ? 'var(--cyan-hover)' : 'var(--cyan)',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'background 0.2s, opacity 0.2s',
        opacity: loading ? 0.8 : 1,
      }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--cyan-hover)'; }}
      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--cyan)'; }}
    >
      {loading ? (
        <>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          Sending…
        </>
      ) : children}
    </button>
  );
}

/* ── Contact info item ── */
function ContactItem({ icon: Icon, title, children }) {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.25rem' }}>
      <div style={{
        width: 48, height: 48,
        background: 'rgba(31,202,211,0.1)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--cyan)', flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>
      <div>
        <h4 style={{ color: 'var(--navy)', marginBottom: '0.4rem', fontSize: '1rem' }}>{title}</h4>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, fontSize: '0.95rem' }}>{children}</p>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay — replace with real API call
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <>
      {/* Spin keyframe injected once */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <section className="section" style={{ paddingTop: 140 }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '5rem',
            alignItems: 'start',
          }}>

            {/* ── Left: info ── */}
            <div>
              <span className="tag">Get in Touch</span>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', margin: '1.25rem 0', lineHeight: 1.15 }}>
                Let&apos;s Decode the Future Together.
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2.75rem' }}>
                Whether you are a clinician looking for research collaborations, a patient interested in our
                platforms, or a scientist passionate about the microbiome, we&apos;d love to hear from you.
              </p>

              <ContactItem icon={MapPin} title="Our Office">
                Jivanu Therapeutics Private Limited<br />
                Centre for Cellular and Molecular Platforms (C-CAMP)<br />
                GKVK Post, Bellary Road.<br />
                Bengaluru, Karnataka 560065
              </ContactItem>

              <ContactItem icon={Phone} title="Phone">
                +91 99017 60201<br />+91 89049 92860
              </ContactItem>

              <ContactItem icon={Mail} title="Email">
                info@jivanutx.com
              </ContactItem>
            </div>

            {/* ── Right: form card ── */}
            <div style={{
              background: 'var(--white)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
            }}>
              <h3 style={{ marginBottom: '1.75rem', color: 'var(--navy)', fontSize: '1.35rem' }}>
                Send us a message
              </h3>

              {sent ? (
                <div style={{
                  textAlign: 'center', padding: '2.5rem 1rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(31,202,211,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Mail size={26} color="var(--cyan)" />
                  </div>
                  <h4 style={{ color: 'var(--navy)', fontSize: '1.1rem' }}>Message sent!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Thanks for reaching out — we&apos;ll get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    style={{
                      marginTop: '0.5rem', background: 'none', border: '1px solid var(--cyan)',
                      color: 'var(--cyan)', borderRadius: '8px', padding: '0.5rem 1.25rem',
                      cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
                    }}
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <FormPrimitive
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  {/* First / Last */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field name="firstName">
                      <FieldLabel>First Name</FieldLabel>
                      <StyledInput placeholder="John" required />
                      <FieldError>Required</FieldError>
                    </Field>
                    <Field name="lastName">
                      <FieldLabel>Last Name</FieldLabel>
                      <StyledInput placeholder="Doe" required />
                      <FieldError>Required</FieldError>
                    </Field>
                  </div>

                  {/* Email */}
                  <Field name="email">
                    <FieldLabel>Email Address</FieldLabel>
                    <StyledInput type="email" placeholder="john@example.com" required />
                    <FieldError>Please enter a valid email.</FieldError>
                  </Field>

                  {/* Inquiry type */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={labelStyle} htmlFor="inquiryType">Inquiry Type</label>
                    <StyledSelect id="inquiryType" name="inquiryType" required defaultValue="">
                      <option value="" disabled>Select an option…</option>
                      <option value="Jivanu Atlas (Microbiome Test)">Jivanu Atlas (Microbiome Test)</option>
                      <option value="Rebiome (FMT procedure)">Rebiome (FMT procedure)</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="General enquiry">General enquiry</option>
                    </StyledSelect>
                  </div>

                  {/* Message */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={labelStyle} htmlFor="message">Message</label>
                    <StyledTextarea id="message" name="message" rows={5} placeholder="How can we help?" required />
                  </div>

                  <SubmitButton loading={loading}>Send Message</SubmitButton>
                </FormPrimitive>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
