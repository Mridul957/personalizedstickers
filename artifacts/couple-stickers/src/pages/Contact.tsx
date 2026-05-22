import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, MessageSquare, Phone, Send, ChevronDown, CheckCircle, Sparkles, HelpCircle, ArrowLeft, MapPin } from "lucide-react";
import { Link } from "wouter";

// FAQ type definition
interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How long does shipping take?",
    answer: "Since each sticker pack is personalized, we design and print them within 1-2 business days. Standard shipping takes 3-5 business days domestically and 7-14 business days internationally.",
  },
  {
    question: "Can I use custom text for the stickers?",
    answer: "Absolutely! When you order, you can specify custom names, special dates, or inside jokes you want written on your couple sticker sheets.",
  },
  {
    question: "What image quality is recommended?",
    answer: "For the absolute best results, upload clear, well-lit photos. Portrait or square layouts work beautifully. Standard smartphone photos work perfectly!",
  },
  {
    question: "Can I edit my order after placing it?",
    answer: "Since we print custom items, we start processing quickly! Please email us at Mridulgupta957@gmail.com within 2 hours of ordering if you need to make changes.",
  },
];

export default function Contact() {
  // Accordion state
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  // Callback form states
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone) return;
    
    fetch("/api/contacts/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone: callbackPhone })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to request callback");
        return res.json();
      })
      .then(() => {
        setCallbackSubmitted(true);
        setTimeout(() => {
          setCallbackPhone("");
          setCallbackSubmitted(false);
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to request callback. Please check your connection.");
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    setStatus("sending");
    
    fetch("/api/contacts/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, phone, subject, message })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit message");
        return res.json();
      })
      .then(() => {
        setStatus("success");
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      })
      .catch((err) => {
        console.error(err);
        setStatus("idle");
        alert("Failed to send message. Please check your connection.");
      });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col justify-between" style={{ background: "hsl(204,46%,9%)" }}>
      {/* Ambient background blobs using the brand palette */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Teal blob — top left */}
        <div className="blob-1 absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-35"
          style={{ background: "radial-gradient(circle, rgba(43,170,143,0.7) 0%, transparent 70%)" }} />
        {/* Golden yellow blob — top right */}
        <div className="blob-2 absolute top-[5%] right-[-10%] w-[550px] h-[550px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(232,196,90,0.6) 0%, transparent 70%)" }} />
        {/* Orange blob — mid left */}
        <div className="blob-3 absolute top-[45%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(240,147,106,0.6) 0%, transparent 70%)" }} />
        {/* Coral blob — bottom right */}
        <div className="blob-4 absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full opacity-22"
          style={{ background: "radial-gradient(circle, rgba(232,87,58,0.5) 0%, transparent 70%)" }} />
      </div>

      <Navbar />

      {/* Main Content Area */}
      <main className="container max-w-6xl mx-auto px-6 pt-32 pb-20 flex-grow">
        
        {/* Back navigation button */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="mb-8"
        >
          <Link href="/">
            <span className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer transition-colors duration-200" style={{ color: "rgba(43,170,143,0.85)" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </span>
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(43,170,143,0.12)", border: "1px solid rgba(43,170,143,0.25)", color: "rgba(43,170,143,0.95)" }}>
            <Sparkles className="w-3.5 h-3.5" /> Support & Questions
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight"
            style={{ color: "hsl(43,80%,92%)", textShadow: "0 0 80px rgba(43,170,143,0.3)", letterSpacing: "-0.02em" }}>
            We'd Love to <span style={{ background: "linear-gradient(135deg, rgba(232,196,90,0.95), rgba(240,147,106,0.9), rgba(232,87,58,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Hear From You ✨</span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: "rgba(232,196,90,0.55)" }}>
            Have a question about sticker sheets, shipping, or customizing your order? Drop us a line or browse our FAQs.
          </p>
        </motion.div>

        {/* Contact Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Info & FAQs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Quick Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="p-6 md:p-8 rounded-3xl"
              style={{
                background: "rgba(16,36,50,0.6)",
                backdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(43,170,143,0.2)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(232,196,90,0.08)",
              }}
            >
              <h2 className="text-xl font-extrabold mb-2" style={{ color: "hsl(43,80%,92%)" }}>Get in Touch</h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(232,196,90,0.45)" }}>
                Our customer care squad responds to messages as quickly as possible.
              </p>

              <div className="flex flex-col gap-4">
                <a href="mailto:Mridulgupta957@gmail.com" className="flex items-center gap-4 p-3 rounded-2xl group transition-all"
                  style={{ background: "rgba(12,28,38,0.4)", border: "1px solid rgba(43,170,143,0.1)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: "rgba(43,170,143,0.15)", color: "rgba(43,170,143,0.9)" }}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(43,170,143,0.6)" }}>Email Support</p>
                    <p className="text-sm font-bold group-hover:underline" style={{ color: "hsl(43,80%,85%)" }}>Mridulgupta957@gmail.com</p>
                  </div>
                </a>

                <a href="tel:+91958825614" className="flex items-center gap-4 p-3 rounded-2xl group transition-all"
                  style={{ background: "rgba(12,28,38,0.4)", border: "1px solid rgba(43,170,143,0.1)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: "rgba(240,147,106,0.15)", color: "rgba(240,147,106,0.9)" }}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(240,147,106,0.6)" }}>Call Support</p>
                    <p className="text-sm font-bold group-hover:underline" style={{ color: "hsl(43,80%,85%)" }}>+91 958825614</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-3 rounded-2xl"
                  style={{ background: "rgba(12,28,38,0.4)", border: "1px solid rgba(43,170,143,0.1)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(232,196,90,0.15)", color: "rgba(232,196,90,0.9)" }}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(232,196,90,0.6)" }}>Active Hours</p>
                    <p className="text-sm font-bold" style={{ color: "hsl(43,80%,85%)" }}>Mon - Fri, 9am - 6pm IST</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-2xl"
                  style={{ background: "rgba(12,28,38,0.4)", border: "1px solid rgba(43,170,143,0.1)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(232,87,58,0.15)", color: "rgba(232,87,58,0.9)" }}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(232,87,58,0.6)" }}>Operations Address</p>
                    <p className="text-sm font-bold" style={{ color: "hsl(43,80%,85%)" }}>Jaipur, Rajasthan, India</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Request Callback Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="p-6 md:p-8 rounded-3xl relative overflow-hidden"
              style={{
                background: "rgba(16,36,50,0.6)",
                backdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(232,196,90,0.2)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(232,196,90,0.08)",
              }}
            >
              <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(232,196,90,0.4), transparent)" }} />
              <h2 className="text-xl font-extrabold mb-2" style={{ color: "hsl(43,80%,92%)" }}>Let's Talk! 📞</h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(232,196,90,0.45)" }}>
                Want to discuss your order or customize your stickers? Leave your mobile number and we will call you back!
              </p>
              
              <AnimatePresence mode="wait">
                {callbackSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }}
                    className="text-center py-4 rounded-2xl"
                    style={{ background: "rgba(43,170,143,0.08)", border: "1px solid rgba(43,170,143,0.2)" }}
                  >
                    <p className="text-sm font-bold" style={{ color: "rgba(43,170,143,0.95)" }}>✨ Callback requested! We'll call you shortly.</p>
                  </motion.div>
                ) : (
                  <motion.form 
                    initial={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onSubmit={handleCallbackSubmit} 
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="tel"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder="Your mobile number"
                      className="flex-grow h-10 px-4 text-xs rounded-xl border outline-none transition-all duration-300 font-medium placeholder:opacity-30"
                      style={{
                        background: "rgba(12,28,38,0.45)",
                        borderColor: "rgba(232,196,90,0.2)",
                        color: "hsl(43,80%,96%)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(232,196,90,0.6)";
                        e.target.style.boxShadow = "0 0 10px rgba(232,196,90,0.15)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(232,196,90,0.2)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="h-10 px-5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(232,196,90,0.9), rgba(240,147,106,0.85))",
                        border: "1px solid rgba(232,196,90,0.4)",
                        color: "hsl(204,46%,9%)",
                      }}
                    >
                      Request
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* FAQs Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-6 md:p-8 rounded-3xl"
              style={{
                background: "rgba(16,36,50,0.6)",
                backdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(43,170,143,0.15)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(232,196,90,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5" style={{ color: "rgba(232,196,90,0.7)" }} />
                <h2 className="text-xl font-extrabold" style={{ color: "hsl(43,80%,92%)" }}>Quick FAQs</h2>
              </div>

              <div className="flex flex-col gap-3">
                {FAQS.map((item, index) => {
                  const isOpen = expandedIndex === index;
                  return (
                    <div
                      key={index}
                      className="border-b last:border-0 pb-3 last:pb-0"
                      style={{ borderColor: "rgba(43,170,143,0.1)" }}
                    >
                      <button
                        onClick={() => setExpandedIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between py-2 text-left font-bold text-sm transition-colors group"
                        style={{ color: isOpen ? "rgba(43,170,143,0.9)" : "hsl(43,80%,82%)" }}
                      >
                        <span className="pr-4 group-hover:text-[hsl(43,80%,92%)] transition-colors">{item.question}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="w-4 h-4 opacity-60" />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs py-2 leading-relaxed" style={{ color: "rgba(232,196,90,0.45)" }}>
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>

          {/* Right Column: Premium Interactive Contact Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="relative p-6 md:p-10 rounded-3xl"
              style={{
                background: "rgba(16,36,50,0.7)",
                backdropFilter: "blur(32px) saturate(180%)",
                border: "1px solid rgba(43,170,143,0.25)",
                boxShadow: "0 15px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(232,196,90,0.12)",
              }}
            >
              {/* Highlight Top border glow */}
              <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(43,170,143,0.6), transparent)" }} />

              <AnimatePresence mode="wait">
                {status !== "success" ? (
                  <motion.div
                    key="form-container"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-black mb-1" style={{ color: "hsl(43,80%,92%)", letterSpacing: "-0.01em" }}>
                      Send us a Message 💌
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "rgba(232,196,90,0.5)" }}>
                      Fill out this form and we'll reply directly to your email inbox.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                      
                      {/* Name input */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(43,170,143,0.85)" }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your beautiful name"
                          className="w-full h-11 px-4 text-sm rounded-xl border outline-none transition-all duration-300 font-medium placeholder:opacity-30"
                          style={{
                            background: "rgba(12,28,38,0.45)",
                            borderColor: "rgba(43,170,143,0.2)",
                            color: "hsl(43,80%,96%)",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.7)";
                            e.target.style.boxShadow = "0 0 15px rgba(43,170,143,0.25), inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.2)";
                            e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                        />
                      </div>

                      {/* Email input */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(43,170,143,0.85)" }}>
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full h-11 px-4 text-sm rounded-xl border outline-none transition-all duration-300 font-medium placeholder:opacity-30"
                          style={{
                            background: "rgba(12,28,38,0.45)",
                            borderColor: "rgba(43,170,143,0.2)",
                            color: "hsl(43,80%,96%)",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.7)";
                            e.target.style.boxShadow = "0 0 15px rgba(43,170,143,0.25), inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.2)";
                            e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                        />
                      </div>

                      {/* Mobile Number input */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(43,170,143,0.85)" }}>
                          Mobile Number (Optional)
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full h-11 px-4 text-sm rounded-xl border outline-none transition-all duration-300 font-medium placeholder:opacity-30"
                          style={{
                            background: "rgba(12,28,38,0.45)",
                            borderColor: "rgba(43,170,143,0.2)",
                            color: "hsl(43,80%,96%)",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.7)";
                            e.target.style.boxShadow = "0 0 15px rgba(43,170,143,0.25), inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.2)";
                            e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                        />
                      </div>

                      {/* Subject input */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(43,170,143,0.85)" }}>
                          Subject
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="What can we help you with?"
                          className="w-full h-11 px-4 text-sm rounded-xl border outline-none transition-all duration-300 font-medium placeholder:opacity-30"
                          style={{
                            background: "rgba(12,28,38,0.45)",
                            borderColor: "rgba(43,170,143,0.2)",
                            color: "hsl(43,80%,96%)",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.7)";
                            e.target.style.boxShadow = "0 0 15px rgba(43,170,143,0.25), inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.2)";
                            e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                        />
                      </div>

                      {/* Message input */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(43,170,143,0.85)" }}>
                          Your Message
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message here..."
                          className="w-full p-4 text-sm rounded-xl border outline-none transition-all duration-300 font-medium placeholder:opacity-30 resize-none"
                          style={{
                            background: "rgba(12,28,38,0.45)",
                            borderColor: "rgba(43,170,143,0.2)",
                            color: "hsl(43,80%,96%)",
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.7)";
                            e.target.style.boxShadow = "0 0 15px rgba(43,170,143,0.25), inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "rgba(43,170,143,0.2)";
                            e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.3)";
                          }}
                        />
                      </div>

                      {/* Premium animated submit button */}
                      <motion.button
                        type="submit"
                        disabled={status === "sending"}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full h-12 rounded-xl flex items-center justify-center font-bold text-sm cursor-pointer overflow-hidden transition-all duration-200"
                        style={{
                          background: "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.85))",
                          border: "1px solid rgba(232,196,90,0.45)",
                          boxShadow: "0 4px 20px rgba(43,170,143,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                          color: "hsl(204,46%,9%)",
                        }}
                      >
                        {status === "sending" ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                            />
                            <span>Sending Love... 💌</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Send Message</span>
                            <Send className="w-4 h-4" />
                          </div>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  /* Success State Animation Card */
                  <motion.div
                    key="success-container"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center py-12 px-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 }}
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
                      style={{ background: "rgba(43,170,143,0.15)", border: "1px solid rgba(43,170,143,0.4)" }}
                    >
                      <CheckCircle className="w-8 h-8" style={{ color: "rgb(43,170,143)" }} />
                    </motion.div>

                    <h2 className="text-2xl font-black mb-3 font-sans" style={{ color: "hsl(43,80%,92%)", letterSpacing: "-0.01em" }}>
                      Message Sent! 💖
                    </h2>
                    <p className="text-sm max-w-sm mx-auto mb-8 leading-relaxed" style={{ color: "rgba(232,196,90,0.5)" }}>
                      Thank you for reaching out to us. We have received your query and our team will email you back within 24 hours.
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatus("idle")}
                      className="rounded-full px-8 py-2.5 text-xs font-bold transition-all duration-300"
                      style={{
                        background: "rgba(43,170,143,0.15)",
                        border: "1px solid rgba(43,170,143,0.35)",
                        color: "rgba(43,170,143,0.95)",
                      }}
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
