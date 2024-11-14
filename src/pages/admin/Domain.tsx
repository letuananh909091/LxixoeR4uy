import Toast from '@components/Toast';
import {
	faCheckCircle,
	faExclamationCircle,
	faGlobe,
	faMagnifyingGlass,
	faPlus,
	faSearch,
	faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

const Domain = () => {
	const [domains, setDomains] = useState<string[]>([]);
	const [newDomain, setNewDomain] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [domainToDelete, setDomainToDelete] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	const fetchDomains = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/admin/domains', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			setDomains(Array.isArray(data) ? data : []);
		} catch {
			setError('Không thể lấy domain');
		}
	};

	useEffect(() => {
		fetchDomains();
	}, []);

	const handleAddDomain = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newDomain.trim()) {
			setToastMessage('Vui lòng nhập domain');
			return;
		}
		if (!newDomain.includes('.') || newDomain.includes('/')) {
			setToastMessage('Domain không hợp lệ');
			return;
		}
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/admin/add-domain', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ domain: newDomain }),
			});
			const data = await response.json();
			if (data.success) {
				setSuccess('Thêm domain thành công');
				setNewDomain('');
				fetchDomains();
			} else {
				setError(data.message);
			}
		} catch {
			setToastMessage('Không thể thêm domain');
		}
	};

	const confirmDelete = (domain: string) => {
		setDomainToDelete(domain);
		setShowDeleteModal(true);
	};

	const handleDeleteConfirmed = async () => {
		if (!domainToDelete) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/admin/delete-domain', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ domain: domainToDelete }),
			});
			const data = await response.json();
			if (data.success) {
				setSuccess(`Đã xóa domain ${domainToDelete}`);
				fetchDomains();
			} else {
				setError(data.message);
			}
		} catch {
			setError('Không thể xóa domain');
		} finally {
			setShowDeleteModal(false);
			setDomainToDelete(null);
		}
	};

	const filteredDomains = domains.filter((domain) =>
		domain.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className=''>
			<div className='absolute -left-10 -top-10 z-0 h-40 w-40 animate-float rounded-full bg-white/10' />
			<div className='absolute right-20 top-40 z-0 h-24 w-24 animate-float-delayed rounded-full bg-white/10' />
			<div className='absolute bottom-20 left-1/3 z-0 h-32 w-32 animate-float rounded-full bg-white/10' />

			{toastMessage && (
				<Toast
					message={toastMessage}
					onClose={() => setToastMessage(null)}
				/>
			)}

			<div className='relative mx-auto max-w-2xl animate-fade-in'>
				<div className='overflow-hidden rounded-3xl bg-white/10 p-1 backdrop-blur-lg'>
					<div className='relative rounded-2xl bg-white p-4 shadow-2xl sm:p-8'>
						<div className='absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 opacity-20 blur-lg' />
						<div className='absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 opacity-20 blur-lg' />

						<div className='relative space-y-6'>
							<div className='flex flex-col items-center gap-3 sm:flex-row'>
								<div className='rounded-full bg-gradient-to-r from-purple-600 to-pink-500 p-2'>
									<FontAwesomeIcon
										icon={faGlobe}
										className='text-2xl text-white'
									/>
								</div>
								<h1 className='text-center text-2xl font-bold text-purple-900 sm:text-left'>
									Quản Lý Domain
								</h1>
							</div>

							<div className='space-y-4 sm:space-y-6'>
								<div className='relative'>
									<input
										id='search'
										type='text'
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										placeholder='Tìm kiếm domain...'
										className='block w-full rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 pl-10 placeholder-purple-400 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 sm:py-3.5'
									/>
									<FontAwesomeIcon
										icon={faSearch}
										className='absolute left-3 top-1/2 -translate-y-1/2 text-purple-400'
									/>
								</div>

								<form
									onSubmit={handleAddDomain}
									className='flex flex-col gap-3 sm:flex-row'
								>
									<input
										id='newDomain'
										type='text'
										value={newDomain}
										onChange={(e) =>
											setNewDomain(e.target.value)
										}
										placeholder='Thêm Domain Mới'
										className='flex-1 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 placeholder-purple-400 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 sm:py-3.5'
										autoFocus
									/>
									<button
										type='submit'
										className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:py-3.5'
									>
										<span className='relative flex items-center justify-center gap-2'>
											<FontAwesomeIcon icon={faPlus} />
											<span>Thêm Domain</span>
										</span>
									</button>
								</form>

								{(error || success) && (
									<div
										className={`animate-fade-in rounded-xl p-4 backdrop-blur-sm ${
											error
												? 'border border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-rose-50/80 text-purple-700 shadow-sm shadow-purple-100'
												: 'border border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-emerald-50/80 text-purple-700 shadow-sm shadow-purple-100'
										}`}
									>
										<div className='flex items-center gap-3'>
											<FontAwesomeIcon
												icon={
													error
														? faExclamationCircle
														: faCheckCircle
												}
												className={`text-lg ${'text-purple-500'}`}
											/>
											<span className='font-medium'>
												{error || success}
											</span>
										</div>
									</div>
								)}

								<div className='rounded-xl border border-purple-100 bg-purple-50/50 p-4 sm:p-6'>
									<h3 className='mb-4 text-center text-lg font-semibold text-purple-900 sm:text-left'>
										Danh Sách Domain
									</h3>
									<div className='space-y-3'>
										{filteredDomains.map((domain) => (
											<div
												key={domain}
												className='group flex flex-row items-center justify-between gap-3 rounded-xl border border-purple-100 bg-white p-4 transition-all duration-200 hover:border-purple-200 hover:shadow-sm'
											>
												<span className='truncate text-center text-purple-900 sm:text-left'>
													{domain}
												</span>
												<button
													onClick={() =>
														confirmDelete(domain)
													}
													className='inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-600 transition-colors duration-200 hover:bg-purple-100 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200 sm:opacity-0 sm:group-hover:opacity-100'
													title='Xóa domain'
												>
													<FontAwesomeIcon
														icon={faTrashCan}
													/>
													<span>Xóa</span>
												</button>
											</div>
										))}

										{domains.length === 0 ? (
											<div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple-100 py-8 sm:py-12'>
												<FontAwesomeIcon
													icon={faGlobe}
													className='mb-4 text-4xl text-purple-300 sm:text-6xl'
												/>
												<p className='text-center text-base font-medium text-purple-900 sm:text-lg'>
													Chưa có domain nào
												</p>
											</div>
										) : (
											filteredDomains.length === 0 && (
												<div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple-100 py-8 sm:py-12'>
													<FontAwesomeIcon
														icon={faMagnifyingGlass}
														className='mb-4 text-4xl text-purple-300 sm:text-6xl'
													/>
													<p className='text-center text-base font-medium text-purple-900 sm:text-lg'>
														Không tìm thấy domain{' '}
														{searchTerm}
													</p>
												</div>
											)
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{showDeleteModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-purple-900/30 p-4 backdrop-blur-sm transition-all'>
					<div className='w-full max-w-md animate-fade-in overflow-hidden rounded-3xl bg-gradient-to-b from-white/80 to-white/60 p-[1px] shadow-2xl backdrop-blur-lg'>
						<div className='relative rounded-3xl bg-gradient-to-b from-white via-white to-white/90 p-6'>
							<div className='absolute -left-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-500/20 blur-2xl' />
							<div className='absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-500/20 blur-2xl' />

							<div className='relative'>
								<h3 className='mb-4 bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-xl font-bold text-transparent'>
									Xác nhận xóa domain
								</h3>
								<p className='mb-8 text-purple-700'>
									Bạn có chắc chắn muốn xóa domain "
									<span className='font-medium text-purple-900'>
										{domainToDelete}
									</span>
									" không?
								</p>

								<div className='flex flex-row justify-end gap-3'>
									<button
										onClick={() =>
											setShowDeleteModal(false)
										}
										className='rounded-xl border border-purple-100 bg-white px-6 py-2.5 font-medium text-purple-600 transition-all hover:bg-purple-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-100'
									>
										Hủy
									</button>
									<button
										onClick={handleDeleteConfirmed}
										className='rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
									>
										Xóa
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Domain;
