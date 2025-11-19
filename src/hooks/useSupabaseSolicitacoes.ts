import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_SERVER } from "@/utils/api";

export interface Solicitacao {
  id?: string;
  protocolo: string;
  secretaria: string;
  setor: string;
  funcao: string;
  nome: string;
  endereco: string;
  descricao: string;
  dataRegistro: Date;
  prazo: Date;
  status: 'Aguardando' | 'Aceita' | 'Cancelada' | 'Resolvida';
  responsavel?: string;
  localAtendimento?: string;
  nivel?: string;
  locked?: boolean;
}

const API_BASE = API_SERVER;

export const useSupabaseSolicitacoes = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const mapFromApi = (row: any): Solicitacao => ({
    id: row.id,
    protocolo: row.protocolo,
    secretaria: row.secretaria,
    setor: row.setor,
    funcao: row.funcao,
    nome: row.nome,
    endereco: row.endereco,
    descricao: row.descricao,
    dataRegistro: new Date(row.data_registro ?? row.dataRegistro ?? row.created_at),
    prazo: new Date(row.prazo),
    status: row.status,
    responsavel: row.responsavel ?? undefined,
    localAtendimento: row.local_atendimento ?? undefined,
    nivel: row.nivel ?? undefined,
    locked: !!row.locked,
  });

  const loadSolicitacoes = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/solicitacoes`);
      if (!resp.ok) throw new Error('Falha ao carregar solicitações');
      const data = await resp.json();
      setSolicitacoes(data.map(mapFromApi));
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro ao carregar solicitações',
        description: error.message ?? 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolicitacoes();
  }, []);

  const createSolicitacao = async (solicitacao: Solicitacao) => {
    try {
      const body = {
        protocolo: solicitacao.protocolo,
        secretaria: solicitacao.secretaria,
        setor: solicitacao.setor,
        funcao: solicitacao.funcao,
        nome: solicitacao.nome,
        endereco: solicitacao.endereco,
        descricao: solicitacao.descricao,
        data_registro: solicitacao.dataRegistro.toISOString(),
        prazo: solicitacao.prazo.toISOString(),
        status: solicitacao.status,
        responsavel: solicitacao.responsavel,
        local_atendimento: solicitacao.localAtendimento,
        nivel: solicitacao.nivel,
        locked: solicitacao.locked ?? false,
      };

      const resp = await fetch(`${API_BASE}/solicitacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error('Falha ao criar solicitação');

      const created = mapFromApi(await resp.json());
      setSolicitacoes(prev => [created, ...prev]);

      toast({
        title: 'Solicitação criada',
        description: `Protocolo: ${created.protocolo}`,
      });

      return created;
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro ao criar solicitação',
        description: error.message ?? 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateSolicitacao = async (id: string, updates: Partial<Solicitacao>) => {
    try {
      const existing = solicitacoes.find(s => s.id === id);
      const body = {
        ...existing,
        ...updates,
        data_registro: (updates.dataRegistro ?? existing?.dataRegistro)?.toISOString(),
        prazo: (updates.prazo ?? existing?.prazo)?.toISOString(),
      };

      const resp = await fetch(`${API_BASE}/solicitacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error('Falha ao atualizar solicitação');

      const updated = mapFromApi(await resp.json());
      setSolicitacoes(prev => prev.map(s => (s.id === id ? updated : s)));

      return updated;
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro ao atualizar solicitação',
        description: error.message ?? 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteSolicitacao = async (id: string) => {
    try {
      const resp = await fetch(`${API_BASE}/solicitacoes/${id}`, {
        method: 'DELETE',
      });

      if (!resp.ok) throw new Error('Falha ao excluir solicitação');

      setSolicitacoes(prev => prev.filter(s => s.id !== id));

      toast({
        title: 'Solicitação removida',
        description: 'O registro foi excluído com sucesso.',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro ao excluir solicitação',
        description: error.message ?? 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    solicitacoes,
    loading,
    createSolicitacao,
    updateSolicitacao,
    deleteSolicitacao,
    refreshSolicitacoes: loadSolicitacoes,
  };
};