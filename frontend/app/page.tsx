'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Brain, Zap, GitBranch, MessageSquare, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigateToExplore = () => {
    setIsEntering(true);
    setTimeout(() => {
      router.push('/explore');
    }, 1000);
  };

  const faqs = [
    {
      q: "What powers Throvic?",
      a: "Throvic is powered by state-of-the-art AI language models, which process complex topics and structure them into a dynamic, traversable knowledge graph."
    },
    {
      q: "Is the knowledge graph infinite?",
      a: "Yes! Every time you expand a node, Throvic actively fetches and generates deeper contextual branches on the fly."
    },
    {
      q: "Can I share my findings?",
      a: "Absolutely. Every search creates a unique URL parameter so you can instantly share your exact knowledge state with peers."
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#e8e6f0] font-sans selection:bg-[#7F77DD]/30 relative">
      
      {/* Background Fixed Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0d0d14]">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Ambient glows */}
        <motion.div 
          animate={{ y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-[#7F77DD]/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-[#5DCAA5]/20 blur-[120px] rounded-full" 
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d14]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tight text-white font-display"
          >
            Thro<span className="text-[#7F77DD]">vic</span>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#suggestions" className="hover:text-white transition-colors">Suggestions</a>
          </div>

          <div className="hidden md:block">
            <button 
              onClick={navigateToExplore}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all hover:scale-105 active:scale-95"
            >
              Open App
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden text-white/70 hover:text-white p-2" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0d0d14]/95 backdrop-blur-xl md:hidden pt-24 px-6"
          >
            <div className="flex flex-col gap-6 text-lg font-medium text-white/80">
              <a href="#how-it-works" onClick={toggleMenu} className="hover:text-[#7F77DD]">How it Works</a>
              <a href="#faq" onClick={toggleMenu} className="hover:text-[#7F77DD]">FAQ</a>
              <a href="#suggestions" onClick={toggleMenu} className="hover:text-[#7F77DD]">Suggestions</a>
              <button 
                onClick={() => { toggleMenu(); navigateToExplore(); }}
                className="mt-4 py-3 rounded-xl bg-gradient-to-r from-[#7F77DD] to-[#5DCAA5] text-white shadow-lg shadow-[#7F77DD]/20"
              >
                Launch Explorer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#AFA9EC] mb-6 inline-block">
              🚀 Throvic Public Beta
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 font-display leading-tight">
              The thrill of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7F77DD] to-[#5DCAA5]">
                knowing more.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              Dive into an infinite, interactive knowledge graph. Explore complex topics, discover hidden connections, and visualize the universe of information like never before. 
              <br/><span className="text-sm opacity-60 mt-2 block">Currently in beta. Node generation leverages AI and may take a few seconds to populate.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center sm:flex-row gap-4 mb-20 md:mb-32 justify-center w-full"
          >
            <button 
              onClick={navigateToExplore}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#7F77DD] to-[#5DCAA5] text-white font-semibold text-lg shadow-[0_0_40px_rgba(127,119,221,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(127,119,221,0.5)] active:scale-95"
            >
              Explore Graph <ArrowRight size={20} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full max-w-5xl mx-auto rounded-xl p-2 md:p-4 bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl"
          >
            <img 
              src="/demo.webp?v=2" 
              alt="Throvic Knowledge Graph Physics Demo" 
              className="w-full h-auto rounded-lg shadow-inner ring-1 ring-white/10 brightness-90 contrast-125"
            />
          </motion.div>
        </section>

        {/* Features / How it Works */}
        <section id="how-it-works" className="py-20 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">How Throvic Works</h2>
            <p className="text-white/60 max-w-xl mx-auto">Seamlessly transition from curiosity to profound understanding.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5, borderColor: "rgba(127,119,221,0.4)" }}
              className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#7F77DD]/20 flex items-center justify-center text-[#7F77DD] mb-6 shadow-[0_0_20px_rgba(127,119,221,0.2)]">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Spark Curiosity</h3>
              <p className="text-white/60 leading-relaxed">Enter any seed topic—from Quantum Mechanics to the History of Jazz—and let the engine plant the root.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5, borderColor: "rgba(93,202,165,0.4)" }}
              className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#5DCAA5]/20 flex items-center justify-center text-[#5DCAA5] mb-6 shadow-[0_0_20px_rgba(93,202,165,0.2)]">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Expansion</h3>
              <p className="text-white/60 leading-relaxed">Our AI instantly contextualizes and unearths deeply related subtopics, visualizing them in real-time.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5, borderColor: "rgba(239,159,39,0.4)" }}
              className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EF9F27]/20 flex items-center justify-center text-[#EF9F27] mb-6 shadow-[0_0_20px_rgba(239,159,39,0.2)]">
                <GitBranch size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Infinite Traversal</h3>
              <p className="text-white/60 leading-relaxed">Click any node to dynamically generate new branches. Dive endlessly down the rabbit hole.</p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-medium text-white">{faq.q}</span>
                  <ChevronDown className={`text-white/50 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-white/60 leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Suggestions Form */}
        <section id="suggestions" className="pt-20 pb-16 lg:pt-32 lg:pb-24 max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-8 md:p-12 rounded-3xl text-center backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 bg-[#7F77DD]/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-white mb-6">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 font-display">Help Shape Throvic</h2>
            <p className="text-white/60 mb-8">We are actively testing the beta. If the graph breaks or you have a feature idea, let us know directly!</p>
            
            <form action="https://formspree.io/f/xvgzzeqq" method="POST" className="flex flex-col gap-4 text-left relative z-10">
              {/* NOTE: User should replace the action URL with their actual formspree endpoint if needed, added placeholder endpoint */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Your Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="w-full bg-[#0d0d14]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7F77DD]/50 focus:ring-1 focus:ring-[#7F77DD]/50 transition-all font-sans"
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  className="w-full bg-[#0d0d14]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7F77DD]/50 focus:ring-1 focus:ring-[#7F77DD]/50 transition-all font-sans"
                  placeholder="john@example.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Your Suggestion</label>
                <textarea 
                  name="message" 
                  required
                  rows={4}
                  className="w-full bg-[#0d0d14]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7F77DD]/50 focus:ring-1 focus:ring-[#7F77DD]/50 transition-all font-sans resize-none"
                  placeholder="I would love to see..." 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-4 mt-2 rounded-xl bg-white text-[#0d0d14] font-bold text-lg hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Send Feedback
              </button>
            </form>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <div className="text-xl font-bold tracking-tight text-white font-display">
              Thro<span className="text-[#7F77DD]">vic</span>
            </div>
          </div>
          <div className="text-white/50 text-sm">
            © {new Date().getFullYear()} Throvic. All rights reserved.
          </div>
          <div className="text-white/50 text-sm flex items-center gap-1">
            Design & developed by 
            <a 
              href="https://yash635644.github.io/yash-portfolio/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-[#5DCAA5] hover:underline transition-colors font-medium ml-1"
            >
              Yash Trivedi
            </a>
          </div>
        </div>
      </footer>

      {/* Page Transition Overlay */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#0d0d14] flex items-center justify-center pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex flex-col items-center gap-6 text-white"
            >
              <div className="w-12 h-12 border-4 border-[#7F77DD]/30 border-t-[#7F77DD] rounded-full animate-spin" />
              <h2 className="text-xl md:text-2xl font-display font-medium tracking-wide">Initializing Knowledge Engine...</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
