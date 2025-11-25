import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { consultationsApi } from '../api/client';

interface Consultation {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  symptoms: string[];
  diagnosis: {
    condition: string;
    severity: string;
    confidence: number;
  } | null;
  pet: {
    id: string;
    name: string;
    species: string;
  };
  user: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  createdAt: string;
  completedAt: string | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Concluída', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-700' },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'text-green-600' },
  moderate: { label: 'Moderada', color: 'text-yellow-600' },
  high: { label: 'Alta', color: 'text-orange-600' },
  critical: { label: 'Crítica', color: 'text-red-600' },
};

export default function ConsultationsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['consultations', { page, status: statusFilter }],
    queryFn: () => consultationsApi.getAll({ page, limit: 10, status: statusFilter || undefined }),
  });

  const consultations: Consultation[] = data?.data?.consultations || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultas</h1>
        <p className="text-gray-500 mt-1">Histórico de consultas veterinárias</p>
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
            <option value="pending">Pendente</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
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
                <th className="table-header">Data</th>
                <th className="table-header">Pet</th>
                <th className="table-header">Dono</th>
                <th className="table-header">Sintomas</th>
                <th className="table-header">Diagnóstico</th>
                <th className="table-header">Status</th>
                <th className="table-header">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {consultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">
                        {format(new Date(consultation.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(consultation.createdAt), 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="font-medium">{consultation.pet.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{consultation.pet.species}</p>
                  </td>
                  <td className="table-cell">
                    <p className="font-medium">{consultation.user.name}</p>
                    <p className="text-xs text-gray-500">{consultation.user.phoneNumber}</p>
                  </td>
                  <td className="table-cell max-w-xs">
                    <p className="text-sm truncate">
                      {consultation.symptoms?.slice(0, 3).join(', ') || '-'}
                    </p>
                  </td>
                  <td className="table-cell">
                    {consultation.diagnosis ? (
                      <div>
                        <p className="font-medium text-sm">{consultation.diagnosis.condition}</p>
                        <p className={`text-xs ${severityConfig[consultation.diagnosis.severity]?.color}`}>
                          {severityConfig[consultation.diagnosis.severity]?.label}
                          {' - '}
                          {Math.round(consultation.diagnosis.confidence * 100)}% confiança
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${statusConfig[consultation.status]?.color}`}
                    >
                      {statusConfig[consultation.status]?.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Ver detalhes
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
              {total} consultas
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
