'use client';

interface DeleteConfirmationModalProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  title: string;
  message: string;
}

const DeleteConfirmationModal = ({ 
  onConfirm, 
  onCancel,
  title,
  message 
}: DeleteConfirmationModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 