import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ClipboardList,
  Layout,
  FileText,
  Clock,
  Shield,
  ArrowDown,
  CheckCircle,
  Brain,
  Sparkles,
  CreditCard,
  Check,
  Star,
} from "lucide-react";
import TestImage from "./test.png";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setEmail("");
  };

  // Main hero animations
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Problem section animations
  const problemOpacity = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);
  const problemY = useTransform(scrollYProgress, [0.15, 0.3], [100, 0]);

  // Features section animations
  const featuresOpacity = useTransform(scrollYProgress, [0.25, 0.4], [0, 1]);
  const featuresY = useTransform(scrollYProgress, [0.25, 0.4], [100, 0]);

  // Testimonials section animations
  const testimonialsOpacity = useTransform(
    scrollYProgress,
    [0.35, 0.5],
    [0, 1]
  );
  const testimonialsY = useTransform(scrollYProgress, [0.35, 0.5], [100, 0]);

  // Pricing section animations
  const pricingOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const pricingY = useTransform(scrollYProgress, [0.45, 0.6], [100, 0]);

  return (
    <div
      ref={containerRef}
      className="relative bg-[url('/grid-pattern.svg')] bg-fixed"
    >
      <div className='absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none' />
      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
        className='min-h-screen flex items-center justify-center relative overflow-hidden'
      >
        <div className='max-w-6xl mx-auto px-4 py-20 text-center relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='space-y-8'
          >
            {/* Enhanced Hero Text */}
            <div className='space-y-4'>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className='inline-block text-primary font-medium text-lg px-4 py-1 rounded-full border border-primary/20 bg-primary/10'
              >
                🚀 Coming Soon
              </motion.span>
              <h1 className='text-5xl md:text-7xl font-bold tracking-tight leading-tight'>
                <span className='bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent'>
                  Your AI-Powered
                </span>
                <br />
                <span className='inline-block mt-2'>
                  Life{" "}
                  <span className='relative'>
                    Dashboard
                    <motion.svg
                      viewBox='0 0 284 24'
                      className='absolute -bottom-2 left-0 w-full opacity-80'
                      xmlns='http://www.w3.org/2000/svg'
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 1 }}
                    >
                      <path
                        d='M2 22C82.5683 5.68764 155.318 1.66661 282 2.00006'
                        stroke='url(#paint0_linear)'
                        strokeWidth='4'
                        strokeLinecap='round'
                        fill='none'
                      />
                      <defs>
                        <linearGradient
                          id='paint0_linear'
                          x1='2'
                          y1='12'
                          x2='282'
                          y2='12'
                        >
                          <stop stopColor='#3B82F6' />
                          <stop offset='1' stopColor='#8B5CF6' />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                  </span>
                </span>
              </h1>
            </div>

            <p className='text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
              Stop juggling 10 apps. Let{" "}
              <span className='text-primary font-semibold'>AI organize</span>{" "}
              your habits, finances, and journaling so you can{" "}
              <span className='text-primary font-semibold'>
                focus on what matters
              </span>
              .
            </p>

            {/* Waitlist Form */}
            <motion.form
              onSubmit={handleWaitlistSignup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className='max-w-md mx-auto flex flex-col sm:flex-row gap-2 p-2 rounded-lg bg-secondary/30'
            >
              <Input
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='flex-grow bg-background'
                required
              />
              <Button
                type='submit'
                disabled={isSubmitting}
                className='relative group'
              >
                <span className='relative z-10'>
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </span>
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-md opacity-20 group-hover:opacity-40 transition-opacity'
                  animate={{
                    scale: isSubmitting ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: isSubmitting ? Infinity : 0,
                  }}
                />
              </Button>
            </motion.form>

            <div className='flex items-center justify-center gap-8 text-sm text-muted-foreground'>
              <span className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-primary' />
                Free Early Access
              </span>
              <span className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-primary' />
                No Credit Card
              </span>
            </div>

            {/* Existing dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='mt-12 relative'
            >
              <div className='relative rounded-lg overflow-hidden shadow-2xl border border-border/50'>
                <img
                  src={TestImage}
                  alt='Dashboard Preview'
                  className='w-full rounded-lg bg-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-background/80 to-transparent' />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Problem & Solution Section */}
      <motion.section
        style={{ opacity: problemOpacity, y: problemY }}
        className='py-20 bg-secondary/30'
      >
        <div className='max-w-6xl mx-auto px-4'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6'>
              <h2 className='text-3xl font-bold'>The Problem</h2>
              <ul className='space-y-4'>
                {problems.map((problem, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='flex items-start gap-3'
                  >
                    <CheckCircle className='w-6 h-6 text-primary mt-1' />
                    <p className='text-lg text-muted-foreground'>{problem}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className='space-y-6'>
              <h2 className='text-3xl font-bold'>Our Solution</h2>
              <div className='space-y-4'>
                {solutions.map((solution, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='p-4 rounded-lg bg-background border'
                  >
                    <h3 className='text-xl font-semibold mb-2 flex items-center gap-2'>
                      <Brain className='w-5 h-5 text-primary' />
                      {solution.title}
                    </h3>
                    <p className='text-muted-foreground'>
                      {solution.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        style={{ opacity: featuresOpacity, y: featuresY }}
        className='py-20'
      >
        <div className='max-w-6xl mx-auto px-4'>
          <h2 className='text-4xl font-bold text-center mb-16'>
            Powered by AI, Built for You
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className='p-6 rounded-lg bg-secondary/10 border hover:shadow-lg transition-all group'
              >
                <div className='mb-4 relative'>
                  <feature.icon className='w-12 h-12 text-primary' />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className='absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <Sparkles className='w-4 h-4 text-primary absolute top-0 right-0' />
                  </motion.div>
                </div>
                <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
                {feature.example && (
                  <div className='mt-4 p-3 rounded bg-secondary/20 text-sm'>
                    <strong>Example:</strong> {feature.example}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        style={{ opacity: pricingOpacity, y: pricingY }}
        className='py-20 bg-gradient-to-b from-background to-secondary/30'
      >
        <div className='max-w-6xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold mb-4'>
              Simple, Transparent Pricing
            </h2>
            <p className='text-xl text-muted-foreground'>
              Choose the plan that's right for you
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative p-6 rounded-xl border bg-background/50 backdrop-blur-sm
                  ${
                    plan.featured
                      ? "border-primary shadow-lg ring-2 ring-primary/20"
                      : "border-border"
                  }
                `}
              >
                {plan.featured && (
                  <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
                    <span className='bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full'>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className='text-center'>
                  <h3 className='text-xl font-semibold mb-2'>{plan.title}</h3>
                  <div className='mb-4'>
                    <span className='text-4xl font-bold'>${plan.price}</span>
                    <span className='text-muted-foreground'>/month</span>
                  </div>
                  <p className='text-muted-foreground mb-6'>
                    {plan.description}
                  </p>
                </div>

                <div className='space-y-3 mb-6'>
                  {plan.features.map((feature, i) => (
                    <div key={i} className='flex items-center gap-2'>
                      <Check className='w-5 h-5 text-primary' />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.featured ? "bg-primary text-primary-foreground" : ""
                  }`}
                  variant={plan.featured ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <footer className='border-t bg-background/50 backdrop-blur-sm'>
        <div className='max-w-6xl mx-auto px-4 py-12'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div>
              <h3 className='font-semibold mb-3'>Product</h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#features'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href='#pricing'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href='#demo'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-3'>Company</h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#about'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href='#blog'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href='#careers'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-3'>Resources</h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#docs'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href='#help'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href='#guides'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Guides
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-3'>Legal</h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#privacy'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href='#terms'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href='#security'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t mt-12 pt-8 text-center text-muted-foreground'>
            <p>© 2024 Personal Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const problems = [
  "Switching between multiple apps to track different aspects of life",
  "No clear insights from scattered data",
  "Difficult to maintain consistency with habits",
  "Time-consuming manual data entry",
];

const solutions = [
  {
    title: "Unified Dashboard",
    description:
      "One place for habits, finances, and personal notes with AI-powered insights.",
  },
  {
    title: "Smart Automation",
    description:
      "Automatic data sync and AI-generated recommendations based on your patterns.",
  },
  {
    title: "Personalized Experience",
    description:
      "Adapts to your needs with customizable widgets and intelligent suggestions.",
  },
];

const features = [
  {
    title: "AI Habit Coach",
    description:
      "Get personalized habit recommendations and mood-based insights.",
    example:
      "You're 30% more productive on days you meditate – keep the streak going!",
    icon: Brain,
  },
  {
    title: "Task Management",
    description:
      "Organize and track your tasks with intuitive tools and reminders.",
    icon: ClipboardList,
  },
  {
    title: "Calendar Integration",
    description:
      "Seamlessly sync your schedules and never miss an appointment.",
    icon: Calendar,
  },
  {
    title: "Smart Notes",
    description:
      "Take rich notes with our powerful editor and organization system.",
    icon: FileText,
  },
  {
    title: "Custom Dashboard",
    description: "Personalize your workspace to match your workflow perfectly.",
    icon: Layout,
  },
  {
    title: "Time Tracking",
    description: "Monitor your productivity and optimize your time management.",
    icon: Clock,
  },
  {
    title: "Secure Storage",
    description: "Keep your data safe with our enterprise-grade security.",
    icon: Shield,
  },
];

const pricingPlans = [
  {
    title: "Basic",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "Basic habit tracking",
      "Simple note-taking",
      "Manual task management",
      "2 GB storage",
    ],
    featured: false,
  },
  {
    title: "Pro",
    price: "9.99",
    description: "Best for personal productivity",
    features: [
      "AI-powered insights",
      "Advanced habit analytics",
      "Unlimited storage",
      "Priority support",
      "All integrations",
    ],
    featured: true,
  },
  {
    title: "Team",
    price: "19.99",
    description: "For families and small teams",
    features: [
      "Everything in Pro",
      "Up to 5 users",
      "Team collaboration",
      "Admin controls",
      "Custom branding",
    ],
    featured: false,
  },
];
