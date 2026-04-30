import { Link } from 'react-router-dom';
import { Users, MessageCircle, Shield, Search, ArrowRight, Heart, Code } from 'lucide-react';
import PartnershipBox from '../components/PartnershipBox';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <Users size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect <span className="text-blue-200">University Duo</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connect with students who share your qualities, niche, and ambitions.
            Whether you need a study partner, a friend, or someone who gets you — UniSync brings you together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
              <span>Get Started</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
              Already a Member? Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose UniSync?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-blue-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600">Find students based on qualities, niche, and study habits that match yours.</p>
            </div>

            <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Community</h3>
              <p className="text-gray-600">All members are verified via email OTP to ensure a safe and trusted environment.</p>
            </div>

            <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-purple-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">In-App Chat</h3>
              <p className="text-gray-600">Connect and chat with your matches directly within the platform.</p>
            </div>

            <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="bg-rose-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-rose-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Meaningful Connections</h3>
              <p className="text-gray-600">Build real relationships with students who share your goals and interests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <PartnershipBox />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Sign up with your university details, add your photo, and share your qualities.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Find Your Match</h3>
              <p className="text-gray-600">Browse students and send connection requests to those who interest you.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Connecting</h3>
              <p className="text-gray-600">Once accepted, chat and build your university duo relationship!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Duo?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of students already connecting on UniSync.</p>
          <Link to="/signup" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2">
            <span>Join UniSync Now</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Code size={16} />
              <span>Meet the Project Owners</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Built with Passion</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Developer 1: Sohaib Jan */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">

                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Sohaib Jan</h3>
                    <p className="text-blue-200 text-sm">Project Owner</p>
                  </div>
                </div>
                
                <div className="md:w-3/5 p-6 flex flex-col justify-center">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                        <Users className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">University</p>
                        <p className="text-base font-medium text-gray-900">Emerson University, Multan</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                        <Code className="text-green-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Course</p>
                        <p className="text-base font-medium text-gray-900">Software Engineering</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                        <Heart className="text-purple-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Contact No.</p>
                        <p className="text-base font-medium text-gray-900">0334-6932860</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-600 italic text-sm">
                      "I built UniSync to help students like me find the perfect study partner and build meaningful connections on campus."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer 2: Ahmad Bilal */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <img src="/developers.png" alt="Ahmad Bilal" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">Ahmad Bilal</h3>
                    <p className="text-blue-200 text-sm">Project Owner</p>
                  </div>
                </div>
                
                <div className="md:w-3/5 p-6 flex flex-col justify-center">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                        <Users className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">University</p>
                        <p className="text-base font-medium text-gray-900">Emerson University, Multan</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                        <Code className="text-green-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Course</p>
                        <p className="text-base font-medium text-gray-900">Software Engineering</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                        <Heart className="text-purple-600" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Contact No.</p>
                        <p className="text-base font-medium text-gray-900">0328-8311026</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-600 italic text-sm">
                      "I built UniSync to help students like me find the perfect study partner and build meaningful connections on campus."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <p> UniSync. All rights reserved. Find Your University Duo.</p>
      </footer>
    </div>
  );
}
