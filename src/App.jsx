import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

const PoppingAvatar = ({ top, left, right, bottom, delay, size = "w-16 h-16 md:w-24 md:h-24" }) => {
  return (
    <motion.img
      src="/favicon-removebg.png" 
      alt="Patrick Spawning"
      className={`absolute ${size} rounded-full border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] object-cover pointer-events-none z-0`}
      style={{ top, left, right, bottom }}
      animate={{
        scale: [0, 1.2, 1, 1, 1.1, 0], 
        opacity: [0, 1, 1, 1, 1, 0],
        rotate: [-15, 5, -5, 10, -20], 
        y: [0, -10, 5, -5, 0] 
      }}
      transition={{
        duration: 4.5,
        ease: "easeInOut",
        repeat: Infinity,
        delay: delay,
        repeatDelay: Math.random() * 2 
      }}
    />
  );
};

const SpotlightCard = ({ children, className, index }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl transition-colors duration-500 hover:border-emerald-500/30 hover:bg-zinc-900/60 ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.12),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

const ProjectCarousel = ({ images }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 3500); 

    return () => clearInterval(interval);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -clientWidth : clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group mb-6">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-xl border border-white/10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
      >
        {images.map((img, i) => (
          <img key={i} src={img} alt={`Project screenshot ${i + 1}`} className="w-full shrink-0 snap-center object-cover h-56 bg-zinc-800/50" />
        ))}
      </div>
      
      <button onClick={() => scroll('left')} className="absolute left-2 top-1/2 -translate-y-1/2 bg-zinc-950/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-zinc-950 text-white backdrop-blur-sm z-20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      </button>
      <button onClick={() => scroll('right')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-950/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-zinc-950 text-white backdrop-blur-sm z-20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  
  // NEW: State variables to track email sending status
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(""); // "success" or "error"

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    setTimeout(() => { setIsLoading(false); }, 900);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // NEW: Completely rewritten Real-Time Email Handler
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendResult("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // IMPORTANT: Replace this string with the key Web3Forms emails you!
          access_key: "5c2a5346-70b4-4452-9e78-6b0a08dedf73", 
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `Portfolio Inquiry from ${formData.name}`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSendResult("success");
        // Wait 2 seconds so they can see the "Sent!" message, then close modal
        setTimeout(() => {
          setIsModalOpen(false);
          setFormData({ name: '', email: '', message: '' });
          setSendResult("");
        }, 2000);
      } else {
        setSendResult("error");
      }
    } catch (error) {
      console.log(error);
      setSendResult("error");
    } finally {
      setIsSending(false);
    }
  };

  const projects = [
    { 
      title: "bulsu-coe", type: "Web Platform", shortDesc: "A modern, responsive web platform for the BulSU College of Engineering. Built to improve digital accessibility and student communication, deployed via Vercel.", tags: ["JavaScript", "React", "Vercel"], link: "https://bulsu-coe.vercel.app",
      images: [
        "/projects/coe1.png",
        "/projects/coe2.png",
        "/projects/coe3.png",
        "/projects/coe4.png",
        "/projects/coe5.png"
      ]
    },
    { 
      title: "LuminAir-Flight-Booking", type: "Mobile Application", shortDesc: "A cross-platform mobile application designed for seamless flight searching and booking. Built to provide a smooth, intuitive user experience for travelers.", tags: ["Dart", "Flutter", "Mobile"],
      images: [
        "/projects/Luminair.png",
        "/projects/Luminair1.png",
        "/projects/Luminair2.png"
      ]
    },
    { 
      title: "Bulsu-blitz-slot-machine", type: "Full-Stack Web Game", shortDesc: "A full-stack, browser-based slot machine game utilizing PHP and MySQL for user authentication, virtual balance management, and randomized game logic.", tags: ["PHP", "MySQL", "JavaScript"],
      images: [
        "/projects/blitz.png",
        "/projects/blitz1.png",
        "/projects/blitz2.png",
        "/projects/blitz3.png",
        "/projects/blitz4.png" 
      ]
    },
    { 
      title: "Flood-Monitor", type: "Monitoring Dashboard", shortDesc: "A web-based dashboard designed to track, monitor, and display real-time flood data and environmental metrics.", tags: ["JavaScript", "Dashboard", "IoT"],
      images: [
        "/projects/flood.png",
        "/projects/flood1.png",
      ]
    }
  ];

  const skillGroups = [
    { category: "Languages", skills: ["JavaScript", "Python", "PHP", "Dart", "C++"] },
    { category: "Frontend & Mobile", skills: ["React", "Vue.js", "Flutter", "Tailwind CSS"] },
    { category: "Backend & Game Dev", skills: ["Node.js", "MySQL", "Unity Engine"] },
    { category: "Hardware & Tools", skills: ["Raspberry Pi", "ESP32", "Git", "Vercel"] }
  ];

  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }} className="relative min-h-screen bg-zinc-950 text-zinc-300 selection:bg-emerald-500/30 overflow-hidden">
      
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      </style>

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }} className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-t-2 border-emerald-500 border-r-transparent rounded-full mb-6" />
            <p className="text-emerald-500 font-mono text-sm tracking-widest uppercase opacity-80">Initializing_System</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center px-4 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-3xl font-bold text-white mb-2">Get in touch</h3>
              <p className="text-zinc-400 text-sm mb-8">Fill out the form below to send me a message directly.</p>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Your Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={isSending} className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Your Email</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={isSending} className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Message</label>
                  <textarea required rows="4" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} disabled={isSending} className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none disabled:opacity-50" placeholder="Hello Patrick, I would like to talk about..." />
                </div>
                
                {/* NEW: Dynamic Button State */}
                <button 
                  type="submit" 
                  disabled={isSending}
                  onMouseEnter={() => setIsHovering(true)} 
                  onMouseLeave={() => setIsHovering(false)} 
                  className={`w-full font-bold py-3.5 rounded-xl transition-all mt-4 ${
                    sendResult === "success" ? "bg-emerald-400 text-zinc-900" :
                    sendResult === "error" ? "bg-red-500 text-white" :
                    "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                  } disabled:opacity-70`}
                >
                  {isSending ? "Sending..." : sendResult === "success" ? "Message Sent! ✓" : sendResult === "error" ? "Error! Try Again." : "Send Message"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 origin-left z-50 pointer-events-none" style={{ scaleX }} />

      {/* Custom Cursor */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[60] flex items-center justify-center mix-blend-difference hidden md:flex"
        animate={{ 
          x: mousePos.x - 16, y: mousePos.y - 16,
          scale: isHovering ? 2.5 : 1,
          backgroundColor: isHovering ? "rgba(16, 185, 129, 1)" : "transparent",
          borderColor: isHovering ? "transparent" : "rgba(16, 185, 129, 0.5)",
          borderWidth: isHovering ? "0px" : "1px"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
      >
        <motion.div animate={{ opacity: isHovering ? 0 : 1 }} className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
      </motion.div>

      {!isLoading && <ParticleBackground />}

      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-zinc-950/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <motion.span whileHover={{ scale: 1.05 }} className="text-xl font-bold text-white tracking-tight cursor-pointer">&lt;Patrick /&gt;</motion.span>
          <div className="space-x-8 hidden md:flex items-center text-sm font-semibold text-zinc-400">
            <a href="#about" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="hover:text-emerald-400 transition-colors">About</a>
            <a href="#projects" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="hover:text-emerald-400 transition-colors">Work</a>
            <a href="#skills" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="hover:text-emerald-400 transition-colors">Arsenal</a>
            <motion.a 
              href="/resume.pdf" 
              download="JohnPatrick_DelaCruz_Resume.pdf"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsHovering(true)} 
              onMouseLeave={() => setIsHovering(false)}
              className="px-5 py-2 rounded-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              Resume
            </motion.a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 text-center z-10 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto relative z-10">
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2, type: "spring" }}>
            
            {/* --- The Spawning Ground --- */}
            <div className="relative inline-block mb-6 pt-10 px-10">
              
              {/* These are the 4 copies that will spawn around your name */}
              <PoppingAvatar top="-10%" left="-15%" delay={0.2} size="w-16 h-16" />
              <PoppingAvatar top="-5%" right="-20%" delay={1.5} size="w-20 h-20" />
              <PoppingAvatar bottom="-10%" left="-5%" delay={2.8} size="w-14 h-14" />
              <PoppingAvatar bottom="-5%" right="-10%" delay={4.0} size="w-24 h-24" />

              <motion.h1 
                animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter leading-tight relative z-10 drop-shadow-2xl"
              >
                John Patrick <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic font-bold">DC. Dela Cruz</span>
              </motion.h1>
            </div>

          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }} className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            Computer Engineering student exploring full-stack web development and indie game design. Always learning and eager to build.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1 }} 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            <motion.a 
              href="/resume.pdf" 
              download="JohnPatrick_DelaCruz_Resume.pdf"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsHovering(true)} 
              onMouseLeave={() => setIsHovering(false)}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              Download Resume
            </motion.a>
            <motion.a 
              href="#projects" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsHovering(true)} 
              onMouseLeave={() => setIsHovering(false)}
              className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900/50 border border-white/10 hover:bg-zinc-800 text-white rounded-full font-semibold transition-colors backdrop-blur-sm"
            >
              View Work
            </motion.a>
          </motion.div>

        </div>
      </section>

      <section id="about" className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Engineering <br/> <span className="text-emerald-400">Logic & Creativity</span></h2>
              <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mb-6"></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }} className="md:w-1/2 text-zinc-400 text-lg leading-relaxed space-y-6">
              <p>Currently pursuing my BS in Computer Engineering at Bulacan State University. While my studies have given me a solid foundation in systems and hardware logic, I've found my true passion in software development.</p>
              <p>My current focus is on building interactive web applications using React and Vue, alongside developing cozy indie games in Unity. I approach my projects with an engineering mindset, always looking for ways to improve my skills, write cleaner code, and create better user experiences.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="projects" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Featured Work</h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto md:mx-0 mb-6"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project, index) => (
              <SpotlightCard key={index} index={index} className="p-8">
                <ProjectCarousel images={project.images} />
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4 block mt-2">{project.type}</span>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{project.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium flex-grow">{project.shortDesc}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-white/5 text-zinc-300 text-xs font-semibold rounded-full border border-white/10">{tag}</span>
                  ))}
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="py-32 px-6 relative z-10 mb-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Technical Arsenal</h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mx-auto md:mx-0 mb-6"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skillGroups.map((group, groupIndex) => (
              <SpotlightCard key={groupIndex} index={groupIndex} className="p-8">
                <h3 className="text-xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
                  <span className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full"></span>
                  {group.category}
                </h3>
                <ul className="flex flex-wrap gap-3" aria-label={`${group.category} skills`}>
                  {group.skills.map((skill, index) => (
                    <motion.li 
                      key={index} 
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(16, 185, 129, 0.2)", borderColor: "rgba(16, 185, 129, 0.6)" }} 
                      onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                      className="px-4 py-2 bg-white/5 text-zinc-200 text-sm font-semibold rounded-xl border border-white/10 transition-colors shadow-sm list-none cursor-default"
                    >
                      {skill}
                    </motion.li>
                  ))}
                </ul>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <footer className="pt-12 pb-6 px-6 bg-zinc-950 border-t border-white/5 z-10 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="text-center md:text-left flex-1">
            <span className="text-2xl font-bold text-white tracking-tight block mb-4">&lt;Patrick /&gt;</span>
            <p className="text-zinc-400 text-sm max-w-xs mx-auto md:mx-0">
              Computer Engineering student looking for opportunities to build great software and learn from the industry.
            </p>
          </div>
          <div className="flex flex-col gap-4 flex-1 items-center md:items-start">
            <h4 className="text-white font-bold text-lg">Connect</h4>
            <div className="grid grid-cols-2 gap-4">
              <a href="https://github.com/johnpatrickdelacruz40-cyber" target="_blank" rel="noreferrer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                <span className="font-medium text-sm">GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/john-patrick-dela-cruz-" target="_blank" rel="noreferrer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                <span className="font-medium text-sm">LinkedIn</span>
              </a>
              <a href="https://web.facebook.com/delacruzjohnpatrickdelacruz" target="_blank" rel="noreferrer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <span className="font-medium text-sm">Facebook</span>
              </a>
              <a href="https://www.instagram.com/disziee/" target="_blank" rel="noreferrer" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span className="font-medium text-sm">Instagram</span>
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1 items-center md:items-start">
            <h4 className="text-white font-bold text-lg">Contact</h4>
            <div className="flex flex-col gap-4">
              <button onClick={() => setIsModalOpen(true)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="flex items-center gap-3 text-emerald-400 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-lg border border-emerald-500/20">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span className="font-medium text-sm">Send a Message</span>
              </button>
              <div className="flex items-center gap-3 text-zinc-400 px-2 cursor-default" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span className="font-medium tracking-wider text-sm">0930 940 8892</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/5 text-center text-zinc-500 text-xs font-medium">
          <p>© {new Date().getFullYear()} John Patrick DC. Dela Cruz.</p>
        </div>
      </footer>
    </div>
  );
}