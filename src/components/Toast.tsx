import { useEffect } from 'react';

type ToastProps = {
	message: string;
	onClose: () => void;
	type?: 'success' | 'error' | 'info' | 'warning';
};

const Toast = ({ message, onClose, type = 'info' }: ToastProps) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, 3000);

		return () => clearTimeout(timer);
	}, [onClose]);

	const toastStyles = {
		success:
			'border-emerald-200/50 bg-gradient-to-r from-emerald-50/80 via-purple-50/80 to-emerald-50/80 text-emerald-700',
		error: 'border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-rose-50/80 text-purple-700',
		warning:
			'border-amber-200/50 bg-gradient-to-r from-amber-50/80 via-purple-50/80 to-orange-50/80 text-amber-700',
		info: 'border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 text-purple-700',
	};

	const iconStyles = {
		success: 'text-emerald-500',
		error: 'text-purple-500',
		warning: 'text-amber-500',
		info: 'text-purple-500',
	};

	return (
		<div className='fixed right-0 top-4 z-50 mx-4 animate-fade-in sm:right-4'>
			<div className='overflow-hidden rounded-xl backdrop-blur-sm'>
				<div
					className={`flex items-center gap-3 border p-4 shadow-sm ${toastStyles[type]}`}
				>
					<div className='flex-1 text-sm font-medium'>{message}</div>
					<button
						onClick={onClose}
						className={`rounded-lg p-1.5 transition-colors ${iconStyles[type]} hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
					>
						<svg
							className='h-4 w-4'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Toast;
