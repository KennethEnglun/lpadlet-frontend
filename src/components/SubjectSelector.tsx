import React from 'react';
import { X } from 'lucide-react';
import { Subject } from '../types';

interface SubjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
  responsiveConfig: any;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  isOpen,
  onClose,
  subjects,
  onSelectSubject,
  responsiveConfig
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`font-bold text-gray-800 ${responsiveConfig.titleSize}`}>
            選擇科目
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelectSubject(subject)}
                className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {subject.icon}
                </div>
                <span className="font-medium text-gray-700 text-center">
                  {subject.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelector; 