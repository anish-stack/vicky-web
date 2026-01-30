import React from "react";

const services = [
  {
    title: "One Way Trip",
    desc: "Book a hassle-free one way cab ride to any city. No return charges, pay only for one side travel.",
    image: "https://images.pexels.com/photos/21014/pexels-photo.jpg",
  },
  {
    title: "Round Trip",
    desc: "Plan your round trip with us and enjoy affordable pricing with a dedicated cab for your return journey.",
    image: "https://images.pexels.com/photos/386025/pexels-photo-386025.jpeg",
  },
  {
    title: "Popular City Rides",
    desc: "Explore popular cities with our trusted cab service. Safe, comfortable, and budget-friendly rides available.",
    image: "https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg",
  },
];

const Services = () => {
  return (
    <section className="bg-gradient-to-b from-white to-red-50 py-6 md:py-10 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {/* Heading */}
        <p className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-100 text-red-600 text-m font-bold">Latest Services</p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">
          Explore Our Top-Rated Services
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 md:mt-12">
          {services.map((item, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-4"
            >
              <img
                src={item.image}
                alt={item.title}
                className="rounded-xl w-full h-56 object-cover"
              />

              <h3 className="text-xl font-bold mt-4">{item.title}</h3>
              <p className="text-gray-600 mt-2 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
