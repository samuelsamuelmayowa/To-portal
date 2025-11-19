import ClassCalendar from "./Days";
import DashboardDropdown from "./Dropdown";


export default function StudentDashboard() {
  return (
    <div className="p-6">
          <DashboardDropdown/>
          <br/>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Class Schedule
      </h1>
      <ClassCalendar />
    </div>
  );
}