import Image from "next/image";
import Link from "next/link";
import Navbar from "../component/commonComp/navbar/Navbar";
import { ArrowRight, Users, Heart, Bell } from "lucide-react";
import PostFeed from "../component/posts/PostFeed";

export default function Home() {
  const socialDomains = [
    "Education and Literacy",
    "Health and Sanitation",
    "Environment and Sustainability",
    "Poverty Alleviation",
    "Human Rights and Equality",
    "Child and Youth Welfare",
    "Elderly and Disabled Care",
    "Rural Development",
    "Disaster Relief",
    "Digital Empowerment"
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Connect, Contribute, <span className="text-green-600">Change</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A platform where people and NGOs unite to create social awareness and help those in need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/sinup" className="bg-white hover:bg-gray-100 text-green-600 font-semibold py-3 px-6 rounded-lg border border-green-600 flex items-center justify-center">
                  Join Us
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-80 w-full">
                <Image 
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                  alt="People working together"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600">Connect with your community and make a difference</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">Join a network of like-minded individuals and organizations committed to social change.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Notified</h3>
              <p className="text-gray-600">Receive real-time notifications about social initiatives in your area.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Contribute</h3>
              <p className="text-gray-600">Volunteer, donate, or spread awareness about causes that matter to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Domains Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Social Welfare Domains</h2>
            <p className="mt-4 text-xl text-gray-600">Areas where we make an impact together</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {socialDomains.map((domain, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                <p className="font-medium text-gray-800">{domain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Feed Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Recent Activities</h2>
            <p className="mt-4 text-xl text-gray-600">Discover what&apos;s happening in your community</p>
          </div>
          
          <PostFeed />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join our community today and be part of the change you want to see in society.
          </p>
          <Link href="/sinup" className="bg-white hover:bg-gray-100 text-green-600 font-semibold py-3 px-8 rounded-lg inline-flex items-center">
            Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
