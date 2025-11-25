import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { petsApi } from '../api/client';

interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed: string | null;
  birthDate: string | null;
  weight: number | null;
  owner: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  healthRecordsCount: number;
  consultationsCount: number;
  createdAt: string;
}

const speciesEmoji: Record<string, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  other: '🐾',
};

const speciesLabel: Record<string, string> = {
  dog: 'Cachorro',
  cat: 'Gato',
  bird: 'Pássaro',
  other: 'Outro',
};

export default function PetsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['pets', { page }],
    queryFn: () => petsApi.getAll({ page, limit: 10 }),
  });

  const pets: Pet[] = data?.data?.pets || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pets</h1>
        <p className="text-gray-500 mt-1">Todos os pets cadastrados na plataforma</p>
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
                <th className="table-header">Pet</th>
                <th className="table-header">Espécie</th>
                <th className="table-header">Raça</th>
                <th className="table-header">Dono</th>
                <th className="table-header">Consultas</th>
                <th className="table-header">Cadastro</th>
                <th className="table-header">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{speciesEmoji[pet.species]}</span>
                      <div>
                        <p className="font-medium">{pet.name}</p>
                        {pet.birthDate && (
                          <p className="text-xs text-gray-500">
                            {format(new Date(pet.birthDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{speciesLabel[pet.species]}</td>
                  <td className="table-cell">{pet.breed || '-'}</td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">{pet.owner.name}</p>
                      <p className="text-xs text-gray-500">{pet.owner.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="table-cell">{pet.consultationsCount}</td>
                  <td className="table-cell">
                    {format(new Date(pet.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="table-cell">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Ver histórico
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
              {total} pets
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
