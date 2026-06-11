'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger client-side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Luxury Treatments Data for Showcase
const TREATMENTS = [
  {
    id: 'balayage',
    tabName: 'Honey Balayage',
    name: 'Signature Honey Balayage',
    beforeImg: '/images/hair_color_before.png',
    afterImg: '/images/hair_color_after.png',
    beforeLabel: 'Dull Natural Hair',
    afterLabel: 'Luminous Honey Balayage',
    duration: '4 Hours',
    stylist: 'Ananya Sharma (Master Colorist)',
    details: 'Custom hand-painted highlights tailored to enhance natural skin tones. Includes deep restructuring hair spa and signature blowout.',
    price: '₹7,500'
  },
  {
    id: 'bridal',
    tabName: 'Bridal Styling',
    name: 'Luxury Bridal Makeover',
    beforeImg: '/images/bridal_before.png',
    afterImg: '/images/bridal_after.png',
    beforeLabel: 'Pre-styling Portrait',
    afterLabel: 'Complete Bridal Glow',
    duration: '6 Hours',
    stylist: 'Rohan Malhotra (Bridal Director)',
    details: 'Traditional and HD airbrush makeup matching royal aesthetic. Includes jewelry setting, hair styling, and saree/lehenga draping.',
    price: '₹25,000'
  },
  {
    id: 'keratin',
    tabName: 'Keratin Therapy',
    name: 'Silk Keratin Therapy',
    beforeImg: '/images/keratin_before.png',
    afterImg: '/images/keratin_after.png',
    beforeLabel: 'Frizzy & Tangled Hair',
    afterLabel: 'Silky Smooth & Straight',
    duration: '3.5 Hours',
    stylist: 'Priya Verma (Art Director)',
    details: 'Advanced protein treatment restoring hair structure, sealing cuticles, and removing 95% of frizz. Results last up to 4 months.',
    price: '₹9,000'
  },
  {
    id: 'facial',
    tabName: 'Glass Skin Facial',
    name: 'Glass Skin Gold Facial',
    beforeImg: '/images/makeup_before.png',
    afterImg: '/images/makeup_after.png',
    beforeLabel: 'Natural Skin Base',
    afterLabel: 'Dewy Glass Skin Glow',
    duration: '2 Hours',
    stylist: 'Sana Kapoor (Skincare Lead)',
    details: 'Multi-step micro-exfoliation infused with 24K gold serum, hyaluronic acid, and collagen-boosting LED light therapy.',
    price: '₹5,500'
  }
];

function PremiumScissor() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
      {/* Left loop (top finger hole) */}
      <circle cx="6" cy="7" r="2.5" stroke="#B58A2A" strokeWidth="2" fill="none" />
      {/* Left loop (bottom finger hole) */}
      <circle cx="6" cy="17" r="2.5" stroke="#B58A2A" strokeWidth="2" fill="none" />
      {/* Blades intersecting at pivot (12,12) */}
      <path d="M8.5 8.5 L 12 12 L 21 16.5" stroke="#B58A2A" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 15.5 L 12 12 L 21 7.5" stroke="#B58A2A" strokeWidth="2" strokeLinecap="round" />
      {/* Pivot screw */}
      <circle cx="12" cy="12" r="1.2" fill="#8A6A1F" stroke="#FFFFFF" strokeWidth="0.5" />
    </svg>
  );
}

function MainShowcaseReveal({ treatment }) {
  const [revealX, setRevealX] = useState(50);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);
  const scissorRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    // Smoothly animate the reveal mask percent
    gsap.to(containerRef.current, {
      '--reveal-x': `${percentage}%`,
      duration: 0.15,
      ease: 'power2.out',
      onUpdate: () => setRevealX(percentage)
    });

    // Move scissor helper
    if (scissorRef.current) {
      gsap.to(scissorRef.current, {
        x: x,
        y: y,
        duration: 0.1,
        ease: 'power2.out'
      });
    }
  };

  // Reset reveal line when treatment switches
  useEffect(() => {
    setRevealX(50);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        '--reveal-x': '50%',
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [treatment.id]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Massive reveal frame */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden w-full aspect-[16/9] md:aspect-[21/9] rounded-[32px] border border-[#E8DCC5]/50 shadow-2xl group cursor-none select-none"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          gsap.to(containerRef.current, {
            '--reveal-x': '50%',
            duration: 0.4,
            ease: 'power2.out',
            onUpdate: () => setRevealX(50)
          });
        }}
        onMouseMove={handleMouseMove}
        style={{ '--reveal-x': '50%' }}
      >
        {/* Before Image (underneath) */}
        <img src={treatment.beforeImg} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
        
        {/* After Image (clipped from the left) */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: `polygon(var(--reveal-x) 0, 100% 0, 100% 100%, var(--reveal-x) 100%)`
          }}
        >
          <img src={treatment.afterImg} alt="After" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        {/* Slicing Gold Line */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-[#B58A2A] pointer-events-none drop-shadow-[0_0_10px_rgba(181,138,42,0.85)] z-20"
          style={{ left: `${revealX}%` }}
        />

        {/* Floating Scissor Vector Cursor */}
        {isHovering && (
          <div 
            ref={scissorRef}
            className="absolute w-12 h-12 flex items-center justify-center pointer-events-none z-30 -ml-6 -mt-6"
            style={{ left: 0, top: 0 }}
          >
            <PremiumScissor />
          </div>
        )}

        {/* Small indicators */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E8DCC5]/40 pointer-events-none shadow-sm z-25">
          <span className="text-[10px] font-sans font-bold tracking-wider text-[#1A1A1A] uppercase">{treatment.beforeLabel}</span>
        </div>
        <div className="absolute bottom-6 right-6 bg-[#B58A2A]/90 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 pointer-events-none shadow-sm z-25">
          <span className="text-[10px] font-sans font-bold tracking-wider text-white uppercase">{treatment.afterLabel}</span>
        </div>
      </div>

      {/* Result Details in Apple-like Product Layout */}
      <div className="bg-white border border-[#E8DCC5]/40 rounded-3xl p-8 md:p-12 shadow-sm grid md:grid-cols-12 gap-8 items-center text-left">
        <div className="md:col-span-8 space-y-4">
          <h3 className="luxury-heading text-2xl md:text-3xl font-medium text-[#1A1A1A]">{treatment.name}</h3>
          <p className="font-sans text-sm md:text-base text-stone-500 leading-relaxed max-w-2xl">{treatment.details}</p>
        </div>
        <div className="md:col-span-4 space-y-6 md:border-l md:border-[#E8DCC5]/45 md:pl-8 flex flex-col justify-between h-full">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-stone-400 font-medium">Session Duration</span>
              <span className="font-bold text-[#1A1A1A]">{treatment.duration}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-stone-400 font-medium">Stylist Grade</span>
              <span className="font-bold text-[#1A1A1A]">{treatment.stylist}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-stone-400 font-medium">Tariff Outcome</span>
              <span className="font-bold text-[#B58A2A] text-sm">{treatment.price}</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.assign('/register')}
            className="w-full py-3.5 bg-[#B58A2A] hover:bg-[#8A6A1F] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#B58A2A]/10 mt-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            Book This Treatment
          </button>
        </div>
      </div>
    </div>
  );
}


