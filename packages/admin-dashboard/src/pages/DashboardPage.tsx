import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { analyticsApi } from '../api/client';

interface DashboardData {
  totalUsers: number;
  totalPets: number;
  totalConsultations: number;
  activeSubscriptions: number;
  consultationsToday: number;
  revenueThisMonth: number;
  userGrowth: Array<{ date: string; count: number }>;
  consultationsByDay: Array<{ date: string; count: number }>;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<{ data: DashboardData }>({
    queryKey: ['dashboard'],
    queryFn: analyticsApi.getDashboard,
  });

  const stats = data?.data;

  const statsCards = [
    { label: 'Total de Usuários', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total de Pets', value: stats?.totalPets || 0, icon: '🐾', color: 'bg-green-50 text-green-600' },
    { label: 'Consultas Hoje', value: stats?.consultationsToday || 0, icon: '💬', color: 'bg-purple-50 text-purple-600' },
    { label: 'Assinaturas Ativas', value: stats?.activeSubscriptions || 0, icon: '💳', color: 'bg-yellow-50 text-yellow-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral da plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Crescimento de Usuários
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consultations by Day */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Consultas por Dia
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.consultationsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Receita do Mês
          </h3>
          <span className="text-2xl font-bold text-primary-600">
            R$ {(stats?.revenueThisMonth || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-gray-500">
          Total de consultas este mês: {stats?.totalConsultations?.toLocaleString('pt-BR') || 0}
        </p>
      </div>
    </div>
  );
}
