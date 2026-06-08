import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { DEFAULT_WEIGHTS } from '@/utils/constants';

// Local storage keys
const MOCK_RUBRICS_KEY = 'epic_mock_rubrics';

const INITIAL_MOCK_RUBRICS = [
  {
    id: 'rubric-default-uuid',
    name: 'Rubrik Praktikum Akuntansi Dasar (Master)',
    weight_e: 0.20,
    weight_p: 0.20,
    weight_i: 0.20,
    weight_c: 0.20,
    weight_pe: 0.20,
    is_master: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'rubric-bobot-kritis-uuid',
    name: 'Rubrik Praktikum Jurnal Penyesuaian (Fokus Refleksi)',
    weight_e: 0.15,
    weight_p: 0.15,
    weight_i: 0.20,
    weight_c: 0.35, // High weight on Critical Reflection
    weight_pe: 0.15,
    is_master: false,
    created_at: new Date('2026-06-05').toISOString()
  }
];

export function useRubric() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isMock, profile } = useAuthStore();
  const { addToast } = useUiStore();

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isMock) {
        // Simulated local storage backend
        let localData = localStorage.getItem(MOCK_RUBRICS_KEY);
        if (!localData) {
          localStorage.setItem(MOCK_RUBRICS_KEY, JSON.stringify(INITIAL_MOCK_RUBRICS));
          localData = JSON.stringify(INITIAL_MOCK_RUBRICS);
        }
        setTemplates(JSON.parse(localData));
      } else {
        // Real Supabase API call
        const { data, error } = await supabase
          .from('rubric_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching rubrics:', error.message);
      addToast('Gagal memuat template rubrik: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isMock, addToast]);

  const saveTemplate = async (name, weights, isMaster = false) => {
    setIsLoading(true);
    try {
      const newRubric = {
        name,
        weight_e: Number(weights.E),
        weight_p: Number(weights.P),
        weight_i: Number(weights.I),
        weight_c: Number(weights.C),
        weight_pe: Number(weights.PE),
        is_master: isMaster
      };

      if (isMock) {
        // Mock save
        const savedData = localStorage.getItem(MOCK_RUBRICS_KEY) || JSON.stringify(INITIAL_MOCK_RUBRICS);
        const rubricsList = JSON.parse(savedData);
        
        const createdRubric = {
          ...newRubric,
          id: 'rubric-' + Math.random().toString(36).substring(2, 9),
          created_by: profile?.id || 'mock-user-id',
          created_at: new Date().toISOString()
        };
        
        // If it is master, unset other masters (optional)
        if (isMaster) {
          rubricsList.forEach(r => r.is_master = false);
        }

        rubricsList.unshift(createdRubric);
        localStorage.setItem(MOCK_RUBRICS_KEY, JSON.stringify(rubricsList));
        setTemplates(rubricsList);
        addToast('Template rubrik berhasil disimpan (Local Mode)!', 'success');
        return createdRubric;
      } else {
        // Supabase Save
        const createdRubric = {
          ...newRubric,
          created_by: profile?.id
        };

        // If saving as master, let's reset other master flags first
        if (isMaster) {
          await supabase
            .from('rubric_templates')
            .update({ is_master: false })
            .eq('is_master', true);
        }

        const { data, error } = await supabase
          .from('rubric_templates')
          .insert([createdRubric])
          .select();

        if (error) throw error;
        
        addToast('Template rubrik berhasil disimpan ke database!', 'success');
        fetchTemplates();
        return data[0];
      }
    } catch (error) {
      console.error('Error saving rubric:', error.message);
      addToast('Gagal menyimpan rubrik: ' + error.message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    setIsLoading(true);
    try {
      if (isMock) {
        const savedData = localStorage.getItem(MOCK_RUBRICS_KEY) || JSON.stringify(INITIAL_MOCK_RUBRICS);
        const rubricsList = JSON.parse(savedData);
        const filtered = rubricsList.filter(r => r.id !== id);
        localStorage.setItem(MOCK_RUBRICS_KEY, JSON.stringify(filtered));
        setTemplates(filtered);
        addToast('Template rubrik berhasil dihapus (Local Mode)!', 'success');
      } else {
        const { error } = await supabase
          .from('rubric_templates')
          .delete()
          .eq('id', id);

        if (error) throw error;
        addToast('Template rubrik berhasil dihapus!', 'success');
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting rubric:', error.message);
      addToast('Gagal menghapus rubrik: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    fetchTemplates,
    saveTemplate,
    deleteTemplate
  };
}