export default function StitchLandingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeTreatment, setActiveTreatment] = useState('balayage');

  // Booking Demo State
  const [bookingStep, setBookingStep] = useState(0); // 0: service, 1: staff, 2: time, 3: confirm, 4: success
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  // References for animations
  const heroTextRef = useRef(null);
  const heroVisualRef = useRef(null);
  const parallaxSecRef = useRef(null);
  const parallaxImgRef = useRef(null);
  const timelineSecRef = useRef(null);
  const svgPathRef = useRef(null);
  const pageBuilderRef = useRef(null);

  // Metrics count references
  const appointmentsCountRef = useRef(null);
  const customersCountRef = useRef(null);
  const revenueCountRef = useRef(null);

  // Override body styling for Light luxury theme
  useEffect(() => {
    document.body.style.backgroundColor = '#F8F5F1';
    document.body.style.backgroundImage = 'none';
    document.body.style.color = '#1A1A1A';
    document.body.classList.add('light-theme');

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
      document.body.style.color = '';
      document.body.classList.remove('light-theme');
    };
  }, []);

  // 1. Hero Dynamic Word Cycler
  useEffect(() => {
    const words = ["Appointments.", "Customers.", "Payments.", "Payroll.", "Websites."];
    let wordIndex = 0;
    const cycler = heroTextRef.current;
    if (!cycler) return;

    const changeWord = () => {
      gsap.to(cycler, {
        opacity: 0,
        y: -10,
        duration: 0.4,
        onComplete: () => {
          cycler.innerText = words[wordIndex];
          gsap.fromTo(cycler, 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4 }
          );
          wordIndex = (wordIndex + 1) % words.length;
        }
      });
    };

    const interval = setInterval(changeWord, 2500);
    return () => clearInterval(interval);
  }, []);

  // 2. Hero Mouse Move Parallax & 3D Tilt
  const handleHeroMouseMove = (e) => {
    if (!heroVisualRef.current) return;
    const rect = heroVisualRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    gsap.to(heroVisualRef.current, {
      rotateY: mouseX * 0.02,
      rotateX: -mouseY * 0.02,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.5
    });

    const cards = heroVisualRef.current.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
      const depth = (index + 1) * 0.04;
      gsap.to(card, {
        x: mouseX * depth,
        y: mouseY * depth,
        ease: 'power2.out',
        duration: 0.6
      });
    });
  };

  const handleHeroMouseLeave = () => {
    if (!heroVisualRef.current) return;
    gsap.to(heroVisualRef.current, {
      rotateY: 0,
      rotateX: 0,
      ease: 'power2.out',
      duration: 0.8
    });

    const cards = heroVisualRef.current.querySelectorAll('.floating-card');
    cards.forEach((card) => {
      gsap.to(card, {
        x: 0,
        y: 0,
        ease: 'power2.out',
        duration: 0.8
      });
    });
  };

  // 3. GSAP Major Animations: Parallax Scroll, Scroll Timeline, Counters, and Builder Assembly
  useEffect(() => {
    // A. Section 1 Parallax Reveal Scale
    if (parallaxSecRef.current && parallaxImgRef.current) {
      gsap.fromTo(parallaxImgRef.current, 
        { scale: 1.15, y: -20 },
        {
          scale: 1.0,
          y: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: parallaxSecRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }

    // B. Section 2 Customer Journey Scroll Timeline
    if (timelineSecRef.current && svgPathRef.current) {
      const path = svgPathRef.current;
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: timelineSecRef.current,
          start: 'top 50%',
          end: 'bottom 60%',
          scrub: 0.5
        }
      });

      // Light up timeline nodes on scroll
      const nodes = timelineSecRef.current.querySelectorAll('.journey-node');
      nodes.forEach((node, idx) => {
        gsap.fromTo(node,
          { scale: 0.85, opacity: 0.4, borderColor: '#E8DCC5', backgroundColor: '#FFFFFF' },
          {
            scale: 1.1,
            opacity: 1,
            borderColor: '#B58A2A',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 15px rgba(181,138,42,0.3)',
            duration: 0.3,
            scrollTrigger: {
              trigger: node,
              start: 'top 65%',
              end: 'top 45%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      });

      const cards = timelineSecRef.current.querySelectorAll('.journey-card');
      cards.forEach((card) => {
        gsap.fromTo(card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: card,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }

    // C. Scroll Counters for Metrics Section
    const counters = [
      { ref: appointmentsCountRef, end: 50000, suffix: '+' },
      { ref: customersCountRef, end: 5000, suffix: '+' },
      { ref: revenueCountRef, end: 10, prefix: '₹ ', suffix: ' Cr+' }
    ];

    counters.forEach(c => {
      if (!c.ref.current) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: c.end,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: c.ref.current,
          start: 'top 85%'
        },
        onUpdate: () => {
          if (c.ref.current) {
            c.ref.current.innerText = `${c.prefix || ''}${Math.floor(obj.val).toLocaleString('en-IN')}${c.suffix || ''}`;
          }
        }
      });
    });

    // D. Page Builder Live Assembly Timeline Loop
    if (pageBuilderRef.current) {
      const container = pageBuilderRef.current;
      const hero = container.querySelector('.builder-hero');
      const gallery = container.querySelector('.builder-gallery');
      const team = container.querySelector('.builder-team');
      const bookBtn = container.querySelector('.builder-book');
      const publishModal = container.querySelector('.builder-publish');
      const cursor = container.querySelector('.builder-cursor');

      const buildTl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });

      // Init values
      gsap.set([hero, gallery, team, bookBtn, publishModal], { opacity: 0, scale: 0.95, y: 15 });
      gsap.set(cursor, { x: 260, y: 220, opacity: 1 });

      buildTl
        // 1. Drag Hero Section
        .to(cursor, { x: 20, y: 50, duration: 1, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.2 })
        .to(cursor, { x: 130, y: 40, duration: 0.8, ease: 'power2.inOut' })
        .to(hero, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
        .to(cursor, { scale: 1, duration: 0.2 })

        // 2. Drag Gallery Section
        .to(cursor, { x: 20, y: 140, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.2 })
        .to(cursor, { x: 130, y: 120, duration: 0.8, ease: 'power2.inOut' })
        .to(gallery, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
        .to(cursor, { scale: 1, duration: 0.2 })

        // 3. Drag Team Section
        .to(cursor, { x: 20, y: 230, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.2 })
        .to(cursor, { x: 130, y: 200, duration: 0.8, ease: 'power2.inOut' })
        .to(team, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
        .to(cursor, { scale: 1, duration: 0.2 })

        // 4. Drag Book Button
        .to(cursor, { x: 20, y: 310, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.2 })
        .to(cursor, { x: 130, y: 280, duration: 0.8, ease: 'power2.inOut' })
        .to(bookBtn, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }, '-=0.2')
        .to(cursor, { scale: 1, duration: 0.2 })

        // 5. Click Publish Button
        .to(cursor, { x: 230, y: 15, duration: 0.8, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.8, duration: 0.15 })
        .to(cursor, { scale: 1, duration: 0.15 })
        .to(publishModal, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' })
        .to(cursor, { opacity: 0, duration: 0.3 })
        .to({}, { duration: 3 }); // Wait screen before repeat

      return () => {
        buildTl.kill();
      };
    }
  }, []);

  // 4. Booking Demo Autoplay Loop
  useEffect(() => {
    const stepTimings = [
      () => { // Step 0: Service Select
        setSelectedService('');
        setSelectedStaff('');
        setSelectedTime('');
        setShowWhatsApp(false);
        setBookingStep(0);
      },
      () => { // Click Service
        setSelectedService('Balayage Highlight & Hair Spa');
        setBookingStep(1);
      },
      () => { // Click Staff
        setSelectedStaff('Ananya Sharma');
        setBookingStep(2);
      },
      () => { // Click Time
        setSelectedTime('Tomorrow, 2:30 PM');
        setBookingStep(3);
      },
      () => { // Confirmed
        setBookingStep(4);
        setTimeout(() => setShowWhatsApp(true), 600);
      }
    ];

    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % stepTimings.length;
      stepTimings[current]();
    }, 2800);

    // Initial setup
    stepTimings[0]();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="trimly-font text-[#1A1A1A] selection:bg-[#E8DCC5] selection:text-[#1A1A1A] min-h-screen bg-[#F8F5F1]">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        .trimly-font, .font-sans {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .luxury-heading {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 750;
          letter-spacing: -0.025em;
        }
        .luxury-card {
          background: #FFFFFF;
          border: 1px solid rgba(181, 138, 42, 0.15);
          box-shadow: 0 4px 30px rgba(181, 138, 42, 0.03);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .luxury-card:hover {
          border-color: rgba(181, 138, 42, 0.4);
          box-shadow: 0 10px 40px rgba(181, 138, 42, 0.08);
          transform: translateY(-4px);
        }
        .floating-card {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-1 { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-2 { animation: float-slow 5s ease-in-out infinite 0.7s; }
        .animate-float-3 { animation: float-slow 6.5s ease-in-out infinite 1.2s; }
        .animate-float-4 { animation: float-slow 5.5s ease-in-out infinite 1.8s; }
        .animate-float-5 { animation: float-slow 4.8s ease-in-out infinite 2.2s; }

        @keyframes gold-glow-pulse {
          0%, 100% {
            border-color: rgba(181, 138, 42, 0.3);
            box-shadow: 0 20px 50px rgba(181, 138, 42, 0.08), inset 0 0 15px rgba(181, 138, 42, 0.02);
          }
          50% {
            border-color: rgba(181, 138, 42, 0.75);
            box-shadow: 0 20px 50px rgba(181, 138, 42, 0.2), inset 0 0 25px rgba(181, 138, 42, 0.08);
          }
        }
        .popular-glow {
          animation: gold-glow-pulse 4s ease-in-out infinite;
        }
        .booking-phone-shadow {
          box-shadow: 0 25px 60px -15px rgba(181, 138, 42, 0.12);
        }
      `}} />

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F5F1]/80 backdrop-blur-md border-b border-[#E8DCC5]/40 h-20">
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1440px] mx-auto h-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.assign('/')}>
            <img alt="Trimly Logo" className="h-8 w-8 object-contain" src="/logo.svg" />
            <span className="luxury-heading text-2xl font-bold tracking-tight text-[#1A1A1A]">Trimly</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="/demo">Product</a>
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="/demo-booking">Features</a>
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="#pricing">Pricing</a>
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="#">About</a>
            <a className="font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" href="#">Contact</a>
          </div>
          <div className="flex items-center gap-5">
            <button className="hidden sm:block font-sans text-sm font-medium text-[#1A1A1A]/70 hover:text-[#B58A2A] transition-colors" onClick={() => window.location.assign('/login')}>Login</button>
            <button className="bg-[#B58A2A] hover:bg-[#8A6A1F] text-white px-5 py-2.5 rounded-full font-sans text-sm font-semibold transition-all shadow-md shadow-[#B58A2A]/15 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" onClick={() => window.location.assign('/register')}>Start Free Trial</button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden min-h-[92vh] flex items-center py-12">
          {/* Subtle light accent glow behind */}
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#E8DCC5]/30 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-[#B58A2A]/5 rounded-full blur-[80px] pointer-events-none -z-10" />

          <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-8 text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8DCC5]/40 text-[#8A6A1F] font-sans text-xs font-bold tracking-wider rounded-full border border-[#B58A2A]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B58A2A] animate-ping" />
                THE LUXURY SALON OPERATING SYSTEM
              </span>
              <div className="space-y-4">
                <h1 className="luxury-heading text-4xl sm:text-5xl lg:text-6xl font-medium text-[#1A1A1A] leading-[1.15]">
                  Run Your Salon. <br />
                  <span className="text-[#B58A2A] italic">Not Your Spreadsheets.</span>
                </h1>
                <div className="h-10 sm:h-12 flex items-center">
                  <span 
                    ref={heroTextRef}
                    className="luxury-heading text-2xl sm:text-3xl font-light text-[#8A6A1F] border-b border-[#B58A2A]/30 pb-1"
                  >
                    Appointments.
                  </span>
                </div>
                <p className="font-sans text-base sm:text-lg text-[#1A1A1A]/70 max-w-lg leading-relaxed pt-2">
                  All-in-one salon operating system designed to elevate your client experience, automate check-ins, streamline payments, and run staff payroll flawlessly.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <button className="bg-[#B58A2A] hover:bg-[#8A6A1F] text-white px-8 py-4 rounded-full font-sans text-sm font-semibold transition-all shadow-md shadow-[#B58A2A]/15 hover:scale-[1.03]" onClick={() => window.location.assign('/register')}>Start Free Trial</button>
                <button className="border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-[#E8DCC5]/20 px-8 py-4 rounded-full font-sans text-sm font-semibold transition-all" onClick={() => {
                  const demoSection = document.getElementById('booking-demo');
                  if (demoSection) demoSection.scrollIntoView({ behavior: 'smooth' });
                }}>Watch Demo</button>
              </div>
            </div>

            {/* Apple Vision Pro Interactive Visual */}
            <div className="lg:col-span-7 flex justify-center items-center relative py-12">
              <div 
                ref={heroVisualRef}
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={handleHeroMouseLeave}
                className="relative w-full max-w-[520px] aspect-[1/1] flex items-center justify-center transition-transform duration-300"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Center Image */}
                <div className="relative w-[75%] aspect-[1/1] rounded-full overflow-hidden border-[6px] border-white shadow-2xl z-10 bg-[#FFFFFF]">
                  <img alt="Luxury Salon Interior" className="w-full h-full object-cover" src="/images/salon_interior.png" />
                </div>

                {/* Floating Widget 1: Today's Revenue */}
                <div className="absolute top-[8%] left-[2%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-4 flex items-center gap-3 animate-float-1 max-w-[200px] cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-lg font-bold">trending_up</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-stone-400 block tracking-wider uppercase">Today's Revenue</span>
                    <span className="text-sm font-sans font-bold text-[#1A1A1A]">₹48,250.00</span>
                  </div>
                </div>

                {/* Floating Widget 2: Appointments */}
                <div className="absolute top-[5%] right-[2%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-4 flex items-center gap-3 animate-float-2 max-w-[190px] cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A]">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-stone-400 block tracking-wider uppercase">Appointments</span>
                    <span className="text-sm font-sans font-bold text-[#1A1A1A]">12 Scheduled</span>
                  </div>
                </div>

                {/* Floating Widget 3: Payments */}
                <div className="absolute bottom-[20%] left-[-8%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-4 flex items-center gap-3 animate-float-3 max-w-[210px] cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined text-lg">payments</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-stone-400 block tracking-wider uppercase">Latest Payment</span>
                    <span className="text-sm font-sans font-bold text-[#1A1A1A]">₹6,500.00 <span className="text-stone-400 font-normal">UPI</span></span>
                  </div>
                </div>

                {/* Floating Widget 4: Staff Active */}
                <div className="absolute bottom-[16%] right-[-5%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-4 flex items-center gap-3 animate-float-4 max-w-[170px] cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-[#E8DCC5]/30 flex items-center justify-center text-[#8A6A1F]">
                    <span className="material-symbols-outlined text-lg">badge</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-stone-400 block tracking-wider uppercase">Staff Check-in</span>
                    <span className="text-sm font-sans font-bold text-[#1A1A1A]">4 Stylists Active</span>
                  </div>
                </div>

                {/* Floating Widget 5: Custom Website */}
                <div className="absolute bottom-[2%] left-[30%] z-20 floating-card bg-white/80 border border-[#E8DCC5]/40 rounded-2xl p-3.5 flex items-center gap-2.5 animate-float-5 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                  <span className="text-[11px] font-sans font-semibold text-[#1A1A1A]">trimly.co/luxe-atelier</span>
                  <span className="text-[9px] font-sans font-bold text-[#B58A2A] bg-[#E8DCC5]/30 border border-[#B58A2A]/20 px-2 py-0.5 rounded-full">Live</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: LUXURY SALON IMAGE PARALLAX */}
        <section ref={parallaxSecRef} className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden border-y border-[#E8DCC5]/40">
          <div ref={parallaxImgRef} className="absolute inset-0 w-full h-[120%]">
            <div className="absolute inset-0 bg-black/10 z-10" />
            <img 
              alt="Luxury Salon Workspace" 
              className="w-full h-full object-cover" 
              src="/images/salon_interior.png" 
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-20 text-center px-4">
            <div className="max-w-2xl bg-white/95 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-[#E8DCC5]/40 shadow-xl">
              <h2 className="luxury-heading text-3xl md:text-4xl font-medium text-[#1A1A1A] mb-4">
                The Standard of Salon Excellence
              </h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70 leading-relaxed">
                Your clients expect premium quality in every single touchpoint. Your workspace scheduling and billing operations should feel just as curated.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: CUSTOMER JOURNEY (SCROLL TIMELINE) */}
        <section ref={timelineSecRef} className="py-24 md:py-32 bg-white overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Operational Orchestration</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">The Seamless Client Flow</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                From the first click on your website to their recurring reservation, Trimly designs the perfect customer loop.
              </p>
            </div>

            {/* Timeline Layout */}
            <div className="relative max-w-4xl mx-auto flex flex-col items-center">
              {/* SVG Connector Line */}
              <div className="absolute top-[20px] bottom-[20px] w-[2px] left-1/2 -translate-x-1/2 pointer-events-none">
                {/* Background Line */}
                <div className="absolute inset-0 w-full h-full bg-[#E8DCC5]/30" />
                {/* Active drawing Line */}
                <svg className="absolute inset-0 w-full h-full overflow-visible" fill="none">
                  <line 
                    ref={svgPathRef}
                    x1="0" y1="0" x2="0" y2="100%" 
                    className="stroke-[#B58A2A] stroke-[2px]" 
                  />
                </svg>
              </div>

              {/* Journey Step 1 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full mb-16 md:mb-24 items-center">
                {/* Text Side */}
                <div className="journey-card md:text-right md:pr-12 pl-12 md:pl-0 order-2 md:order-1">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30 max-w-md ml-auto">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 01</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">Customer Books</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Client accesses your premium branded website, chooses their service, preferred master stylist, and preferred slot in 3 simple taps.
                    </p>
                  </div>
                </div>
                {/* Dot in Center */}
                <div className="journey-node absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center top-0 md:top-auto order-1 md:order-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                {/* Empty side for layout */}
                <div className="hidden md:block pl-12 order-3" />
              </div>

              {/* Journey Step 2 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full mb-16 md:mb-24 items-center">
                <div className="hidden md:block pr-12 text-right" />
                <div className="journey-node absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center top-0 md:top-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                <div className="journey-card pl-12 max-w-md">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 02</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">Check In</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Automated greeting reminders send WhatsApp updates. The receptionist welcomes the VIP client as their details sync instantly with the tablet terminal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Journey Step 3 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full mb-16 md:mb-24 items-center">
                <div className="journey-card md:text-right md:pr-12 pl-12 md:pl-0 order-2 md:order-1">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30 max-w-md ml-auto">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 03</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">The Service</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      The stylist pulls client history records, allergy logs, and past formulations. The premium product formulation details are stored digitally for consistency.
                    </p>
                  </div>
                </div>
                <div className="journey-node absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center top-0 md:top-auto order-1 md:order-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                <div className="hidden md:block pl-12 order-3" />
              </div>

              {/* Journey Step 4 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full mb-16 md:mb-24 items-center">
                <div className="hidden md:block pr-12 text-right" />
                <div className="journey-node absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center top-0 md:top-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                <div className="journey-card pl-12 max-w-md">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 04</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">Elegant Payment</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Zero friction checkout. Instantly print custom bills or accept card and UPI payments. Stylist commissions and inventory stocks are auto-deducted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Journey Step 5 */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 w-full items-center">
                <div className="journey-card md:text-right md:pr-12 pl-12 md:pl-0 order-2 md:order-1">
                  <div className="bg-[#F8F5F1] p-6 rounded-2xl border border-[#E8DCC5]/30 max-w-md ml-auto">
                    <span className="text-xs font-sans font-bold text-[#B58A2A]">STEP 05</span>
                    <h3 className="luxury-heading text-lg font-bold text-[#1A1A1A] mt-1 mb-2">Revisit Cycle</h3>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      AI systems track customer absence and send automated re-engagement texts to ensure they book their next cut or styling on schedule.
                    </p>
                  </div>
                </div>
                <div className="journey-node absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-[3px] border-[#E8DCC5] bg-white z-20 flex items-center justify-center top-0 md:top-auto order-1 md:order-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B58A2A]" />
                </div>
                <div className="hidden md:block pl-12 order-3" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SALON CHAOS VS TRIMLY */}
        <section className="py-24 md:py-32 bg-[#F8F5F1] border-y border-[#E8DCC5]/40">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-widest block">Compare Operations</span>
              <h2 className="luxury-heading text-3xl md:text-4xl font-medium text-[#1A1A1A]">Is Your Salon Chaotic or Curated?</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Stop patching your premium business operations with messy templates and disjointed systems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
              {/* Left Column: Salon Chaos */}
              <div className="bg-white/40 border border-red-200/50 rounded-[32px] p-8 md:p-12 flex flex-col justify-between space-y-8 shadow-sm">
                <div>
                  <h3 className="luxury-heading text-2xl font-medium text-red-900 flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-red-600">error</span>
                    Traditional Chaos
                  </h3>
                  <ul className="space-y-6 text-[#1A1A1A]/80 font-sans">
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Clunky Excel Spreadsheets</strong>
                        <p className="text-xs text-stone-500 mt-1">Manual formulas get broken; numbers are difficult to track on mobile.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Manual WhatsApp Inboxes</strong>
                        <p className="text-xs text-stone-500 mt-1">Staff spend hours sending booking confirmations and copy-pasting slots.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Paper Notebook Check-Ins</strong>
                        <p className="text-xs text-stone-500 mt-1">No customer history. Allergy alerts and formulas are written on loose scraps.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Interrupted Phone Calls</strong>
                        <p className="text-xs text-stone-500 mt-1"> stylists stop their services to handle reservations, losing valuable time.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs select-none">✕</span>
                      <div>
                        <strong className="text-red-950 font-bold block text-sm">Lost Appointments</strong>
                        <p className="text-xs text-stone-500 mt-1">Double bookings or forgotten slots frustrate clients and damage your brand.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 text-xs font-semibold text-red-800 font-sans tracking-wide uppercase">
                  Drains up to 25% of premium salon revenue.
                </div>
              </div>

              {/* Right Column: Trimly OS */}
              <div className="bg-white border-2 border-[#B58A2A] rounded-[32px] p-8 md:p-12 flex flex-col justify-between space-y-8 shadow-xl shadow-[#B58A2A]/5 relative">
                <span className="absolute -top-4 right-10 bg-[#B58A2A] text-white text-[10px] font-sans font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white">
                  CURATED ATELIER
                </span>
                <div>
                  <h3 className="luxury-heading text-2xl font-medium text-[#8A6A1F] flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Trimly Dashboard
                  </h3>
                  <ul className="space-y-6 text-[#1A1A1A] font-sans">
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Integrated Dashboard &amp; CRM</strong>
                        <p className="text-xs text-stone-500 mt-1">Beautiful real-time reports on styling revenues, retail sales, and commissions.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Automated WhatsApp Reminders</strong>
                        <p className="text-xs text-stone-500 mt-1">Auto-messages confirm bookings and remind clients dynamically in English &amp; Hindi.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Digital Treatment Cards</strong>
                        <p className="text-xs text-stone-500 mt-1">Store photo records of styling sessions, color mix formulas, and VIP treatment notes.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Self-Service Client Portal</strong>
                        <p className="text-xs text-stone-500 mt-1">Clients select dates, services, and pay deposits online without receptionist help.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[#B58A2A] font-bold text-xs select-none">✓</span>
                      <div>
                        <strong className="text-[#1A1A1A] font-bold block text-sm">Optimized Calendar Flow</strong>
                        <p className="text-xs text-stone-500 mt-1">Calendar engine naturally clusters appointments, reducing idle chairs by 30%.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#8A6A1F] font-sans tracking-wide uppercase">
                  Improves profit margins by up to 40% in 60 days.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3.5: OWNER DASHBOARD DEMO */}
        <section className="py-24 md:py-32 bg-white border-b border-[#E8DCC5]/40">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Command Center</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">Your Salon's Mission Control</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Track staff scheduling, inventory alerts, and direct revenue analytics in real-time from a beautifully unified cockpit.
              </p>
            </div>

            {/* Dashboard Mockup Display Container */}
            <div className="max-w-[1100px] mx-auto bg-[#254C75] rounded-[32px] p-8 md:p-16 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[460px] md:min-h-[520px]">
              {/* Subtle ambient light inside the dashboard backdrop */}
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

              <div className="relative w-full max-w-[850px] aspect-[16/9] md:aspect-[16/8.5] flex items-center justify-center">
                {/* Center Image: Male Grooming */}
                <div className="w-[45%] aspect-[1/1] rounded-[24px] overflow-hidden border-4 border-white/10 shadow-2xl bg-stone-900 z-10">
                  <img src="/images/male_grooming.png" alt="Male Grooming Session" className="w-full h-full object-cover" />
                </div>

                {/* Card 1: Top Left Revenue Boost */}
                <div className="absolute top-[-5%] left-[8%] z-20 bg-white rounded-2xl p-4 flex items-center gap-3 border border-stone-100 shadow-xl max-w-[210px] animate-float-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg font-bold">trending_up</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-sans font-black text-[#1A1A1A]">30%</span>
                      <span className="text-[10px] font-sans font-bold text-[#1A1A1A] tracking-tight">Revenue Boost</span>
                    </div>
                    <span className="text-[9px] font-sans font-semibold text-emerald-600 block text-left">Using WhatsApp API</span>
                  </div>
                </div>

                {/* Card 2: Left Calendar Scheduler */}
                <div className="absolute top-[18%] left-[-4%] z-20 bg-white rounded-2xl p-5 border border-stone-100 shadow-2xl w-[260px] font-sans text-left hidden sm:block animate-float-3">
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[8px] font-bold text-stone-500 uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" /> Confirmed
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> Online Booking
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Arrived
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-stone-300" /> Attended
                    </div>
                  </div>

                  {/* Month */}
                  <div className="text-[11px] font-bold text-[#1A1A1A] mb-2 font-sans">Feb 2025</div>

                  {/* Calendar Dates Mini Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-bold text-stone-400 mb-4">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    <span className="text-stone-250"></span><span className="text-stone-250"></span><span className="text-stone-250"></span><span className="text-stone-250"></span><span className="text-stone-250"></span><span className="text-stone-250"></span><span>1</span>
                    <span>2</span><span>3</span><span>4</span><span>5</span><span className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center mx-auto text-[8px] font-bold">6</span><span>7</span><span>8</span>
                    <span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
                    <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span>
                  </div>

                  {/* Employee Select */}
                  <div className="border-t border-stone-100 pt-3">
                    <span className="text-[8px] font-bold text-stone-400 block tracking-wider uppercase mb-2">Select Employee</span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                          <span className="font-bold text-stone-700">Mahima</span>
                        </div>
                        <span className="text-stone-400 font-semibold">10:15 AM - 01:15 PM</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                          <span className="font-bold text-stone-700">Riya</span>
                        </div>
                        <span className="text-stone-400 font-semibold">12:15 PM - 04:10 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Top Right Reorder Alerts */}
                <div className="absolute top-[2%] right-[-5%] z-20 bg-white rounded-2xl p-5 border border-stone-100 shadow-2xl w-[250px] font-sans text-left hidden sm:block animate-float-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A] mb-4 pb-2 border-b border-stone-100">Reorder Alerts</h4>
                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#1A1A1A] block">Shaving Cream</span>
                        <span className="text-[8px] text-stone-400 block">Only 2 left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full uppercase">Urgent</span>
                        <span className="text-[9px] font-bold text-[#B58A2A] hover:underline cursor-pointer">Reorder</span>
                      </div>
                    </div>
                    {/* Item 2 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#1A1A1A] block">Hair Gel</span>
                        <span className="text-[8px] text-stone-400 block">Only 4 left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">Low</span>
                        <span className="text-[9px] font-bold text-[#B58A2A] hover:underline cursor-pointer">Reorder</span>
                      </div>
                    </div>
                    {/* Item 3 */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#1A1A1A] block">Talcum Powder</span>
                        <span className="text-[8px] text-stone-400 block">Only 1 left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Critical</span>
                        <span className="text-[9px] font-bold text-[#B58A2A] hover:underline cursor-pointer">Reorder</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Bottom Right Appointments */}
                <div className="absolute bottom-[4%] right-[8%] z-20 bg-white rounded-2xl p-4.5 border border-stone-100 shadow-xl min-w-[170px] text-left animate-float-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-sans font-black text-[#1A1A1A]">456</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      67% 📈
                    </span>
                  </div>
                  <strong className="text-xs font-sans font-bold text-[#1A1A1A] block mt-1">Appointments</strong>
                  <span className="text-[9px] font-sans text-stone-400 block font-semibold">This Week</span>
                </div>
              </div>

              {/* Chat Live Badge at Left Edge */}
              <div className="absolute bottom-6 left-6 z-20 bg-[#1A365D] border border-blue-400/20 px-4 py-2.5 rounded-full text-white text-[10px] font-sans font-bold flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Chat live with an agent now!
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: LUXURY RESULT SHOWCASE */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Transformation Portfolios</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">Signature Transformations</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Select a treatment style below. Use the custom golden shears to slide and slice the canvas, revealing raw before-after results.
              </p>
            </div>

            {/* Treatment Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {TREATMENTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTreatment(t.id)}
                  className={`px-6 py-3 rounded-full text-xs font-bold font-sans uppercase tracking-wider transition-all duration-300 border ${
                    activeTreatment === t.id
                      ? 'bg-[#B58A2A] border-[#B58A2A] text-white shadow-lg shadow-[#B58A2A]/15 scale-[1.02]'
                      : 'bg-white border-[#E8DCC5] text-[#8A6A1F] hover:bg-[#F8F5F1] hover:border-[#B58A2A]/40'
                  }`}
                >
                  {t.tabName}
                </button>
              ))}
            </div>

            {/* Showcase Component Reveal */}
            <MainShowcaseReveal 
              treatment={TREATMENTS.find(t => t.id === activeTreatment) || TREATMENTS[0]} 
            />
          </div>
        </section>

        {/* SECTION 5: WEBSITE BUILDER DEMO */}
        <section className="py-24 md:py-32 bg-[#F8F5F1] border-y border-[#E8DCC5]/40">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Side Info */}
              <div className="lg:col-span-5 space-y-8">
                <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">No-Code Website Builder</span>
                <h2 className="luxury-heading text-3xl md:text-4xl font-medium text-[#1A1A1A] leading-tight">
                  Drag. Drop. Publish. <br />
                  A Website Built Live.
                </h2>
                <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70 leading-relaxed">
                  Your luxury salon website represents your storefront. Trimly allows you to generate a fully optimized, responsive, and gorgeously themed website within minutes. 
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#B58A2A] font-bold text-xs border border-[#E8DCC5]/50 shadow-sm">1</div>
                    <div>
                      <strong className="text-sm font-bold font-sans">Choose Curated Layout Block</strong>
                      <p className="text-xs text-stone-500 mt-0.5">Pick visual blocks aligned to salon brand spacing guidelines.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#B58A2A] font-bold text-xs border border-[#E8DCC5]/50 shadow-sm">2</div>
                    <div>
                      <strong className="text-sm font-bold font-sans">Assemble Your Services</strong>
                      <p className="text-xs text-stone-500 mt-0.5">Define your high-end hair, make-up, and massage treatment tariffs.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#B58A2A] font-bold text-xs border border-[#E8DCC5]/50 shadow-sm">3</div>
                    <div>
                      <strong className="text-sm font-bold font-sans">Launch Live Web Link</strong>
                      <p className="text-xs text-stone-500 mt-0.5">Map custom domains with built-in speed caching &amp; high SEO rank.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Simulator */}
              <div className="lg:col-span-7 flex justify-center">
                <div 
                  ref={pageBuilderRef}
                  className="w-full max-w-[440px] aspect-[4/5] bg-white rounded-3xl border border-[#E8DCC5]/60 shadow-xl p-5 relative overflow-hidden flex flex-col justify-between select-none"
                >
                  {/* Builder Header Mockup */}
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-sans text-stone-400 font-bold uppercase tracking-wider">Trimly Live Canvas</span>
                    <button className="bg-[#B58A2A] text-white text-[9px] font-sans font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Publish
                    </button>
                  </div>

                  {/* Canvas Center Area representing elements dropping in */}
                  <div className="flex-1 bg-[#F8F5F1]/50 rounded-2xl p-3 space-y-3 relative overflow-hidden">
                    {/* Element: Hero Block */}
                    <div className="builder-hero bg-white border border-[#E8DCC5]/30 rounded-xl p-3 text-center space-y-1 shadow-sm opacity-0">
                      <h4 className="luxury-heading text-xs font-bold text-[#1A1A1A]">Welcome to Velvet Atelier</h4>
                      <p className="text-[8px] text-stone-400 max-w-[150px] mx-auto font-sans leading-tight">Curating elevated styling sessions and luxury hair treatment in Mumbai.</p>
                    </div>

                    {/* Element: Gallery Block */}
                    <div className="builder-gallery bg-white border border-[#E8DCC5]/30 rounded-xl p-2.5 space-y-1.5 shadow-sm opacity-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold font-sans text-[#1A1A1A]">Our Salon Portfolio</span>
                        <span className="text-[7px] text-[#B58A2A] font-bold font-sans uppercase">View All</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="aspect-square rounded-md bg-stone-100 overflow-hidden">
                          <img className="w-full h-full object-cover" src="/images/hair_color_after.png" alt="" />
                        </div>
                        <div className="aspect-square rounded-md bg-stone-100 overflow-hidden">
                          <img className="w-full h-full object-cover" src="/images/makeup_after.png" alt="" />
                        </div>
                        <div className="aspect-square rounded-md bg-stone-100 overflow-hidden">
                          <img className="w-full h-full object-cover" src="/images/bridal_after.png" alt="" />
                        </div>
                      </div>
                    </div>

                    {/* Element: Team block */}
                    <div className="builder-team bg-white border border-[#E8DCC5]/30 rounded-xl p-2.5 space-y-1.5 shadow-sm opacity-0">
                      <span className="text-[9px] font-bold font-sans text-[#1A1A1A]">Stylist Mastercrafts</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 border border-stone-50 rounded-lg p-1 bg-stone-50/50">
                          <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                            <img className="w-full h-full object-cover" src="/images/hair_color_before.png" alt="" />
                          </div>
                          <div>
                            <span className="text-[7px] font-bold font-sans block text-[#1A1A1A]">Ananya S.</span>
                            <span className="text-[6px] text-stone-400 font-sans block">Master Colorist</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 border border-stone-50 rounded-lg p-1 bg-stone-50/50">
                          <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                            <img className="w-full h-full object-cover" src="/images/bridal_before.png" alt="" />
                          </div>
                          <div>
                            <span className="text-[7px] font-bold font-sans block text-[#1A1A1A]">Rohan M.</span>
                            <span className="text-[6px] text-stone-400 font-sans block">Bridal Expert</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Element: Book Now Button */}
                    <div className="builder-book text-center opacity-0 pt-1">
                      <button className="w-full py-2 bg-[#B58A2A] text-white text-[9px] font-sans font-bold uppercase tracking-widest rounded-lg shadow-sm">
                        Schedule An Appointment
                      </button>
                    </div>

                    {/* Modal published checkmark alert */}
                    <div className="builder-publish absolute inset-x-6 top-1/4 bg-white/95 border border-[#B58A2A]/40 p-4 rounded-2xl text-center space-y-2.5 shadow-2xl opacity-0 z-20">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </div>
                      <div>
                        <h5 className="text-[11px] font-sans font-bold text-[#1A1A1A]">Website Live &amp; Published!</h5>
                        <p className="text-[9px] text-[#B58A2A] font-sans mt-0.5 font-semibold">trimly.co/velvet-atelier</p>
                      </div>
                    </div>

                    {/* Hand Drag Indicator Cursor */}
                    <div 
                      className="builder-cursor absolute w-8 h-8 pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: 0, top: 0 }}
                    >
                      <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">🫵</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 6: MINI-BOOKING DEMO */}
        <section id="booking-demo" className="py-24 md:py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Side: Simulation Visual */}
              <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
                <div className="relative w-full max-w-[340px] aspect-[9/18] bg-stone-900 rounded-[40px] p-3 border-[6px] border-stone-850 booking-phone-shadow flex flex-col justify-between overflow-hidden">
                  
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-stone-900 rounded-b-2xl z-40 flex items-center justify-center">
                    <div className="w-10 h-1 speaker bg-stone-800 rounded-full" />
                  </div>

                  {/* Client Booking Screen App */}
                  <div className="flex-1 bg-[#F8F5F1] rounded-[32px] p-4 flex flex-col justify-between overflow-hidden relative pt-8 font-sans">
                    
                    {/* Booking Flow Header */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Velvet Salon Reservations</span>
                        <span className="text-[9px] font-bold text-[#B58A2A] bg-[#E8DCC5]/40 px-2 py-0.5 rounded-full">Book Slot</span>
                      </div>
                      <div className="w-full bg-[#E8DCC5]/30 h-1 rounded-full overflow-hidden mb-5">
                        <div 
                          className="bg-[#B58A2A] h-full transition-all duration-500" 
                          style={{ width: `${(bookingStep + 1) * 20}%` }}
                        />
                      </div>
                    </div>

                    {/* Core App View */}
                    <div className="flex-1 overflow-y-auto space-y-4">
                      {/* STEP 0: SELECT SERVICE */}
                      {bookingStep >= 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Select Treatment</span>
                          <div className={`p-3 rounded-xl border text-left transition-all ${selectedService ? 'bg-white border-[#B58A2A] shadow-sm' : 'bg-white/60 border-stone-200/60'}`}>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-[#1A1A1A]">Balayage Highlight &amp; Hair Spa</span>
                              <span className="text-xs font-bold text-[#B58A2A]">₹4,500</span>
                            </div>
                            <span className="text-[8px] text-stone-400 block mt-0.5">Average duration: 120 mins • Master stylist</span>
                          </div>
                        </div>
                      )}

                      {/* STEP 1: SELECT STAFF */}
                      {bookingStep >= 1 && (
                        <div className="space-y-2 animate-fade-in">
                          <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Select Master Stylist</span>
                          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedStaff ? 'bg-white border-[#B58A2A] shadow-sm' : 'bg-white/60 border-stone-200/60'}`}>
                            <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
                              <img className="w-full h-full object-cover" src="/images/hair_color_before.png" alt="" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#1A1A1A] block">Ananya Sharma</span>
                              <span className="text-[8px] text-stone-400 block">Senior Hair Colorist • 98% Rating</span>
                            </div>
                            {selectedStaff && (
                              <span className="material-symbols-outlined text-xs text-[#B58A2A] ml-auto">check_circle</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 2: SELECT DATE / TIME */}
                      {bookingStep >= 2 && (
                        <div className="space-y-2 animate-fade-in">
                          <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Select Date &amp; Time</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl border bg-white border-[#B58A2A] text-center shadow-xs">
                              <span className="text-[8px] text-stone-400 uppercase font-semibold block">Date</span>
                              <span className="text-xs font-bold text-[#1A1A1A]">June 12, 2026</span>
                            </div>
                            <div className={`p-2.5 rounded-xl border text-center transition-all ${selectedTime ? 'bg-white border-[#B58A2A] shadow-xs' : 'bg-white/60 border-stone-200/60'}`}>
                              <span className="text-[8px] text-stone-400 uppercase font-semibold block">Time Slot</span>
                              <span className="text-xs font-bold text-[#1A1A1A]">2:30 PM</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: CONFIRM AT BOTTOM */}
                      {bookingStep >= 3 && (
                        <div className="pt-2 animate-fade-in">
                          <button className="w-full py-3 bg-[#B58A2A] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-md">
                            Confirm Appointment Booking
                          </button>
                        </div>
                      )}

                      {/* STEP 4: SUCCESS VIEW */}
                      {bookingStep >= 4 && (
                        <div className="py-6 text-center space-y-4 animate-fade-in">
                          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-lg font-bold">check</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#1A1A1A]">Appointment Booking Confirmed!</h4>
                            <p className="text-[9px] text-stone-400 mt-1">Details sent to WhatsApp registered mobile number.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* App Footer Brand */}
                    <div className="text-center text-[7px] text-stone-400 tracking-widest uppercase font-bold pt-2 border-t border-stone-100">
                      Powered by Trimly Operating System
                    </div>

                    {/* Simulation WhatsApp Notification */}
                    {showWhatsApp && (
                      <div className="absolute top-8 inset-x-2 bg-white/95 border border-amber-200/60 p-3.5 rounded-2xl shadow-2xl flex items-start gap-3 z-30 animate-fade-in">
                        <img alt="WhatsApp Icon" className="w-7 h-7 object-contain" src="/logo.svg" />
                        <div className="flex-1 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-[#8A6A1F]">TRIMLY MESSENGER</span>
                            <span className="text-[7px] text-stone-400">now</span>
                          </div>
                          <p className="text-[9px] font-medium text-stone-600 leading-tight mt-0.5">
                            "Hey! Ananya confirmed your Balayage Highlight at Velvet Salon for June 12, 2:30 PM. See you!"
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Right Side: Info Panel */}
              <div className="lg:col-span-5 space-y-8 order-1 lg:order-2">
                <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Instant Booking Simulation</span>
                <h2 className="luxury-heading text-3xl md:text-4xl font-medium text-[#1A1A1A] leading-tight">
                  Seamless Booking Experience. <br />
                  For Client Delight.
                </h2>
                <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70 leading-relaxed">
                  Your clients book instantly from any phone, choosing services, master stylists, and slots in under 30 seconds. Trimly automatically locks in the staff schedule and updates their calendar.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8F5F1] p-5 rounded-2xl border border-[#E8DCC5]/30">
                    <span className="material-symbols-outlined text-[#B58A2A] text-2xl mb-2">sms</span>
                    <strong className="text-sm font-sans block text-[#1A1A1A]">No-Show Prevention</strong>
                    <span className="text-xs text-stone-500 block mt-1">WhatsApp &amp; SMS reminders slash absent rates by 65%.</span>
                  </div>
                  <div className="bg-[#F8F5F1] p-5 rounded-2xl border border-[#E8DCC5]/30">
                    <span className="material-symbols-outlined text-[#B58A2A] text-2xl mb-2">credit_card</span>
                    <strong className="text-sm font-sans block text-[#1A1A1A]">Deposit Lock-In</strong>
                    <span className="text-xs text-stone-500 block mt-1">Accept digital booking deposits to guarantee high-ticket slots.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* METRICS SECTION */}
        <section className="py-20 md:py-24 bg-[#E8DCC5]/30 border-y border-[#E8DCC5]/40 text-center">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <span 
                ref={appointmentsCountRef} 
                className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A] block"
              >
                0
              </span>
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-wider block">Appointments Booked</span>
            </div>
            <div className="space-y-2">
              <span 
                ref={customersCountRef} 
                className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A] block"
              >
                0
              </span>
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-wider block">Customers Managed</span>
            </div>
            <div className="space-y-2">
              <span 
                ref={revenueCountRef} 
                className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A] block"
              >
                0
              </span>
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-wider block">Tariff Value Processed</span>
            </div>
            <div className="space-y-2">
              <span className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A] block">
                8+
              </span>
              <span className="text-xs font-sans font-bold text-[#8A6A1F] uppercase tracking-wider block">Languages Supported</span>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-24 md:py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Flat Simple Tariff</span>
              <h2 className="luxury-heading text-3xl md:text-5xl font-medium text-[#1A1A1A]">Curated Pricing Tiers</h2>
              <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70">
                Choose the perfect operating model to run your hair studio, boutique salon, or franchise branch network.
              </p>
            </div>

            {/* Billing toggle */}
            <div className="flex justify-center items-center gap-4 mb-16">
              <span className={`text-xs font-sans font-bold transition-colors ${billingCycle === 'monthly' ? 'text-[#1A1A1A]' : 'text-stone-400'}`}>Monthly Billing</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 bg-[#E8DCC5]/40 rounded-full p-1 border border-[#B58A2A]/20 transition-all focus:outline-none"
              >
                <div className={`w-4.5 h-4.5 bg-[#B58A2A] rounded-full transition-transform ease-out duration-300 ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-sans font-bold transition-colors ${billingCycle === 'annual' ? 'text-[#1A1A1A]' : 'text-stone-400'}`}>Annual Billing</span>
                <span className="text-[9px] font-sans font-bold text-[#B58A2A] bg-[#E8DCC5]/40 border border-[#B58A2A]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1240px] mx-auto items-stretch">
              
              {/* Card 1: Starter */}
              <div className="luxury-card rounded-3xl p-8 flex flex-col justify-between space-y-8 bg-white">
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-stone-400 tracking-widest uppercase block">Starter Plan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="luxury-heading text-4xl font-medium text-[#1A1A1A]">
                      ₹{billingCycle === 'monthly' ? '2,499' : '1,999'}
                    </span>
                    <span className="text-xs text-stone-450">/mo</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed">Perfect for independent stylists or single-chair operations starting digital CRM.</p>
                  <div className="w-full h-px bg-stone-100 my-4" />
                  <ul className="space-y-3 text-xs text-stone-600 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Basic Booking Calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Trimly Subdomain URL
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Basic Client Profile CRM
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-[#E8DCC5]/20 text-xs font-sans font-bold uppercase tracking-wider transition rounded-xl" onClick={() => window.location.assign('/register')}>
                  Start Free Trial
                </button>
              </div>

              {/* Card 2: Growth (Most Popular) */}
              <div className="luxury-card popular-glow rounded-3xl p-8 flex flex-col justify-between space-y-8 bg-white relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B58A2A] text-white text-[9px] font-sans font-bold tracking-widest uppercase px-3.5 py-1 rounded-full border border-white">
                  MOST POPULAR
                </span>
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-[#B58A2A] tracking-widest uppercase block">Growth Plan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="luxury-heading text-4xl font-medium text-[#1A1A1A]">
                      ₹{billingCycle === 'monthly' ? '4,999' : '3,999'}
                    </span>
                    <span className="text-xs text-stone-450">/mo</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed">Ideal for boutique ateliers managing team stylist rotas and WhatsApp CRM.</p>
                  <div className="w-full h-px bg-stone-100 my-4" />
                  <ul className="space-y-3 text-xs text-stone-600 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Advanced Calendar &amp; Reminders
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Custom Domain Setup
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      WhatsApp Notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Stylist Commission Engine
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 bg-[#B58A2A] hover:bg-[#8A6A1F] text-white text-xs font-sans font-bold uppercase tracking-wider transition rounded-xl shadow-md" onClick={() => window.location.assign('/register')}>
                  Start Free Trial
                </button>
              </div>

              {/* Card 3: Premium */}
              <div className="luxury-card rounded-3xl p-8 flex flex-col justify-between space-y-8 bg-white">
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-stone-400 tracking-widest uppercase block">Premium Plan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="luxury-heading text-4xl font-medium text-[#1A1A1A]">
                      ₹{billingCycle === 'monthly' ? '9,999' : '7,999'}
                    </span>
                    <span className="text-xs text-stone-450">/mo</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed">Perfect for luxury salon networks requiring custom branding and advanced inventory.</p>
                  <div className="w-full h-px bg-stone-100 my-4" />
                  <ul className="space-y-3 text-xs text-stone-600 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Multi-Branch Management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      VIP Loyalty Rewards
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Professional Inventory Tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Dedicated 24/7 Phone Support
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-[#E8DCC5]/20 text-xs font-sans font-bold uppercase tracking-wider transition rounded-xl" onClick={() => window.location.assign('/register')}>
                  Start Free Trial
                </button>
              </div>

              {/* Card 4: Enterprise */}
              <div className="luxury-card rounded-3xl p-8 flex flex-col justify-between space-y-8 bg-white">
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-stone-400 tracking-widest uppercase block">Enterprise Plan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="luxury-heading text-4xl font-medium text-[#1A1A1A]">Custom</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed">Tailored specifically for major retail salon chains and master franchises in India.</p>
                  <div className="w-full h-px bg-stone-100 my-4" />
                  <ul className="space-y-3 text-xs text-stone-600 font-sans">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Custom API &amp; Webhook Access
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Custom White-Label Domain UI
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Dedicated Account Director
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      SLA Availability Agreement
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-[#E8DCC5]/20 text-xs font-sans font-bold uppercase tracking-wider transition rounded-xl" onClick={() => window.location.assign('/register')}>
                  Contact Sales
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-24 md:py-32 bg-[#F8F5F1] border-t border-[#E8DCC5]/40">
          <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="text-xs font-sans font-bold text-[#B58A2A] uppercase tracking-widest block">Curated Questions</span>
              <h2 className="luxury-heading text-3xl font-medium text-[#1A1A1A]">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "What is Trimly?",
                  a: "Trimly is an all-in-one salon operating system designed to replace calendars, WhatsApp messages, paper notebooks, and payroll sheets. We assist premium Indian salons in delivering a luxury client experience."
                },
                {
                  q: "Can I use my own custom website domain name?",
                  a: "Yes! With our Growth and Premium plans, you can link your custom business domain (e.g. yoursalon.com) to our fast-loading booking engine."
                },
                {
                  q: "How does the WhatsApp reminder scheduling work?",
                  a: "Trimly hooks directly into official API services. Once an appointment is saved, the client receives booking alerts and re-booking prompts automatically."
                },
                {
                  q: "Is there a setup fee for franchise salons?",
                  a: "No setup fees. You can import your current customer records and inventory details instantly, or request our support team's guidance."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-[#E8DCC5]/30 rounded-2xl overflow-hidden shadow-xs">
                  <button 
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full flex justify-between items-center p-6 text-left font-sans font-bold text-sm text-[#1A1A1A] focus:outline-none"
                  >
                    <span>{item.q}</span>
                    <span className={`material-symbols-outlined text-[#B58A2A] transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                  </button>
                  <div className={`transition-all duration-350 overflow-hidden ${openFaqIndex === idx ? 'max-h-40 border-t border-[#E8DCC5]/20' : 'max-h-0'}`}>
                    <p className="p-6 font-sans text-xs text-stone-500 leading-relaxed bg-[#FAF9F5]/30">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA (FULL SCREEN HERO OVERLAY) */}
        <section className="relative py-32 md:py-44 overflow-hidden border-t border-[#E8DCC5]/40 text-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#F8F5F1]/85 backdrop-blur-xs z-10" />
            <img 
              alt="Luxury Salon Interior Backdrop" 
              className="w-full h-full object-cover" 
              src="/images/salon_interior.png" 
            />
          </div>
          <div className="max-w-[1440px] mx-auto px-6 relative z-20 space-y-10">
            <h2 className="luxury-heading text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] leading-tight">
              Your clients expect luxury. <br />
              Your software should too.
            </h2>
            <p className="font-sans text-sm md:text-base text-[#1A1A1A]/70 max-w-lg mx-auto leading-relaxed">
              Experience the beautiful operating system that scales customer loyalty and drives high-end styling revenue. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xs sm:max-w-none mx-auto">
              <button className="w-full sm:w-auto bg-[#B58A2A] hover:bg-[#8A6A1F] text-white px-10 py-4.5 rounded-full font-sans text-sm font-semibold transition-all shadow-md shadow-[#B58A2A]/15 hover:scale-[1.03]" onClick={() => window.location.assign('/register')}>Start Free Trial</button>
              <button className="w-full sm:w-auto bg-white border border-[#B58A2A]/40 text-[#8A6A1F] hover:bg-stone-50 px-10 py-4.5 rounded-full font-sans text-sm font-semibold transition-all shadow-sm" onClick={() => window.location.assign('/register')}>Book Demo</button>
            </div>
            <div className="pt-12 flex flex-wrap justify-center gap-8 text-[11px] font-sans font-bold text-stone-500 border-t border-[#E8DCC5]/50 max-w-md mx-auto">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Unlimited stylists
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#B58A2A]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Zero setup fees
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E8DCC5]/40 text-[#1A1A1A]/70">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 flex flex-col md:flex-row justify-between items-start gap-16 md:gap-24">
          <div className="max-w-xs space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.assign('/')}>
              <img alt="Trimly Logo" className="h-7 w-7 object-contain" src="/logo.svg" />
              <span className="luxury-heading text-xl font-bold tracking-tight text-[#1A1A1A]">Trimly</span>
            </div>
            <p className="font-sans text-xs text-stone-500 leading-relaxed">
              Approachable luxury for beauty ateliers. Empowering styling entrepreneurs with elegant software systems across Mumbai, Delhi, and Bangalore.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-16 w-full md:w-auto">
            <div className="space-y-4">
              <h4 className="font-sans text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Product</h4>
              <ul className="space-y-3 text-xs text-stone-500">
                <li><a className="hover:text-[#B58A2A] transition-colors" href="/demo">Booking App</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="/demo">Inventory CRM</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="/demo">Stylist Rotas</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="/demo">Checkout Billing</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-sans text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Company</h4>
              <ul className="space-y-3 text-xs text-stone-500">
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">About Trimly</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Stylist Partners</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Press Inquiries</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Careers</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-sans text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Legal</h4>
              <ul className="space-y-3 text-xs text-stone-500">
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Privacy Guidelines</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Terms of Use</a></li>
                <li><a className="hover:text-[#B58A2A] transition-colors" href="#">Security Standards</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 border-t border-[#E8DCC5]/20 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400 gap-4">
          <p>© 2026 Trimly Technologies. The Standard of Salon Excellence.</p>
          <div className="flex gap-6">
            <a className="hover:text-[#B58A2A] transition-colors" href="#"><span className="material-symbols-outlined text-base">public</span></a>
            <a className="hover:text-[#B58A2A] transition-colors" href="#"><span className="material-symbols-outlined text-base">share</span></a>
            <a className="hover:text-[#B58A2A] transition-colors" href="#"><span className="material-symbols-outlined text-base">alternate_email</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
