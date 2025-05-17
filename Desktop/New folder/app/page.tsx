"use client";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Award,
  Zap,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEEEEE] dark:bg-[#222831] text-[#393E46] dark:text-[#EEEEEE] overflow-x-hidden scrollbar-hide">
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        html {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      {/* Navigation Bar */}
      <header className="border-b border-[#393E46]/10 dark:border-[#393E46]/20 bg-[#EEEEEE] dark:bg-[#222831] sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-[#00ADB5]" />
            <span className="font-bold text-xl">Resume Builder</span>
          </div>
          <nav className="hidden md:flex space-x-10">
            <Link
              href="#features"
              className="hover:text-[#00ADB5] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-[#00ADB5] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="hover:text-[#00ADB5] transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex space-x-4 items-center">
            <Link
              href="/sign-in"
              className="text-[#00ADB5] font-medium hover:underline"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-[#EEEEEE] px-5 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Centered with proper spacing and more left padding for content */}
      <section className="py-28 md:py-36 flex items-center justify-center min-h-[85vh] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#00ADB5]/5 dark:bg-[#00ADB5]/10 -skew-y-6 transform-gpu -translate-y-36 z-0"></div>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center relative z-10">
          <div className="md:w-1/2 mb-12 md:mb-0 md:pl-8 lg:pl-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Build Your{" "}
              <span className="text-[#00ADB5]">Professional Resume</span> in
              Minutes
            </h1>
            <p className="text-xl text-[#393E46]/80 dark:text-[#EEEEEE]/80 mb-12 max-w-lg">
              Create ATS-optimized resumes tailored to your dream job. Get more
              interviews with our AI-powered resume builder.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/home"
                className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-[#EEEEEE] px-8 py-4 rounded-lg font-medium flex items-center justify-center transition-all text-lg shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="bg-[#393E46] text-[#EEEEEE] dark:bg-[#EEEEEE] dark:text-[#393E46] px-8 py-4 rounded-lg font-medium hover:shadow-md transition-all text-lg text-center"
              >
                Learn How
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[#00ADB5]/20 rounded-lg transform rotate-3 scale-105 -z-10 blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/20 to-[#393E46]/20 rounded-lg transform -rotate-2 scale-105 -z-20 blur-md"></div>

              {/* Card */}
              <div className="bg-[#EEEEEE] dark:bg-[#393E46] shadow-xl rounded-lg p-8 border border-[#00ADB5]/10 dark:border-[#00ADB5]/20">
                <div className="flex items-center mb-8">
                  <div className="h-12 w-12 bg-[#00ADB5]/10 dark:bg-[#00ADB5]/20 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-[#00ADB5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Resume Builder</h3>
                    <p className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
                      Professional career toolkit
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      <CheckCircle className="h-5 w-5 text-[#00ADB5]" />
                    </div>
                    <div>
                      <p className="font-medium">ATS-Friendly Templates</p>
                      <p className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
                        Engineered to pass screening systems
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      <CheckCircle className="h-5 w-5 text-[#00ADB5]" />
                    </div>
                    <div>
                      <p className="font-medium">Job Description Analysis</p>
                      <p className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
                        Tailored to match job requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      <CheckCircle className="h-5 w-5 text-[#00ADB5]" />
                    </div>
                    <div>
                      <p className="font-medium">AI-Powered Suggestions</p>
                      <p className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
                        Smart recommendations for content
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 relative bg-[#F7F7F7] dark:bg-[#2B3440]"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#00ADB5] font-medium mb-2 tracking-wider">
              POWERFUL FEATURES
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#00ADB5] to-[#0097A7] inline-block text-transparent bg-clip-text">
              Everything You Need to Stand Out
            </h2>
            <p className="text-xl text-[#393E46]/80 dark:text-[#EEEEEE]/80 max-w-2xl mx-auto">
              Our resume builder offers all the tools necessary to create a
              professional resume that gets results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-[#393E46] p-8 rounded-xl shadow-lg border-b-4 border-[#00ADB5] hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#00ADB5]/10 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-[#00ADB5]" />
              </div>
              <h3 className="text-xl font-bold mb-3">ATS-Friendly Templates</h3>
              <p className="text-[#393E46]/80 dark:text-[#EEEEEE]/80">
                Our templates are designed to pass Applicant Tracking Systems
                and catch the recruiter&apos;s eye.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#393E46] p-8 rounded-xl shadow-lg border-b-4 border-[#00ADB5] hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#00ADB5]/10 rounded-lg flex items-center justify-center mb-6">
                <Award className="h-6 w-6 text-[#00ADB5]" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Job-Specific Optimization
              </h3>
              <p className="text-[#393E46]/80 dark:text-[#EEEEEE]/80">
                Tailor your resume to specific job descriptions to increase your
                chances of getting an interview.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#393E46] p-8 rounded-xl shadow-lg border-b-4 border-[#00ADB5] hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#00ADB5]/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-[#00ADB5]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Generation</h3>
              <p className="text-[#393E46]/80 dark:text-[#EEEEEE]/80">
                Create a professional resume in minutes with our intuitive
                builder and smart formatting tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-24 bg-gradient-to-br from-[#393E46] to-[#2C3333] text-[#EEEEEE]"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#00ADB5] font-medium mb-2 uppercase tracking-wider">
              SIMPLE PROCESS
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
              How It Works
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#00ADB5] rounded-full"></span>
            </h2>
            <p className="text-xl text-[#EEEEEE]/80 max-w-2xl mx-auto mt-6">
              Get your professional resume in just three easy steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row mb-16 group">
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-16 h-16 bg-[#00ADB5] shadow-lg rounded-full flex items-center justify-center z-10 text-[#EEEEEE] font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                </div>
                <div className="md:w-2/3 mt-8 md:mt-0 bg-[#3A4750]/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-3 flex items-center">
                    <span className="text-[#00ADB5] mr-2">01.</span> Enter Your
                    Information
                  </h3>
                  <p className="text-[#EEEEEE]/90 text-lg">
                    Fill in your professional details and skills, or import from
                    an existing resume. Our smart form guides you through the
                    process.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row mb-16 group">
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-16 h-16 bg-[#00ADB5] shadow-lg rounded-full flex items-center justify-center z-10 text-[#EEEEEE] font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                </div>
                <div className="md:w-2/3 mt-8 md:mt-0 bg-[#3A4750]/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-3 flex items-center">
                    <span className="text-[#00ADB5] mr-2">02.</span> Add Job
                    Description
                  </h3>
                  <p className="text-[#EEEEEE]/90 text-lg">
                    Paste the job description to optimize your resume for the
                    specific position. Our AI analyzes key requirements.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row group">
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-16 h-16 bg-[#00ADB5] shadow-lg rounded-full flex items-center justify-center z-10 text-[#EEEEEE] font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                </div>
                <div className="md:w-2/3 mt-8 md:mt-0 bg-[#3A4750]/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-3 flex items-center">
                    <span className="text-[#00ADB5] mr-2">03.</span> Generate &
                    Download
                  </h3>
                  <p className="text-[#EEEEEE]/90 text-lg">
                    Generate your tailored resume and download it in your
                    preferred format. Make any final adjustments with our
                    editor.
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00ADB5] via-[#00ADB5]/70 to-[#00ADB5]/40 transform -translate-x-1/2 hidden md:block rounded-full"></div>
            </div>

            {/* Quick start button */}
            <div className="mt-16 text-center">
              <Link
                href="/home"
                className="inline-flex items-center bg-gradient-to-r from-[#00ADB5] to-[#009DAB] hover:from-[#00BDC7] hover:to-[#00ADB5] text-[#EEEEEE] px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                Start Building Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-24 bg-[#EEEEEE] dark:bg-[#222831]"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#00ADB5] font-medium mb-2">SUCCESS STORIES</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Users Are Saying
            </h2>
            <p className="text-xl text-[#393E46]/80 dark:text-[#EEEEEE]/80 max-w-2xl mx-auto">
              Join thousands of satisfied professionals who landed their dream
              jobs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-[#393E46] p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#00ADB5]/20 rounded-full flex items-center justify-center text-[#00ADB5] font-bold">
                  JS
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">James Smith</h4>
                  <p className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
                    Software Engineer
                  </p>
                </div>
              </div>
              <p className="text-[#393E46]/90 dark:text-[#EEEEEE]/90">
                &quot;The resume builder helped me tailor my application
                perfectly. I received 3 interview calls in the first week after
                updating my resume!&quot;
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-[#393E46] p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#00ADB5]/20 rounded-full flex items-center justify-center text-[#00ADB5] font-bold">
                  AR
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Amanda Rodriguez</h4>
                  <p className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
                    Marketing Specialist
                  </p>
                </div>
              </div>
              <p className="text-[#393E46]/90 dark:text-[#EEEEEE]/90">
                &quot;I was struggling with my resume format until I found this
                tool. The job description analyzer is a game-changer for
                targeting specific roles.&quot;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-[#393E46] p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#00ADB5]/20 rounded-full flex items-center justify-center text-[#00ADB5] font-bold">
                  DN
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">David Nguyen</h4>
                  <p className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
                    Product Manager
                  </p>
                </div>
              </div>
              <p className="text-[#393E46]/90 dark:text-[#EEEEEE]/90">
                &quot;The templates are clean and professional. I particularly
                liked how easy it was to highlight my achievements with the
                suggested formatting.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#00ADB5]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#EEEEEE]">
            Ready to Create Your Professional Resume?
          </h2>
          <p className="text-xl text-[#EEEEEE]/90 mb-10 max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully landed their
            dream jobs with our resume builder.
          </p>
          <Link
            href="/sign-up"
            className="bg-[#EEEEEE] text-[#00ADB5] px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all inline-flex items-center"
          >
            Get Started For Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#222831] py-16 text-[#EEEEEE]/80">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div className="flex items-center space-x-2 mb-8 md:mb-0">
              <FileText className="h-6 w-6 text-[#00ADB5]" />
              <span className="font-bold text-xl text-[#EEEEEE]">
                Resume Builder
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 md:mb-0">
              <Link
                href="#features"
                className="hover:text-[#00ADB5] transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="hover:text-[#00ADB5] transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="hover:text-[#00ADB5] transition-colors"
              >
                Testimonials
              </Link>
              <Link href="#" className="hover:text-[#00ADB5] transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-[#00ADB5] transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
