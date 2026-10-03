import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import { Loading } from "./components/ui";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import BookingView from "./pages/BookingView";
import Leads from "./pages/Leads";
import Users from "./pages/Users";
import Vehicles from "./pages/Vehicles";
import VehicleForm from "./pages/VehicleForm";
import Cities from "./pages/Cities";
import CityForm from "./pages/CityForm";
import CityLimits from "./pages/CityLimits";
import Airports from "./pages/Airports";
import AirportForm from "./pages/AirportForm";
import RentalPlans from "./pages/RentalPlans";
import RentalPlanForm from "./pages/RentalPlanForm";
import DhamCategories from "./pages/DhamCategories";
import DhamPackages from "./pages/DhamPackages";
import DhamPackageForm from "./pages/DhamPackageForm";
import Discounts from "./pages/Discounts";
import Settings from "./pages/Settings";
import TourPackages from "./pages/TourPackages";
import TourPackageForm from "./pages/TourPackageForm";
import TourHotels from "./pages/TourHotels";
import TourHotelForm from "./pages/TourHotelForm";
import TourBookings from "./pages/TourBookings";
import TourBookingView from "./pages/TourBookingView";

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <Loading text="Checking session…" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, ready } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={ready && user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:id" element={<BookingView />} />
        <Route path="leads" element={<Leads />} />
        <Route path="customers" element={<Users role="customer" />} />
        <Route path="drivers" element={<Users role="driver" />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/new" element={<VehicleForm />} />
        <Route path="vehicles/:id" element={<VehicleForm />} />
        <Route path="cities" element={<Cities />} />
        <Route path="cities/new" element={<CityForm />} />
        <Route path="cities/:id" element={<CityForm />} />
        <Route path="cities/:id/limits" element={<CityLimits />} />
        <Route path="airports" element={<Airports />} />
        <Route path="airports/new" element={<AirportForm />} />
        <Route path="airports/:id" element={<AirportForm />} />
        <Route path="rental-plans" element={<RentalPlans />} />
        <Route path="rental-plans/new" element={<RentalPlanForm />} />
        <Route path="rental-plans/:id" element={<RentalPlanForm />} />
        <Route path="dham/categories" element={<DhamCategories />} />
        <Route path="dham/packages" element={<DhamPackages />} />
        <Route path="dham/packages/new" element={<DhamPackageForm />} />


        <Route path="dham/packages/:id" element={<DhamPackageForm />} />

        <Route path="tour-packages" element={<TourPackages />} />
        <Route path="tour-hotels" element={<TourHotels />} />
        <Route path="tour-hotels/new" element={<TourHotelForm />} />
        <Route path="tour-hotels/:id" element={<TourHotelForm />} />
        <Route path="tour-packages/bookings" element={<TourBookings />} />
        <Route path="tour-packages/bookings/:id" element={<TourBookingView />} />
        <Route path="tour-packages/new" element={<TourPackageForm />} />
        <Route path="tour-packages/:id" element={<TourPackageForm />} />
        <Route path="discounts/one-way" element={<Discounts mode="oneWay" />} />
        <Route path="discounts/round-trip" element={<Discounts mode="roundTrip" />} />
        <Route path="discounts/local-airport" element={<Discounts mode="local_airport" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}