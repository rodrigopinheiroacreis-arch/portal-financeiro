import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  PieChart,
  ChevronRight
} from 'lucide-react';

// Função utilitária para formatar moeda em Real (BRL)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função utilitária para formatar data
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Função para adicionar meses a uma data
const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export default function FinancialPortal() {
  const [view, setView] = useState('list'); // 'list', 'details', 'add'
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loans, setLoans] = useState([
    {
      id: 1,
      client: 'Empresa Modelo LTDA',
      contract: 'CTR-2024/001',
      bank: 'Banco Nacional',
      date: '2023-11-15',
      amount: 100000,
      installments: 12,
      rate: 1.5,
      totalInterest: 12500,
      totalIOF: 380,
      fees: 1500,
      insurance: 2400,
      totalSum: 116780
    },
    {
      id: 2,
      client: 'Comércio Varejista S.A.',
      contract: 'EMP-BB-998',
      bank: 'Banco do Brasil',
      date: '2024-01-10',
      amount: 50000,
      installments: 24,
      rate: 2.1,
      totalInterest: 15200,
      totalIOF: 190,
      fees: 800,
      insurance: 1200,
      totalSum: 67390
    }
  ]);

  // Estado para o formulário de novo empréstimo
  const [formData, setFormData] = useState({
    client: '',
    contract: '',
    bank: '',
    date: '',
    amount: '',
    installments: '',
    rate: '',
    totalInterest: '',
    totalIOF: '',
    fees: '',
    insurance: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount) || 0;
    const interest = parseFloat(formData.totalInterest) || 0;
    const iof = parseFloat(formData.totalIOF) || 0;
    const fees = parseFloat(formData.fees) || 0;
    const insurance = parseFloat(formData.insurance) || 0;
    
    const newLoan = {
      id: Date.now(),
      client: formData.client,
      contract: formData.contract,
      bank: formData.bank,
      date: formData.date,
      amount: amount,
      installments: parseInt(formData.installments),
      rate: parseFloat(formData.rate),
      totalInterest: interest,
      totalIOF: iof,
      fees: fees,
      insurance: insurance,
      totalSum: amount + interest + iof + fees + insurance
    };

    setLoans([...loans, newLoan]);
    setView('list');
    setFormData({
      client: '', contract: '', bank: '', date: '', amount: '', 
      installments: '', rate: '', totalInterest: '', totalIOF: '', fees: '', insurance: ''
    });
  };

  // Função para gerar as parcelas detalhadas
  const generateSchedule = (loan) => {
    const schedule = [];
    let currentLoanBalance = loan.amount;
    let currentInterestBalance = loan.totalInterest;
    let currentInsuranceBalance = loan.insurance;
    
    // Para simplificação gerencial, distribuímos linearmente, 
    // mas calculamos o saldo devedor mês a mês.
    const monthlyPrincipal = loan.amount / loan.installments;
    const monthlyInterest = loan.totalInterest / loan.installments;
    const monthlyIOF = loan.totalIOF / loan.installments;
    const monthlyInsurance = loan.insurance / loan.installments;
    const monthlyFees = loan.fees / loan.installments; // Tarifas diluídas na parcela total
    
    // A parcela é a soma de tudo dividido pelos meses
    const installmentValue = loan.totalSum / loan.installments;

    // Saldo Total inicial
    let currentTotalBalance = loan.totalSum;

    const startDate = new Date(loan.date);

    for (let i = 1; i <= loan.installments; i++) {
      // Abatimentos
      currentLoanBalance -= monthlyPrincipal;
      currentInterestBalance -= monthlyInterest;
      currentInsuranceBalance -= monthlyInsurance;
      currentTotalBalance -= installmentValue;

      schedule.push({
        installmentNumber: i,
        dueDate: addMonths(startDate, i),
        value: installmentValue,
        monthlyRate: loan.rate, // Taxa mantida como referência
        interest: monthlyInterest,
        iof: monthlyIOF,
        insurance: monthlyInsurance,
        loanBalance: Math.max(0, currentLoanBalance),
        interestBalance: Math.max(0, currentInterestBalance),
        insuranceBalance: Math.max(0, currentInsuranceBalance),
        totalBalance: Math.max(0, currentTotalBalance)
      });
    }
    return schedule;
  };

  // --- VISTAS ---

  const ListView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Contratos</h2>
        <button 
          onClick={() => setView('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Novo Empréstimo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Contrato</th>
              <th className="px-4 py-3">Banco</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Valor Empréstimo</th>
              <th className="px-4 py-3 text-center">Parc.</th>
              <th className="px-4 py-3 text-center">Taxa</th>
              <th className="px-4 py-3 text-right">Juros Total</th>
              <th className="px-4 py-3 text-right">IOF</th>
              <th className="px-4 py-3 text-right">Tarifas</th>
              <th className="px-4 py-3 text-right">Seguro</th>
              <th className="px-4 py-3 text-right font-bold text-blue-700">Total Geral</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((loan) => (
              <tr 
                key={loan.id} 
                className="hover:bg-blue-50 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedLoan(loan);
                  setView('details');
                }}
              >
                <td className="px-4 py-3 font-medium text-slate-900">{loan.client}</td>
                <td className="px-4 py-3 text-blue-600 font-medium group-hover:underline">{loan.contract}</td>
                <td className="px-4 py-3 text-slate-600">{loan.bank}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(loan.date)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(loan.amount)}</td>
                <td className="px-4 py-3 text-center">{loan.installments}x</td>
                <td className="px-4 py-3 text-center">{loan.rate}%</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(loan.totalInterest)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(loan.totalIOF)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(loan.fees)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(loan.insurance)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800 bg-slate-50/50">{formatCurrency(loan.totalSum)}</td>
                <td className="px-4 py-3 text-center text-slate-400 group-hover:text-blue-500">
                  <ChevronRight size={16} />
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan="13" className="px-4 py-8 text-center text-slate-400">
                  Nenhum contrato cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const DetailsView = () => {
    if (!selectedLoan) return null;
    const schedule = generateSchedule(selectedLoan);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('list')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Detalhamento do Contrato</h2>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <Building2 size={14}/> {selectedLoan.bank} • 
              <FileText size={14}/> {selectedLoan.contract}
            </p>
          </div>
        </div>

        {/* Cards de Resumo Superior */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-semibold">Valor Original</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedLoan.amount)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Juros</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(selectedLoan.totalInterest)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-semibold">Encargos (IOF+Seg+Tar)</p>
            <p className="text-xl font-bold text-purple-600">
              {formatCurrency(selectedLoan.totalIOF + selectedLoan.insurance + selectedLoan.fees)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm bg-blue-50 border-blue-100">
            <p className="text-xs text-blue-600 uppercase font-semibold">Total Geral</p>
            <p className="text-xl font-bold text-blue-800">{formatCurrency(selectedLoan.totalSum)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
              <tr>
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Contrato</th>
                <th className="px-3 py-3">Vencimento</th>
                <th className="px-3 py-3 text-right font-bold bg-blue-50/50 text-blue-900">Valor Parcela</th>
                <th className="px-3 py-3 text-center">Taxa Mês</th>
                <th className="px-3 py-3 text-right">Juros Mensal</th>
                <th className="px-3 py-3 text-right">IOF Mensal</th>
                <th className="px-3 py-3 text-right">Seguro Mensal</th>
                <th className="px-3 py-3 text-right text-slate-500 border-l border-slate-200">Saldo Empréstimo</th>
                <th className="px-3 py-3 text-right text-slate-500">Saldo Juros</th>
                <th className="px-3 py-3 text-right text-slate-500">Saldo Seguros</th>
                <th className="px-3 py-3 text-right font-bold text-slate-800 bg-gray-50">Saldo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.map((item) => (
                <tr key={item.installmentNumber} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-400 font-mono text-xs">{item.installmentNumber}</td>
                  <td className="px-3 py-2 font-medium text-slate-700 truncate max-w-[150px]">{selectedLoan.client}</td>
                  <td className="px-3 py-2 text-slate-600">{selectedLoan.contract}</td>
                  <td className="px-3 py-2 text-slate-800 font-medium">{formatDate(item.dueDate)}</td>
                  <td className="px-3 py-2 text-right font-bold text-blue-700 bg-blue-50/30">{formatCurrency(item.value)}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{item.monthlyRate}%</td>
                  <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.interest)}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.iof)}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.insurance)}</td>
                  <td className="px-3 py-2 text-right text-slate-500 border-l border-slate-200 font-mono">{formatCurrency(item.loanBalance)}</td>
                  <td className="px-3 py-2 text-right text-slate-500 font-mono">{formatCurrency(item.interestBalance)}</td>
                  <td className="px-3 py-2 text-right text-slate-500 font-mono">{formatCurrency(item.insuranceBalance)}</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-800 bg-gray-50 font-mono">{formatCurrency(item.totalBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const AddFormView = () => {
    // Cálculo prévio do total
    const currentTotal = (parseFloat(formData.amount) || 0) + 
                        (parseFloat(formData.totalInterest) || 0) + 
                        (parseFloat(formData.totalIOF) || 0) + 
                        (parseFloat(formData.fees) || 0) + 
                        (parseFloat(formData.insurance) || 0);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setView('list')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Novo Contrato</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Dados Cadastrais */}
            <div className="col-span-full border-b border-slate-100 pb-2 mb-2">
              <h3 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2">
                <Building2 size={16}/> Dados do Contrato
              </h3>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <input required name="client" value={formData.client} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Nome da Empresa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contrato (ID)</label>
              <input required name="contract" value={formData.contract} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: 12345/24" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Banco</label>
              <input required name="bank" value={formData.bank} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Instituição Financeira" />
            </div>
            
            {/* Dados Financeiros Principais */}
            <div className="col-span-full border-b border-slate-100 pb-2 mb-2 mt-4">
              <h3 className="text-sm font-bold text-green-600 uppercase flex items-center gap-2">
                <DollarSign size={16}/> Valores Principais
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Concessão</label>
              <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Empréstimo (R$)</label>
              <input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0,00" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parcelas</label>
                <input required type="number" name="installments" value={formData.installments} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Taxa (%)</label>
                <input required type="number" step="0.01" name="rate" value={formData.rate} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1.5" />
              </div>
            </div>

            {/* Componentes do Custo */}
            <div className="col-span-full border-b border-slate-100 pb-2 mb-2 mt-4">
              <h3 className="text-sm font-bold text-orange-600 uppercase flex items-center gap-2">
                <PieChart size={16}/> Composição do Custo Total
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Juros Totais (R$)</label>
              <input required type="number" step="0.01" name="totalInterest" value={formData.totalInterest} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0,00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IOF Total (R$)</label>
              <input required type="number" step="0.01" name="totalIOF" value={formData.totalIOF} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0,00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarifas (R$)</label>
              <input required type="number" step="0.01" name="fees" value={formData.fees} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0,00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seguro Total (R$)</label>
              <input required type="number" step="0.01" name="insurance" value={formData.insurance} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0,00" />
            </div>

            {/* Total Calculado */}
            <div className="col-span-full mt-6 p-4 bg-slate-100 rounded-lg flex justify-between items-center">
              <span className="text-slate-600 font-medium">Somatória Total Prevista:</span>
              <span className="text-2xl font-bold text-blue-700">{formatCurrency(currentTotal)}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setView('list')}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors"
            >
              Salvar Contrato
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Global */}
        <header className="mb-8 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Portal Financeiro</h1>
              <p className="text-xs text-slate-500">Gestão de Empréstimos Empresariais</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-600">Bem-vindo, Gestor</p>
            <p className="text-xs text-slate-400">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main>
          {view === 'list' && <ListView />}
          {view === 'details' && <DetailsView />}
          {view === 'add' && <AddFormView />}
        </main>
      </div>
    </div>
  );
}