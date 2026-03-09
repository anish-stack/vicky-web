"use client";

import { useState } from "react";

type Category =
  | "tour_guide"
  | "rto_service"
  | "car_accessory"
  | "car_mechanic";

export default function Page() {
  const [category, setCategory] = useState<Category | "">("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState<any>({});
  const [otp, setOtp] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm({ ...form, [name]: files });

      if (name === "profileImage") {
        setPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const submitForm = async (e: any) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach((key) => {
      if (form[key] instanceof FileList) {
        for (let i = 0; i < form[key].length; i++) {
          data.append(key, form[key][i]);
        }
      } else {
        data.append(key, form[key]);
      }
    });

    data.append("category", category);

    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      body: data,
    });

    const result = await res.json();

    if (result.success) {
      setStep("otp");
    } else {
      alert(result.message);
    }
  };

  const verifyOTP = async () => {
    const res = await fetch("http://localhost:5000/api/verify-register-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: form.phone,
        otp,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Registration Completed");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">

        {/* LEFT PANEL */}

        <div className="bg-[#E52710] text-white p-10 flex flex-col justify-center">

          <h1 className="text-4xl font-bold mb-4">
            Join Our Service Network
          </h1>

          <p className="opacity-90 leading-relaxed">
            Register as a service provider and start receiving customers
            directly from our platform.
          </p>

          <div className="mt-10 space-y-3 text-sm">

            <div>✔ Get more customers</div>
            <div>✔ Increase your visibility</div>
            <div>✔ Grow your business</div>

          </div>

        </div>

        {/* RIGHT FORM */}

        <div className="p-10">

          {step === "form" && (
            <form onSubmit={submitForm} className="space-y-6">

              <h2 className="text-2xl font-bold text-gray-800">
                Provider Registration
              </h2>

              {/* PROFILE IMAGE */}

              <div className="flex items-center gap-4">

                {preview ? (
                  <img
                    src={preview}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                )}

                <input
                  type="file"
                  name="profileImage"
                  onChange={handleChange}
                />

              </div>

              {/* BASIC INFO */}

              <div className="grid grid-cols-2 gap-4">

                <input
                  name="name"
                  placeholder="Full Name"
                  className="input"
                  onChange={handleChange}
                  required
                />

                <input
                  name="email"
                  placeholder="Email"
                  className="input"
                  onChange={handleChange}
                  required
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  className="input"
                  onChange={handleChange}
                  required
                />

                <input
                  name="city"
                  placeholder="City"
                  className="input"
                  onChange={handleChange}
                />

              </div>

              <input
                name="address"
                placeholder="Address"
                className="input"
                onChange={handleChange}
              />

              {/* CATEGORY SELECT */}

              <div>

                <p className="font-semibold mb-3">
                  Select Category
                </p>

                <div className="grid grid-cols-2 gap-3">

                  {[
                    ["tour_guide", "Tour Guide"],
                    ["rto_service", "RTO Service"],
                    ["car_accessory", "Car Accessory"],
                    ["car_mechanic", "Car Mechanic"],
                  ].map(([value, label]) => (
                    <div
                      key={value}
                      onClick={() => setCategory(value as Category)}
                      className={`border rounded-lg p-4 cursor-pointer transition
                      ${
                        category === value
                          ? "border-[#E52710] bg-red-50"
                          : "hover:border-gray-400"
                      }`}
                    >
                      {label}
                    </div>
                  ))}

                </div>

              </div>

              {/* CATEGORY FIELDS */}

              {category === "tour_guide" && (
                <div className="grid grid-cols-2 gap-4">

                  <input
                    name="experienceYears"
                    placeholder="Experience Years"
                    className="input"
                    onChange={handleChange}
                  />

                  <input
                    name="languages"
                    placeholder="Languages"
                    className="input"
                    onChange={handleChange}
                  />

                  <input
                    name="guideLicenseNumber"
                    placeholder="License Number"
                    className="input"
                    onChange={handleChange}
                  />

                  <input
                    type="file"
                    name="tourImages"
                    multiple
                    onChange={handleChange}
                  />

                </div>
              )}

              {category === "rto_service" && (
                <div className="grid grid-cols-2 gap-4">

                  <input
                    name="officeName"
                    placeholder="Office Name"
                    className="input"
                    onChange={handleChange}
                  />

                  <input
                    name="officeAddress"
                    placeholder="Office Address"
                    className="input"
                    onChange={handleChange}
                  />

                </div>
              )}

              {category === "car_accessory" && (
                <div className="grid grid-cols-2 gap-4">

                  <input
                    name="shopName"
                    placeholder="Shop Name"
                    className="input"
                    onChange={handleChange}
                  />

                  <input
                    name="shopAddress"
                    placeholder="Shop Address"
                    className="input"
                    onChange={handleChange}
                  />

                  <input
                    type="file"
                    name="shopImages"
                    multiple
                    onChange={handleChange}
                  />

                </div>
              )}

              {category === "car_mechanic" && (
                <div className="grid grid-cols-2 gap-4">

                  <input
                    name="garageName"
                    placeholder="Garage Name"
                    className="input"
                    onChange={handleChange}
                  />

                  <input
                    name="garageAddress"
                    placeholder="Garage Address"
                    className="input"
                    onChange={handleChange}
                  />

                  <input
                    name="mechanicExperience"
                    placeholder="Experience"
                    className="input"
                    onChange={handleChange}
                  />

                </div>
              )}

              <button className="w-full bg-[#E52710] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition">
                Register
              </button>

            </form>
          )}

          {/* OTP SCREEN */}

          {step === "otp" && (
            <div className="space-y-6">

              <h2 className="text-2xl font-bold">
                Verify OTP
              </h2>

              <p className="text-gray-500">
                Enter OTP sent to your WhatsApp number
              </p>

              <input
                className="input text-center text-lg tracking-widest"
                placeholder="------"
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                onClick={verifyOTP}
                className="w-full bg-[#E52710] text-white py-3 rounded-lg font-semibold"
              >
                Verify OTP
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}