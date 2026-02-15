import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/concepts', label: 'Concepts' },
  { to: '/admin/media', label: 'Media' },
];

const AdminSidebar = () => (
  <aside className="w-full border-r border-gray-200 bg-white p-4 md:w-64 md:p-6">
    <h2 className="mb-6 text-xl font-bold text-gray-900">Admin Panel</h2>
    <nav className="space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `block rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;
