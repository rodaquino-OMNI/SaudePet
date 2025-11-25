import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Perfil' },
    { id: 'notifications', label: 'Notificações' },
    { id: 'integrations', label: 'Integrações' },
    { id: 'system', label: 'Sistema' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerenciar configurações do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'profile' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Informações do Perfil</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                defaultValue={user?.name}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                defaultValue={user?.email}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Função
            </label>
            <input
              type="text"
              value={user?.role === 'admin' ? 'Administrador' : 'Operador'}
              disabled
              className="input bg-gray-50"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="btn-primary">Salvar alterações</button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Preferências de Notificação</h3>

          <div className="space-y-4">
            {[
              { id: 'new_users', label: 'Novos usuários cadastrados', description: 'Receba uma notificação quando um novo usuário se cadastrar' },
              { id: 'consultations', label: 'Novas consultas', description: 'Receba uma notificação quando uma nova consulta for iniciada' },
              { id: 'subscriptions', label: 'Alterações em assinaturas', description: 'Receba uma notificação quando uma assinatura for alterada' },
              { id: 'system_alerts', label: 'Alertas do sistema', description: 'Receba alertas sobre problemas no sistema' },
            ].map((item) => (
              <div key={item.id} className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Integrações</h3>

          <div className="space-y-4">
            {[
              { id: 'whatsapp', name: 'WhatsApp Business', status: 'connected', icon: '📱' },
              { id: 'openai', name: 'OpenAI API', status: 'connected', icon: '🤖' },
              { id: 'stripe', name: 'Stripe Payments', status: 'connected', icon: '💳' },
              { id: 'slack', name: 'Slack Notifications', status: 'disconnected', icon: '💬' },
            ].map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{integration.name}</p>
                    <p className={`text-sm ${integration.status === 'connected' ? 'text-green-600' : 'text-gray-500'}`}>
                      {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </p>
                  </div>
                </div>
                <button className={integration.status === 'connected' ? 'btn-secondary' : 'btn-primary'}>
                  {integration.status === 'connected' ? 'Configurar' : 'Conectar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Configurações do Sistema</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite de consultas gratuitas por mês
              </label>
              <input
                type="number"
                defaultValue={3}
                className="input max-w-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout de sessão (minutos)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="input max-w-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo de IA padrão
              </label>
              <select className="input max-w-xs">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="btn-primary">Salvar configurações</button>
          </div>
        </div>
      )}
    </div>
  );
}
