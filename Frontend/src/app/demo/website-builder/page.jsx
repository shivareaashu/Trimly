'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { 
  Globe, LayoutDashboard, Palette, Eye, ArrowRight, ArrowLeft, 
  Sparkles, CheckCircle2, Monitor, Smartphone, Tablet, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GuidedWebsiteBuilder() {
  const { demoAction, showToast } = useDemo();
  
  // Guided steps tracking
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop, tablet, mobile
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');

  const steps = [
    {
      title: 'Website Dashboard',
      subtitle: 'Command center for KPIs & editing actions',
      file: 'step1_dashboard.html',
      description: 'The master entry point showing traffic counts, leads stats, active templates, and quick action launchpoints.'
    },
    {
      title: 'Template Selector',
      subtitle: 'Choose premium starter salon design layout',
      file: 'step2_template_library.html',
      description: 'Choose a tailored luxury layout preset (Luxury Salon, Barber Shop, Spa, Clinic) to provision site pages instantly.'
    },
    {
      title: 'Brand Setup Wizard',
      subtitle: 'Set brand logos, color guides & fonts',
      file: 'step3_brand_setup.html',
      description: 'Define your salon name, upload logos, select primary and secondary colors. Changes are auto-injected globally.'
    },
    {
      title: 'Pages Manager',
      subtitle: 'Review & organize public page structures',
      file: 'step4_pages_manager.html',
      description: 'Add, duplicate, delete, and re-order site pages (Home, Services, Team, Gallery) from a drag-friendly grid.'
    },
    {
      title: 'Visual Page Builder',
      subtitle: 'Simulate visual drag-and-drop builder canvas',
      file: 'step5_visual_builder.html',
      description: 'The core page editor interface: Left bar for sections, Center for live canvas, Right for parameters.'
    },
    {
      title: 'Section Library',
      subtitle: 'Add luxury headers, catalogs & FAQ drawers',
      file: 'step6_section_library.html',
      description: 'Instantly insert pre-styled luxury cards (Reviews, Hair styling menus, Booking Call-To-Actions) directly into sections.'
    },
    {
      title: 'Theme Studio',
      subtitle: 'Modify fonts, borders & rounded styles',
      file: 'step7_theme_studio.html',
      description: 'Customize global element parameters like input fields, borders thickness, button shapes, and typography sheets.'
    },
    {
      title: 'Media Library',
      subtitle: 'Organize asset IDs & showroom photos',
      file: 'step8_media_library.html',
      description: 'DAM asset storage for managing salon interior photography and brand images linked via media IDs.'
    },
    {
      title: 'Forms & Leads',
      subtitle: 'Configure consultation & booking intake forms',
      file: 'step9_forms_leads.html',
      description: 'Create customizable inquiry templates (Contact Forms, Career Inquiries) and review recent lead messages.'
    },
    {
      title: 'SEO Studio',
      subtitle: 'Optimize Google previews & page descriptions',
      file: 'step10_seo_studio.html',
      description: 'Set titles, metadata keywords, and open-graph cover images per page with live search engine simulation previews.'
    },
    {
      title: 'Preview Center',
      subtitle: 'Audit responsiveness on mobile, tablet & desktop',
      file: 'step11_preview_center.html',
      description: 'Verify look and feel across different screen widths with secure tokenized preview links.'
    },
    {
      title: 'Publish Center',
      subtitle: 'Compile website & dispatch version build',
      file: 'step12_publish_center.html',
      description: 'Execute final website compilation, validation checklists, cache clearance, and push changes live to your custom domain.'
    }
  ];

  const currentStep = steps[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 0.5 === 0.5 ? 0 : currentStepIdx - 1);
    }
  };

  // Simulate publish script pipeline
  const runPublishSimulation = () => {
    setPublishing(true);
    setPublishStatus('Checking page constraints...');
    
    setTimeout(() => {
      setPublishStatus('Validating section bindings...');
    }, 1200);

    setTimeout(() => {
      setPublishStatus('Compiling visual CSS and assets...');
    }, 2400);

    setTimeout(() => {
      setPublishStatus('Clearing cloud CDN cache...');
    }, 3600);

    setTimeout(() => {
      setPublishing(false);
      setPublishStatus('');
      showToast('Website Published', 'Version 1.0.18 is live on your custom domain!');
      demoAction('verify published live site');
    }, 5000);
  };

  // Viewport container width classes
  const getDeviceWidthClass = () => {
    switch (previewDevice) {
      case 'mobile': return 'w-[375px] h-[650px] border-[12px] border-slate-900 rounded-[40px]';
      case 'tablet': return 'w-[768px] h-[750px] border-[16px] border-slate-900 rounded-[32px]';
      default: return 'w-full h-[750px] border-4 border-slate-900 rounded-3xl';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <Globe className="h-7 w-7 text-primary" /> Website Builder Guided Tour
          </h1>
          <p className="text-sm text-slate-400">
            Audit the step-by-step first-time setup flow that lets salon owners build and deploy templates in under 10 minutes.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
            Steps Completed: {currentStepIdx + 1} / 12
          </span>
          <button
            onClick={() => demoAction('launch custom theme builder')}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
          >
            <Sparkles className="h-4 w-4" />
            <span>Create Free Account</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Wizard Steps Stepper (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 space-y-4">
            <div className="border-b border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Guided Walkthrough Stepper</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Click any step to view the design mock directly</p>
            </div>

            <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1 scrollbar-hide">
              {steps.map((s, idx) => {
                const isActive = currentStepIdx === idx;
                const isPassed = idx < currentStepIdx;

                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentStepIdx(idx)}
                    className={cn(
                      'p-3 border rounded-2xl cursor-pointer transition-all flex items-start gap-3.5',
                      isActive 
                        ? 'border-primary bg-slate-950 shadow-md shadow-primary/5' 
                        : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
                    )}
                  >
                    <div className={cn(
                      'h-6 w-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] border',
                      isActive 
                        ? 'bg-primary/20 text-primary border-primary' 
                        : isPassed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                    )}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    
                    <div className="leading-tight">
                      <p className={cn('text-xs font-bold', isActive ? 'text-white' : 'text-slate-350')}>{s.title}</p>
                      <p className="text-[9px] text-slate-500 font-medium mt-0.5">{s.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Explanation card */}
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-2">
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-mono">Current Step Details</span>
              <h4 className="font-bold text-xs text-white">{currentStep.title}</h4>
              <p className="text-[10px] text-slate-400 leading-normal leading-relaxed font-sans">{currentStep.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Iframe Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Viewport bar controls */}
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl px-5 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-850 px-3 py-1 rounded-lg">
                /stitch-screens/{currentStep.file}
              </span>
            </div>

            {/* Desktop / Tablet / Mobile Toggle Toggles */}
            <div className="flex bg-slate-950 p-0.5 border border-slate-850 rounded-lg text-slate-500">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={cn('p-1.5 rounded-md transition-colors', previewDevice === 'desktop' ? 'bg-slate-800 text-white' : '')}
                title="Desktop mode"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={cn('p-1.5 rounded-md transition-colors', previewDevice === 'tablet' ? 'bg-slate-800 text-white' : '')}
                title="Tablet mode"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={cn('p-1.5 rounded-md transition-colors', previewDevice === 'mobile' ? 'bg-slate-800 text-white' : '')}
                title="Mobile mode"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Simulated browser Canvas frame */}
          <div className="flex justify-center transition-all duration-300">
            <div className={cn('bg-white overflow-hidden shadow-2xl relative transition-all duration-300 flex items-center justify-center', getDeviceWidthClass())}>
              
              {publishing ? (
                // Publish sim loading overlay
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4 z-45 animate-fade-in">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Executing Compile Pipeline</h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">{publishStatus}</p>
                  </div>
                </div>
              ) : null}

              {/* High fidelity Stitch frame */}
              <iframe
                src={`/stitch-screens/${currentStep.file}`}
                className="w-full h-full border-0"
                title={currentStep.title}
                key={currentStep.file}
              />
            </div>
          </div>

          {/* Stepper Navigation Actions Bar */}
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-5 rounded-[24px]">
            <button
              onClick={handleBack}
              disabled={currentStepIdx === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-800 disabled:opacity-30 disabled:hover:bg-transparent hover:bg-slate-800 text-slate-300 disabled:text-slate-600 rounded-xl text-xs font-bold uppercase transition-all tracking-wider disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back Step
            </button>

            {currentStepIdx === steps.length - 1 ? (
              // Step 12: Deploy Trigger Button
              <button
                onClick={runPublishSimulation}
                disabled={publishing}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                {publishing ? 'Publishing...' : 'Deploy Live Site'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Next Step <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
