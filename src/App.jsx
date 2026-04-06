import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

// --- NEW: Sound UX Helper ---
const playSound = (src) => {
  const audio = new Audio(src);
  audio.volume = 0.15;
  audio.play().catch(() => {}); 
};

// --- NEW: Liquid Pull Button (Magnetic CTA) ---
const LiquidButton = ({ children, href, download, onMouseEnter, onMouseLeave }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    mouseX.set(x * 0.4);
    mouseY.set(y * 0.4);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    onMouseLeave();
  };

  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  return (
    <motion.a
      href={href}
      download={download}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => {
        onMouseEnter();
        playSound("/pop.mp3");
      }}
      style={{ x: springX, y: springY }}
      className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 relative z-10"
    >
      {children}
    </motion.a>
  );
};

// --- NEW: Skill Orbit Component ---
const SkillOrbit = ({ skills }) => {
  return (
    <div className="relative w-full h-[450px] flex items-center justify-center overflow-hidden mb-20">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="z-20 text-emerald-400 font-bold text-xl drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
        &lt;Patrick /&gt;
      </motion.div>
      {skills.map((skill, i) => {
        const radius = 90 + i * 28;
        const duration = 20 + i * 5;
        return (
          <motion.div
            key={skill}
            className="absolute border border-white/5 rounded-full"
            style={{ width: radius * 2, height: radius * 2 }}
            animate={{ rotate: 360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <div 
              style={{ left: radius - 15, top: -15 }}
              className="absolute px-3 py-1 bg-zinc-900 border border-emerald-500/30 rounded-full text-[10px] text-zinc-400 whitespace-nowrap"
            >
              {skill}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const PoppingAvatar = ({ top, left, right, bottom, delay, size = "w-16 h-16 md:w-24 md:h-24" }) => {
  return (
    <motion.img
      src="/favicon-removebg.png"
      alt="Patrick Spawning"
      onViewportEnter={() => playSound("/pop.mp3")}
      className={`absolute ${size} rounded-full border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] object-cover pointer-events-none z-0`}
      style={{ top, left, right, bottom }}
      animate={{
        scale: [0, 1.2, 1, 1, 1.1, 0],
        opacity: [0, 1, 1, 1, 1, 0],
        rotate: [-15, 5, -5, 10, -20],
        y: [0, -10, 5, -5, 0]
      }}
      transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity, delay: delay, repeatDelay: Math.random() * 2 }}
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
        style={{ background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.12), transparent 80%)` }}
      />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </motion.div>
  );
};

const ProjectCarousel = ({ images }) => {
  const scrollRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) { scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' }); } 
        else { scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' }); }
      }
    }, 3500); 
    return () => clearInterval(interval);
  }, []);

  const scroll = (direction) => {
    playSound("/whoosh.mp3");
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -clientWidth : clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel mb-6 overflow-hidden rounded-xl border border-white/10">
      {/* NEW: Laser Scan Line */}
      <motion.div 
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_15px_#10b981] z-30 pointer-events-none opacity-0 group-hover/carousel:opacity-100"
      />
      <div className="absolute top-2 right-2 font-mono text-[8px] text-emerald-500 opacity-0 group-hover/carousel:opacity-100 animate-pulse z-30 uppercase bg-black/40 px-2 py-1 rounded">SCANNING_DATA...</div>

      <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {images.map((img, i) => (
          <img key={i} src={img} className="w-full shrink-0 snap-center object-cover h-56 bg-zinc-800/50 grayscale group-hover/carousel:grayscale-0 transition-all duration-700" />
        ))}
      </div>
      <button onClick={() => scroll('left')} className="absolute left-2 top-1/2 -translate-y-1/2 bg-zinc-950/60 p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity z-40 hover:bg-emerald-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      </button>
      <button onClick={() => scroll('right')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-950/60 p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity z-40 hover:bg-emerald-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
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
  
  // NEW: State for email sending process
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState("");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    setTimeout(() => { setIsLoading(false); }, 900);
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("scroll", handleScroll); };
  }, []);

  // NEW: Real Background Email Fetch
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
          // ⚠️ PUT YOUR KEY HERE! Replace the string below.
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
        // Wait 2 seconds so they see "Sent!", then clear and close
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
    { title: "bulsu-coe", type: "Web Platform", shortDesc: "A modern web platform for the BulSU College of Engineering.", tags: ["React", "Vercel"], images: ["/projects/coe1.png", "/projects/coe2.png", "/projects/coe3.png", "/projects/coe4.png", "/projects/coe5.png"] },
    { title: "LuminAir-Flight-Booking", type: "Mobile Application", shortDesc: "Cross-platform mobile application for flight searching.", tags: ["Dart", "Flutter"], images: ["/projects/Luminair.png", "/projects/Luminair1.png", "/projects/Luminair2.png"] },
    { title: "Bulsu-blitz-slot-machine", type: "Full-Stack Web Game", shortDesc: "Slot machine game utilizing PHP and MySQL.", tags: ["PHP", "MySQL"], images: ["/projects/blitz.png", "/projects/blitz1.png", "/projects/blitz2.png", "/projects/blitz3.png", "/projects/blitz4.png"] },
    { title: "Flood-Monitor", type: "Monitoring Dashboard", shortDesc: "Dashboard tracking real-time flood data metrics.", tags: ["JavaScript", "IoT"], images: ["/projects/flood.png", "/projects/flood1.png"] }
  ];

  const skillGroups = [
    { category: "Languages", skills: ["JavaScript", "Python", "PHP", "Dart", "C++"] },
    { category: "Frontend & Mobile", skills: ["React", "Vue.js", "Flutter", "Tailwind CSS"] },
    { category: "Backend & Game Dev", skills: ["Node.js", "MySQL", "Unity Engine"] },
    { category: "Hardware & Tools", skills: ["Raspberry Pi", "ESP32", "Git", "Vercel"] }
  ];

  const orbitSkills = ["React", "Vue", "Python", "PHP", "Dart", "Unity", "C++", "Vite", "NodeJS"];

  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }} className="relative min-h-screen bg-zinc-950 text-zinc-300 selection:bg-emerald-500/30 overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>

      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-t-2 border-emerald-500 border-r-transparent rounded-full mb-6" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center px-4 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} onMouseEnter={() => { setIsHovering(true); playSound("/click.mp3"); }} onMouseLeave={() => setIsHovering(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-3xl font-bold text-white mb-2">Get in touch</h3>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <input required disabled={isSending} type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" placeholder="Your Name" />
                <input required disabled={isSending} type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" placeholder="Your Email" />
                <textarea required disabled={isSending} rows="4" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50" placeholder="Message" />
                
                {/* NEW: Dynamic button based on status */}
                <button type="submit" disabled={isSending} className={`w-full font-bold py-3.5 rounded-xl transition-colors ${sendResult === 'success' ? 'bg-emerald-400 text-zinc-900' : sendResult === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'} disabled:opacity-70`}>
                  {isSending ? "Sending..." : sendResult === "success" ? "Message Sent! ✓" : sendResult === "error" ? "Error! Try Again." : "Send Message"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 origin-left z-50 pointer-events-none" style={{ scaleX }} />

      <motion.div className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[60] flex items-center justify-center mix-blend-difference hidden md:flex"
        animate={{ x: mousePos.x - 16, y: mousePos.y - 16, scale: isHovering ? 2.5 : 1, backgroundColor: isHovering ? "rgba(16, 185, 129, 1)" : "transparent", borderColor: isHovering ? "transparent" : "rgba(16, 185, 129, 0.5)", borderWidth: isHovering ? "0px" : "1px" }}
        transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
      >
        <motion.div animate={{ opacity: isHovering ? 0 : 1 }} className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
      </motion.div>

      {!isLoading && <ParticleBackground />}

      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-zinc-950/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <motion.span whileHover={{ scale: 1.05 }} className="text-xl font-bold text-white tracking-tight cursor-pointer">&lt;Patrick /&gt;</motion.span>
          <div className="space-x-8 hidden md:flex items-center text-sm font-semibold text-zinc-400">
            <a href="#about" onMouseEnter={() => { setIsHovering(true); playSound("/click.mp3"); }} onMouseLeave={() => setIsHovering(false)} className="hover:text-emerald-400 transition-colors">About</a>
            <a href="#projects" onMouseEnter={() => { setIsHovering(true); playSound("/click.mp3"); }} onMouseLeave={() => setIsHovering(false)} className="hover:text-emerald-400 transition-colors">Work</a>
            <a href="#skills" onMouseEnter={() => { setIsHovering(true); playSound("/click.mp3"); }} onMouseLeave={() => setIsHovering(false)} className="hover:text-emerald-400 transition-colors">Arsenal</a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 text-center z-10 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2, type: "spring" }}>
            <div className="relative inline-block mb-6 pt-10 px-10">
              <PoppingAvatar top="-10%" left="-15%" delay={0.2} size="w-16 h-16" />
              <PoppingAvatar top="-5%" right="-20%" delay={1.5} size="w-20 h-20" />
              <PoppingAvatar bottom="-10%" left="-5%" delay={2.8} size="w-14 h-14" />
              <PoppingAvatar bottom="-5%" right="-10%" delay={4.0} size="w-24 h-24" />
              <motion.h1 animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter leading-tight relative z-10 drop-shadow-2xl">
                John Patrick <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic font-bold">DC. Dela Cruz</span>
              </motion.h1>
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }} className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">Computer Engineering student exploring full-stack web development and indie game design.</motion.p>
          
          <div className="flex justify-center mt-8">
            <LiquidButton 
              href="/resume.pdf" 
              download="JohnPatrick_DelaCruz_Resume.pdf"
              onMouseEnter={() => setIsHovering(true)} 
              onMouseLeave={() => setIsHovering(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              Download Resume
            </LiquidButton>
          </div>
        </div>
      </section>

      <section id="skills-orbit" className="py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-10 tracking-tight uppercase opacity-50">Technical Universe</h2>
          <SkillOrbit skills={orbitSkills} />
        </div>
      </section>

      <section id="about" className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Engineering <br/> <span className="text-emerald-400">Logic & Creativity</span></h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mb-6"></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="md:w-1/2 text-zinc-400 text-lg leading-relaxed space-y-6">
            <p>Pursuing BS in Computer Engineering at Bulacan State University. Passionate about software development, React, Vue, and indie game dev in Unity.</p>
          </motion.div>
        </div>
      </section>

      <section id="projects" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-20">Featured Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project, index) => (
              <SpotlightCard key={index} index={index} className="p-8">
                <ProjectCarousel images={project.images} />
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{project.title}</h3>
                <p className="text-zinc-400 text-sm mb-6 flex-grow">{project.shortDesc}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.map(tag => <span key={tag} className="px-4 py-1.5 bg-white/5 text-zinc-300 text-xs rounded-full border border-white/10">{tag}</span>)}
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      <footer className="pt-12 pb-6 px-6 bg-zinc-950 border-t border-white/5 z-10 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="text-2xl font-bold text-white tracking-tight block mb-4">&lt;Patrick /&gt;</span>
            <p className="text-zinc-400 text-sm max-w-xs mx-auto md:mx-0">Bulacan-based student explorer.</p>
          </div>
          <div className="flex flex-col gap-4 flex-1 items-center md:items-start">
            <h4 className="text-white font-bold text-lg">Contact</h4>
            <button onClick={() => { setIsModalOpen(true); playSound("/click.mp3"); }} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-lg border border-emerald-500/20 transition-all">Send a Message</button>
            <span className="text-zinc-400 font-mono text-sm tracking-wider px-2">0930 940 8892</span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/5 text-center text-zinc-500 text-xs font-medium uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} John Patrick DC. Dela Cruz
        </div>
      </footer>
    </div>
  );
}