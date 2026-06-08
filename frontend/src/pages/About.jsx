import React from 'react';
import { Shield, Database, Brain, Cpu, MessageCircle, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <h1 className="font-sans text-3xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
          About Servo Project
        </h1>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
          Servo is an academic final-year computer science project showcasing modern web architecture practices. It addresses trust, visibility, and messaging delays in traditional peer service exchanges on college campus grounds.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {specs.map((spec, idx) => {
          const Icon = spec.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-950 dark:text-white">{spec.title}</h3>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {spec.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default About;
