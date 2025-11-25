import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { subscriptionsApi } from '../api/client';

interface Subscription {
  id: string;
  tier: 'free' | 'basic' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  monthlyConsultations: number;
  consultationsUsed: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  user: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  createdAt: string;
}

const tierConfig: Record<string, { label: string; color: string; price: string }> = {
  free: { label: 'Gratuito', color: 'bg-gray-100 text-gray-700', price: 'R$ 0' },
  basic: { label: 'Básico', color: 'bg-blue-100 text-blue-700', price: 'R$ 19,90' },
  premium: { label: 'Premium', color: 'bg-yellow-100 text-yellow-700', price: 'R$ 39,90' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-700' },
  past_due: { label: 'Atrasado', color: 'bg-orange-100 text-orange-700' },
};

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', { page, status: statusFilter }],
    queryFn: () => subscriptionsApi.getAll({ page, limit: 10, status: statusFilter || undefined }),
  });

  const subscriptions: Subscription[] = data?.data?.subscriptions || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assinaturas</h1>
        <p className="text-gray-500 mt-1">Gerenciar assinaturas dos usuários</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(tierConfig).map(([key, config]) => (
          <div key={key} className="card">
            <div className="flex items-center justify-between">
              <div>
                <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
                  {config.label}
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-2">{config.price}/mês</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input max-w-xs"
          >
            <option value="">Todos</option>
            <option value="active">Ativo</option>
            <option value="cancelled">Cancelado</option>
            <option value="expired">Expirado</option>
            <option value="past_due">Atrasado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Usuário</th>
                <th className="table-header">Plano</th>
                <th className="table-header">Status</th>
                <th className="table-header">Consultas</th>
                <th className="table-header">Período</th>
                <th className="table-header">Início</th>
                <th className="table-header">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">{subscription.user.name}</p>
                      <p className="text-xs text-gray-500">{subscription.user.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${tierConfig[subscription.tier]?.color}`}>
                      {tierConfig[subscription.tier]?.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[subscription.status]?.color}`}>
                      {statusConfig[subscription.status]?.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[100px]">
                        <div
                          className="h-2 bg-primary-500 rounded-full"
                          style={{
                            width: `${Math.min((subscription.consultationsUsed / subscription.monthlyConsultations) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {subscription.consultationsUsed}/{subscription.monthlyConsultations}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell text-sm">
                    {format(new Date(subscription.currentPeriodStart), 'dd/MM', { locale: ptBR })}
                    {' - '}
                    {format(new Date(subscription.currentPeriodEnd), 'dd/MM', { locale: ptBR })}
                  </td>
                  <td className="table-cell">
                    {format(new Date(subscription.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="table-cell">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {(page - 1) * 10 + 1} a {Math.min(page * 10, total)} de{' '}
              {total} assinaturas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
