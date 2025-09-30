import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/app-store';
import { PodCard } from '../components/PodCard';
import { Modal } from '../components/Modal';
import { PodForm } from '../components/PodForm';
import { PodProfile } from '../../shared/types';

type ModalType = 'create' | 'edit' | 'delete' | null;

export function PodsPage() {
  const { pods, selectedPod, setPods, setSelectedPod, addPod, updatePod, removePod } =
    useAppStore();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingPod, setEditingPod] = useState<PodProfile | null>(null);
  const [deletingPod, setDeletingPod] = useState<PodProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPods();
  }, []);

  const loadPods = async () => {
    try {
      setLoading(true);
      const podsFromDb = await window.electronAPI.getPods();
      setPods(podsFromDb);
    } catch (error) {
      console.error('Failed to load pods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePod = async (
    podData: Omit<PodProfile, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newPod = await window.electronAPI.createPod(podData);
      addPod(newPod);
      setModalType(null);
    } catch (error) {
      console.error('Failed to create pod:', error);
      alert('Failed to create pod. Please try again.');
    }
  };

  const handleUpdatePod = async (
    podData: Omit<PodProfile, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingPod) return;

    try {
      const updatedPod = await window.electronAPI.updatePod(editingPod.id, podData);
      if (updatedPod) {
        updatePod(editingPod.id, updatedPod);
      }
      setModalType(null);
      setEditingPod(null);
    } catch (error) {
      console.error('Failed to update pod:', error);
      alert('Failed to update pod. Please try again.');
    }
  };

  const handleDeletePod = async () => {
    if (!deletingPod) return;

    try {
      await window.electronAPI.deletePod(deletingPod.id);
      removePod(deletingPod.id);
      setModalType(null);
      setDeletingPod(null);
    } catch (error) {
      console.error('Failed to delete pod:', error);
      alert('Failed to delete pod. Please try again.');
    }
  };

  const openCreateModal = () => {
    setEditingPod(null);
    setModalType('create');
  };

  const openEditModal = (pod: PodProfile) => {
    setEditingPod(pod);
    setModalType('edit');
  };

  const openDeleteModal = (pod: PodProfile) => {
    setDeletingPod(pod);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setEditingPod(null);
    setDeletingPod(null);
  };

  const handleConnect = (pod: PodProfile) => {
    console.log('Connect to pod:', pod.name);
    alert(`SSH connection feature will be implemented in Phase 5.\n\nPod: ${pod.name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[13px] text-gray-600">Loading pods...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#282828]">
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Pods</h2>
        <button onClick={openCreateModal} className="btn-primary">
          <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Pod
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#282828]">
        {pods.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-2">No Pods</h3>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-6 text-center max-w-sm">
              Create your first pod profile to manage RunPod connections, SSH access, and file transfers.
            </p>
            <button onClick={openCreateModal} className="btn-primary">
              Create First Pod
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pods.map((pod) => (
              <PodCard
                key={pod.id}
                pod={pod}
                isSelected={selectedPod?.id === pod.id}
                onSelect={() => setSelectedPod(pod)}
                onEdit={() => openEditModal(pod)}
                onDelete={() => openDeleteModal(pod)}
                onConnect={() => handleConnect(pod)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalType === 'create' || modalType === 'edit'}
        onClose={closeModal}
        title={modalType === 'create' ? 'Create New Pod' : 'Edit Pod'}
        size="lg"
      >
        <PodForm
          pod={editingPod}
          onSubmit={modalType === 'create' ? handleCreatePod : handleUpdatePod}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        title="Delete Pod"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <span className="font-semibold">{deletingPod?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeletePod} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}