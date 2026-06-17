import React from 'react';
import { Shield, Database, Brain, Cpu, MessageCircle, FileCheck } from 'lucide-react';

const About = () => {
  const specs = [
    { title: 'FastAPI Backend', desc: 'Asynchronous API endpoints in Python with dependency injection, JWT session security, and full OpenAPI documentation.', icon: Cpu },
    { title: 'React Frontend', desc: 'SPA built with Vite, Tailwind CSS styling, React Hook Form validations, and Framer Motion micro-animations.', icon: Shield },
    { title: 'PostgreSQL & Supabase', desc: 'Relational data models with foreign keys, checks, and Supabase Storage bucket integration for media payloads.', icon: Database },
    { title: 'Gemini AI Framework', desc: 'Uses Gemini Free API endpoints for service description generation, profile auditing, and relevance-based ranking recommendations.', icon: Brain },
    { title: 'WebSocket Direct Communication', desc: 'Real-time two-way messaging using FastAPI WebSockets including typing states, read receipts, and online triggers.', icon: MessageCircle },
    { title: 'Content Moderation Panel', desc: 'Enables administrators to view analytics graphs, inspect database registries, and remove inappropriate postings or users.', icon: FileCheck },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 dark:text-gray-100">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-3xl font-black tracking-tight sm:text-5xl uppercase text-brutal-charcoal dark:text-white">
          About Servo Project
        </h1>
        <p className="mt-4 text-base font-bold text-gray-600 dark:text-gray-400">
          Servo is an academic final-year computer science project showcasing modern web architecture practices. It addresses trust, visibility, and messaging delays in traditional peer service exchanges on college campus grounds.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-brutal-charcoal dark:text-white">
        {specs.map((spec, idx) => {
          const Icon = spec.icon;
          return (
            <div
              key={idx}
              className="rounded-none border-2 border-brutal-charcoal bg-white p-6 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm dark:hover:shadow-none"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-none border-2 border-brutal-charcoal bg-brutal-yellow p-2 text-brutal-charcoal shadow-brutal-sm dark:border-white">
                  <Icon className="h-5 w-5 stroke-[2.5]" />
                </div>
                <h3 className="font-black uppercase tracking-wide text-brutal-charcoal dark:text-white">{spec.title}</h3>
              </div>
              <p className="mt-4 text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
                {spec.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default About;
