import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';
import AdminDashboard from '@/components/pagesComponent/Dashboard/AdminDashboard';
import EmployeeDashboard from '@/components/pagesComponent/Dashboard/EmployeeDashboard';

const Dashboard = () => {
  const userRole = useSelector((state: RootState) => state.auth.user);
  const isAdmin = userRole === 'admin' || userRole === 'superuser';

  return (
    <div className="animate-in fade-in duration-700">
      {isAdmin ? <AdminDashboard /> : <EmployeeDashboard />}
    </div>
  );
};

export default Dashboard;
