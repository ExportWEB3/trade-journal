import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} animate-spin accent-text`} />
      {text && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
