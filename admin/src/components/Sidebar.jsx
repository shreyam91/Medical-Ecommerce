import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const links = [
    { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'limited_admin'] },
    { label: 'Orders', path: '/orders', roles: ['admin'] },
    { label: 'Inventory', path: '/inventory', roles: ['admin'] },
    { label: 'Products', path: '/products', roles: ['admin', 'limited_admin'] },
    { label: 'Customers', path: '/customers', roles: ['admin'] },
    { label: 'Delivery Status', path: '/delivery-status', roles: ['admin'] },
    { label: 'Blogs', path: '/blogs', roles: ['admin', 'limited_admin'] },
    { label: 'Payment', path: '/payment', roles: ['admin'] },
    // { label: 'Brands', path: '/brands', roles: ['admin', 'limited_admin'] },
    // { label: 'Banners', path: '/banners', roles: ['admin', 'limited_admin'] },
    // { label: 'Doctors', path: '/doctors', roles: ['admin', 'limited_admin'] },
    // { label: 'Reference Books', path: '/reference-books', roles: ['admin', 'limited_admin'] },
    // { label: 'Users', path: '/users', roles: ['admin'] },
  ];
  return (
    <aside className="w-58 bg-white shadow h-screen fixed">
      <div className="p-6 font-bold text-xl">HerbalMG Admin</div>
      <nav className="flex flex-col gap-4 p-4">
        {links.filter(link => link.roles.includes(user.role)).map(link => (
          <NavLink
            key={link.label}
            to={link.path}
            className={({ isActive }) =>
              `px-3 py-2 rounded hover:bg-gray-100 ${isActive ? "bg-gray-200" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
